/**
 * Tests for `actions/wallet` — the merged wallet surface:
 *   - signing primitives (signPsbt, signMessage, broadcastPsbt)
 *   - account-aware reads (getAccountBalance, getAccountUtxos)
 *   - composed write (sendBtc)
 *
 * @remarks
 * Mock client, mock signer, mock data source. The composition tests
 * (sendBtc, broadcastPsbt) exercise the `getAction` cascade — they
 * pin the override-respecting behavior we wired through `.extend()`.
 *
 * The delegation tests (getAccountBalance → getAddressBalance,
 * getAccountUtxos → getAddressUtxos) pin the layering we put in
 * place during the public/wallet rename.
 */

import { describe, expect, it, vi } from 'vitest'
import { createWalletAccount } from '../../account/wallet-account'
import { AddressType } from '../../types/psbt'
import {
  broadcastPsbt,
  getAccountBalance,
  getAccountUtxos,
  sendBtc,
  signMessage,
  signPsbt,
  walletBtcActions,
} from '../../actions/wallet'

/** A WalletAccount with payment + ordinals on the same key (Unisat-style). */
function makeAccount() {
  return createWalletAccount({
    addresses: [
      {
        address: 'bc1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5sspknck9',
        purpose: 'payment',
        type: AddressType.P2TR,
      },
      {
        address: 'bc1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5sspknck9',
        purpose: 'ordinals',
        type: AddressType.P2TR,
      },
    ],
    publicKeys: {
      payment: '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
      ordinals: '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
      taproot: '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
    },
  })
}

/**
 * Build a mock wallet client.
 *
 * @remarks
 * Extra keys passed in `overrides` are merged onto the resulting client
 * object so `getAction` can find them via implicit (`actionFn.name`)
 * lookup. This is how we simulate ".extend() installed an override."
 */
function makeWalletClient(opts: {
  dataSource?: Record<string, any>
  signer?: any
  overrides?: Record<string, any>
}): any {
  const account = makeAccount()
  return {
    config: {
      network: { id: 'mainnet', type: 'mainnet' },
      dataSource: opts.dataSource ?? {},
      account,
      signer: opts.signer,
    },
    ...opts.overrides,
  }
}

// ============================================================================
// signPsbt
// ============================================================================

describe('signPsbt', () => {
  it('delegates to client.config.signer.signPsbt', async () => {
    const signed = { psbtHex: 'deadbeef', psbtBase64: 'b64', txHex: 'txhex' }
    const signer = { signPsbt: vi.fn(async () => signed) }
    const client = makeWalletClient({ signer })

    const opts = { finalize: true }
    await expect(signPsbt(client, 'unsigned-psbt', opts)).resolves.toBe(signed)
    expect(signer.signPsbt).toHaveBeenCalledWith('unsigned-psbt', opts)
  })

  it('throws a clear error when no signer is configured', async () => {
    const client = makeWalletClient({})
    await expect(signPsbt(client, 'psbt')).rejects.toThrow(/No signer configured/)
  })
})

describe('signMessage', () => {
  it('delegates to signer.signMessage, defaulting `address` to the payment address', async () => {
    const signer = { signMessage: vi.fn(async () => 'signature') }
    const client = makeWalletClient({ signer })

    await expect(signMessage(client, 'hello')).resolves.toBe('signature')
    expect(signer.signMessage).toHaveBeenCalledWith('hello', {
      address: client.config.account.getAddress('payment'),
    })
  })

  it('honors an explicit options.address', async () => {
    const signer = { signMessage: vi.fn(async () => 'signature') }
    const client = makeWalletClient({ signer })

    await signMessage(client, 'hello', { address: 'bc1pcustom' })
    expect(signer.signMessage).toHaveBeenCalledWith('hello', { address: 'bc1pcustom' })
  })

  it('throws when no signer is configured', async () => {
    const client = makeWalletClient({})
    await expect(signMessage(client, 'hello')).rejects.toThrow(/No signer configured/)
  })
})

// ============================================================================
// getAccountBalance — delegation
// ============================================================================

