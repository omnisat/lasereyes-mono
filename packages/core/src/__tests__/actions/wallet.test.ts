/**
 * Tests for `core/actions/wallet` — the Phase 9 write actions over
 * `LaserEyesConfig`.
 *
 * @remarks
 * Each action's flow is:
 *   1. `getWalletClient(config)` returns the cached wallet client
 *      (built at connect time with connector overrides applied).
 *   2. `getAction(walletClient, fn, 'name')(...)` dispatches —
 *      hitting the override if present, falling through to the free
 *      function otherwise.
 *
 * These tests pin both ends: that the override IS reached when
 * installed, and that the composed free function runs when not.
 *
 * Mocks: a fake `BitcoinProvider`, a fake connector returning a
 * pre-built wallet client. No real bitcoin libs touched.
 */

import {
  type ChainNetwork,
  createChainBackend,
  MAINNET,
  type NetworkId,
} from '@omnisat/lasereyes-client'
import { AddressType } from '@omnisat/lasereyes-client/utils'
import {
  createWalletAccount,
  createWalletClient,
  type WalletAccount,
} from '@omnisat/lasereyes-client/wallet'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { broadcastPsbt, sendBtc, signMessage, signPsbt } from '../../actions/wallet'
import { createLaserEyesConfig } from '../../config'
import { createConnector } from '../../connectors/create'

beforeAll(() => {
  ;(globalThis as any).window = globalThis
})

const ADDR = 'bc1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5sspknck9'
const PUBKEY = '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'

function makeAccount(): WalletAccount {
  return createWalletAccount({
    addresses: [
      { address: ADDR, purpose: 'payment', type: AddressType.P2TR },
      { address: ADDR, purpose: 'ordinals', type: AddressType.P2TR },
    ],
    publicKeys: { payment: PUBKEY, ordinals: PUBKEY, taproot: PUBKEY } as any,
  })
}

/**
 * Build a connector that returns a pre-built wallet client (with the
 * caller-supplied overrides applied) at connect time. We bypass the
 * real `connect()` lifecycle by directly populating the cache via a
 * custom `config.client` factory pointing at a pre-extended client.
 */
function makeConfigWithWalletClient(opts: {
  overrides?: Record<string, any>
  signer?: { signPsbt?: any; signMessage?: any }
}) {
  const ds = (network: NetworkId | ChainNetwork) =>
    createChainBackend({ network }).extend(() => ({
      btcGetAddressUtxos: vi.fn(async () => ({
        data: [
          {
            txid: 'a'.repeat(64),
            vout: 0,
            value: 100000,
            status: {
              confirmed: true,
              block_height: 800000,
              block_hash: 'c'.repeat(64),
              block_time: 1700000000,
            },
          },
        ],
        pagination: { offset: 0, limit: 50, total: 1 },
      })),
      btcBroadcastTransaction: vi.fn(async () => 'broadcasted-txid'),
    }))

  const account = makeAccount()
  const signer = {
    signPsbt:
      opts.signer?.signPsbt ??
      vi.fn(async () => ({
        psbtHex: 'h',
        psbtBase64: 'b',
        txHex: 'finalized-tx-hex',
      })),
    signMessage: opts.signer?.signMessage ?? vi.fn(async () => 'signature'),
  }

  // Pretend connector that the config holds. `getAccount` is invoked
  // only inside `buildConnectorClient`, which we sidestep by using
  // `config.client` to provide our pre-built wallet client directly.
  const connector = createConnector(() => ({
    id: 'mock',
    name: 'Mock',
    isReady: () => true,
    isAuthorized: async () => true,
    connect: async () => ({ account, networkId: 'mainnet' as const }),
    disconnect: async () => {},
    getAccount: async () => account,
    getNetworkId: async () => 'mainnet' as const,
    getCapabilities: async () => ({}) as any,
    getProvider: () => null,
    onAccountChanged: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
    onNetworkChanged: () => {},
  }))

  const config = createLaserEyesConfig({
    chains: [MAINNET],
    backends: { mainnet: ds },
    connectors: [connector],
    // User-factory wins. Returns a pre-built wallet client with the
    // requested overrides merged on top.
    client: ({ chain, backend }) => {
      const wc = createWalletClient({
        network: chain,
        backend,
        account,
        signer,
      })
      return Object.assign(wc, opts.overrides ?? {})
    },
  })

  // Set the connection so `getClient(config)` resolves the active chain.
  config.state.$connection.set({
    status: 'connected',
    networkId: 'mainnet',
    account,
    connector: connector(config as any),
  })

  return { config, ds, signer }
}

// ============================================================================
// signMessage
// ============================================================================

describe('signMessage (core)', () => {
  it('dispatches through getAction to the wallet client; reaches the signer when no override', async () => {
    const { config, signer } = makeConfigWithWalletClient({})

    await expect(signMessage(config, 'hello')).resolves.toBe('signature')
    expect(signer.signMessage).toHaveBeenCalledOnce()
  })

  it('honors a client-installed signMessage override (override cascade)', async () => {
    const override = vi.fn(async () => 'override-signature')
    const { config, signer } = makeConfigWithWalletClient({
      overrides: { signMessage: override },
    })

    await expect(signMessage(config, 'hello')).resolves.toBe('override-signature')
    expect(override).toHaveBeenCalledWith('hello', undefined)
    expect(signer.signMessage).not.toHaveBeenCalled()
  })
})

// ============================================================================
// signPsbt
// ============================================================================

describe('signPsbt (core)', () => {
  it('reaches the signer when no override is installed', async () => {
    const { config, signer } = makeConfigWithWalletClient({})

    const result = await signPsbt(config, 'unsigned-psbt')
    expect(result.txHex).toBe('finalized-tx-hex')
    expect(signer.signPsbt).toHaveBeenCalledWith('unsigned-psbt', undefined)
  })

  it('honors a client-installed signPsbt override', async () => {
    const override = vi.fn(async () => ({
      psbtHex: 'h',
      psbtBase64: 'b',
      txHex: 'override-hex',
    }))
    const { config, signer } = makeConfigWithWalletClient({
      overrides: { signPsbt: override },
    })

    const result = await signPsbt(config, 'unsigned-psbt')
    expect(result.txHex).toBe('override-hex')
    expect(override).toHaveBeenCalledWith('unsigned-psbt', undefined)
    expect(signer.signPsbt).not.toHaveBeenCalled()
  })
})

// ============================================================================
// sendBtc — override path and composed path
// ============================================================================

// ============================================================================
// broadcastPsbt
// ============================================================================

describe('broadcastPsbt (core)', () => {
  it('falls through to the composed path when no override is installed (signPsbt(finalize:true) → btcBroadcastTransaction)', async () => {
    const { config, signer } = makeConfigWithWalletClient({})

    await expect(broadcastPsbt(config, 'unsigned-psbt')).resolves.toBe('broadcasted-txid')
    expect(signer.signPsbt).toHaveBeenCalledTimes(1)
    expect(signer.signPsbt.mock.calls[0][1]).toEqual({ finalize: true })
  })

  it('honors a client-installed broadcastPsbt override (connector native-RPC path)', async () => {
    // Simulates a connector with `nativeRpc.broadcastPsbt: true` —
    // its `getClient` hook installs the override that routes to
    // `provider.request('bitcoin_pushPsbt', { psbt })`.
    const override = vi.fn(async () => 'native-rpc-txid')
    const { config, signer } = makeConfigWithWalletClient({
      overrides: { broadcastPsbt: override },
    })

    await expect(broadcastPsbt(config, 'unsigned-psbt')).resolves.toBe('native-rpc-txid')
    expect(override).toHaveBeenCalledWith('unsigned-psbt')
    expect(signer.signPsbt).not.toHaveBeenCalled()
  })
})

describe('sendBtc (core)', () => {
  it('honors a client-installed sendBtc override (connector native-RPC path)', async () => {
    // Simulates a connector with `nativeRpc.sendBtc: true` — its
    // `getClient` hook installs `sendBtc: (params) => provider.request(...)`.
    // The data-action layer should hit that without going through the
    // composed PSBT path.
    const override = vi.fn(async () => 'native-rpc-txid')
    const { config } = makeConfigWithWalletClient({
      overrides: { sendBtc: override },
    })

    await expect(sendBtc(config, ADDR, 1000)).resolves.toBe('native-rpc-txid')
    expect(override).toHaveBeenCalledWith({ to: ADDR, amount: 1000 })
  })

  it('falls through to the composed PSBT path when no override is installed', async () => {
    // No `nativeRpc` flags — the wallet client has no `sendBtc` slot,
    // so `getAction` falls through to the free `sendBtc` which
    // composes getUtxos → buildPsbt → signPsbt → broadcastTransaction.
    const recipient = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    const { config, signer } = makeConfigWithWalletClient({})

    await expect(sendBtc(config, recipient, 1000)).resolves.toBe('broadcasted-txid')
    expect(signer.signPsbt).toHaveBeenCalledTimes(1)
    expect(signer.signPsbt.mock.calls[0][1]).toEqual({
      finalize: true,
      broadcast: false,
    })
  })
})