describe('getAccountBalance', () => {
  it('resolves the payment address from the account and delegates to getAddressBalance (via data source)', async () => {
    const btcGetBalance = vi.fn(async () => '99999')
    const client = makeWalletClient({ dataSource: { btcGetBalance } })

    await expect(getAccountBalance(client)).resolves.toBe('99999')
    expect(btcGetBalance).toHaveBeenCalledWith(client.config.account.getAddress('payment'))
  })

  it('uses the explicit `purpose` arg when provided', async () => {
    const btcGetBalance = vi.fn(async () => '0')
    const client = makeWalletClient({ dataSource: { btcGetBalance } })

    await getAccountBalance(client, undefined, 'ordinals')
    expect(btcGetBalance).toHaveBeenCalledWith(client.config.account.getAddress('ordinals'))
  })

  it('uses the explicit `account` arg when provided (not client.config.account)', async () => {
    const btcGetBalance = vi.fn(async () => '0')
    const client = makeWalletClient({ dataSource: { btcGetBalance } })

    const otherAccount = createWalletAccount({
      addresses: [
        {
          address: 'bc1pother',
          purpose: 'payment',
          type: AddressType.P2TR,
        },
      ],
      publicKeys: {
        payment: '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
      } as any,
    })

    await getAccountBalance(client, otherAccount, 'payment')
    expect(btcGetBalance).toHaveBeenCalledWith('bc1pother')
  })
})

// ============================================================================
// getAccountUtxos — delegation
// ============================================================================

describe('getAccountUtxos', () => {
  it('resolves address from (account, purpose) and delegates to btcGetAddressUtxos', async () => {
    const result = { data: [], pagination: { offset: 0, limit: 50, total: 0 } }
    const btcGetAddressUtxos = vi.fn(async () => result)
    const client = makeWalletClient({ dataSource: { btcGetAddressUtxos } })

    await expect(getAccountUtxos(client, client.config.account)).resolves.toBe(result)
    expect(btcGetAddressUtxos).toHaveBeenCalledWith(
      client.config.account.getAddress('payment'),
      undefined
    )
  })

  it('threads the explicit purpose through', async () => {
    const btcGetAddressUtxos = vi.fn(async () => ({ data: [], pagination: {} }))
    const client = makeWalletClient({ dataSource: { btcGetAddressUtxos } })

    await getAccountUtxos(client, client.config.account, 'ordinals')
    expect(btcGetAddressUtxos).toHaveBeenCalledWith(
      client.config.account.getAddress('ordinals'),
      undefined
    )
  })
})

// ============================================================================
// broadcastPsbt — composes via getAction
// ============================================================================

describe('broadcastPsbt', () => {
  it('composes signPsbt(finalize:true) → broadcastTransaction(txHex)', async () => {
    const signer = {
      signPsbt: vi.fn(async () => ({
        psbtHex: 'h',
        psbtBase64: 'b',
        txHex: 'finaltxhex',
      })),
    }
    const btcBroadcastTransaction = vi.fn(async () => 'broadcast-txid')
    const client = makeWalletClient({ signer, dataSource: { btcBroadcastTransaction } })

    await expect(broadcastPsbt(client, 'unsigned-psbt')).resolves.toBe('broadcast-txid')
    expect(signer.signPsbt).toHaveBeenCalledWith('unsigned-psbt', { finalize: true })
    expect(btcBroadcastTransaction).toHaveBeenCalledWith('finaltxhex')
  })

  it('throws when signer fails to return finalized tx hex', async () => {
    const signer = {
      signPsbt: vi.fn(async () => ({ psbtHex: 'h', psbtBase64: 'b', txHex: undefined })),
    }
    const client = makeWalletClient({
      signer,
      dataSource: { btcBroadcastTransaction: vi.fn() },
    })

    await expect(broadcastPsbt(client, 'unsigned-psbt')).rejects.toThrow(
      /did not return transaction hex/
    )
  })

  it('honors a client-installed signPsbt override (override cascade)', async () => {
    const signOverride = vi.fn(async () => ({
      psbtHex: 'h',
      psbtBase64: 'b',
      txHex: 'overridden-txhex',
    }))
    const btcBroadcastTransaction = vi.fn(async () => 'broadcast-txid')
    const client = makeWalletClient({
      dataSource: { btcBroadcastTransaction },
      overrides: { signPsbt: signOverride },
    })

    await broadcastPsbt(client, 'unsigned-psbt')
    expect(signOverride).toHaveBeenCalledWith('unsigned-psbt', { finalize: true })
    expect(btcBroadcastTransaction).toHaveBeenCalledWith('overridden-txhex')
  })
})

// ============================================================================
// sendBtc — full composition
// ============================================================================

describe('sendBtc', () => {
  // A UTXO with enough value to cover the test send + fees. Field
  // names match the canonical `UTXO` shape (txid/vout/value/status).
  const MOCK_UTXO = {
    txid: 'a'.repeat(64),
    vout: 0,
    value: 100000,
    status: {
      confirmed: true,
      block_height: 800000,
      block_hash: 'c'.repeat(64),
      block_time: 1700000000,
    },
  }

  it('composes getAccountUtxos → buildPsbt → signPsbt(finalize) → broadcastTransaction', async () => {
    const btcGetAddressUtxos = vi.fn(async () => ({
      data: [MOCK_UTXO],
      pagination: { offset: 0, limit: 50, total: 1 },
    }))
    const btcBroadcastTransaction = vi.fn(async () => 'final-txid')
    const signer = {
      signPsbt: vi.fn(async (_psbt: string, _opts: any) => ({
        psbtHex: 'h',
        psbtBase64: 'b',
        txHex: 'finalized-tx-hex',
      })),
    }
    const client = makeWalletClient({
      signer,
      dataSource: { btcGetAddressUtxos, btcBroadcastTransaction },
    })

    await expect(
      sendBtc(client, { to: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', amount: 1000 })
    ).resolves.toBe('final-txid')

    // UTXOs for payment address.
    expect(btcGetAddressUtxos).toHaveBeenCalledWith(
      client.config.account.getAddress('payment'),
      undefined
    )
    // Sign with finalize: true, broadcast: false (the composed
    // broadcaster does the actual broadcast).
    expect(signer.signPsbt).toHaveBeenCalledTimes(1)
    expect(signer.signPsbt.mock.calls[0][1]).toEqual({ finalize: true, broadcast: false })
    // Broadcast the finalized tx hex from the signer.
    expect(btcBroadcastTransaction).toHaveBeenCalledWith('finalized-tx-hex')
  })

  it('uses a client-installed sub-action override inside the composed body', async () => {
    // `sendBtc`'s body composes three sub-actions through `getAction`:
    //   getAccountUtxos / signPsbt / broadcastTransaction.
    // Each is override-aware. Here we install a custom `signPsbt`
    // method on the client and confirm sendBtc's middle step routes
    // through it instead of `client.config.signer`. This is the
    // override-cascade behavior the registry + .extend() chokepoint
    // is meant to make safe.
    const btcGetAddressUtxos = vi.fn(async () => ({
      data: [MOCK_UTXO],
      pagination: { offset: 0, limit: 50, total: 1 },
    }))
    const btcBroadcastTransaction = vi.fn(async () => 'final-txid')
    const signPsbtOverride = vi.fn(async () => ({
      psbtHex: 'h',
      psbtBase64: 'b',
      txHex: 'override-finalized-hex',
    }))
    const realSigner = { signPsbt: vi.fn() } // should NOT be called.
    const client = makeWalletClient({
      signer: realSigner,
      dataSource: { btcGetAddressUtxos, btcBroadcastTransaction },
      overrides: { signPsbt: signPsbtOverride },
    })

    await sendBtc(client, { to: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', amount: 1000 })

    expect(signPsbtOverride).toHaveBeenCalledTimes(1)
    expect(realSigner.signPsbt).not.toHaveBeenCalled()
    expect(btcBroadcastTransaction).toHaveBeenCalledWith('override-finalized-hex')
  })
})

// ============================================================================
// walletBtcActions() factory
// ============================================================================

describe('walletBtcActions()', () => {
  it('exposes the full merged surface (signing + account-aware reads + sendBtc)', () => {
    const client = makeWalletClient({})
    const methods = walletBtcActions()(client)

    // Signing primitives
    expect(typeof methods.signPsbt).toBe('function')
    expect(typeof methods.signMessage).toBe('function')
    expect(typeof methods.broadcastPsbt).toBe('function')
    // Reads
    expect(typeof methods.getAccountBalance).toBe('function')
    expect(typeof methods.getAccountUtxos).toBe('function')
    // Write
    expect(typeof methods.sendBtc).toBe('function')
  })
})
