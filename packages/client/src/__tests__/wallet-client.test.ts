import { describe, expect, it } from 'vitest'
import { createWalletAccount } from '../account'
import { createChainDataSource } from '../data-source'
import { NetworkMismatchError } from '../errors'
import type { BaseCapability, DataSourceContext } from '../types'
import { AddressType } from '../types/psbt'
import { createWalletClient } from '../wallet-client'

function makeMockBaseDs(network = 'mainnet') {
  return createChainDataSource({ network }).extend((_ctx: DataSourceContext) => ({
    group: 'btc',
    methods: {
      btcGetBalance: async (_addr: string) => '50000',
      btcGetAddressUtxos: async (_addr: string) => ({ data: [] }),
      btcGetTransaction: async (_txId: string) => ({
        txid: 'abc',
        version: 2,
        locktime: 0,
        vin: [],
        vout: [],
        size: 100,
        weight: 400,
        fee: 500,
        status: {
          confirmed: true,
          block_height: 100,
          block_hash: 'hash',
          block_time: 1000,
        },
      }),
      btcBroadcastTransaction: async (_rawTx: string) => 'txid123',
      btcGetRecommendedFees: async () => ({ fastFee: 10, minFee: 1 }),
      btcGetOutputValue: async (_txId: string, _vout: number) => 546 as number | null,
      btcWaitForTransaction: async (_txId: string) => true,
    } satisfies BaseCapability,
  }))
}

describe('createWalletClient', () => {
  it('should create a wallet client with account', () => {
    const account = createWalletAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    const ds = makeMockBaseDs('mainnet')
    const client = createWalletClient({ network: 'mainnet', dataSource: ds, account })

    expect(client.network).toBe('mainnet')
    expect(client.dataSource).toBe(ds)
    expect(client.account).toBe(account)
  })

  it('should add signing actions via extend', async () => {
    const account = createWalletAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    const signer = {
      signPsbt: async () => ({ psbtHex: 'signed' }),
      signMessage: async () => 'signature',
    }

    const ds = makeMockBaseDs('mainnet')
    const client = createWalletClient({ network: 'mainnet', dataSource: ds, account }).extend(
      () => ({
        signPsbt: (psbt: string) => signer.signPsbt({ psbt }),
        signMessage: (msg: string) => signer.signMessage(msg),
      })
    )

    expect(await client.signPsbt('psbt')).toEqual({ psbtHex: 'signed' })
    expect(await client.signMessage('hello')).toBe('signature')
  })

  it('should throw NetworkMismatchError when networks differ', () => {
    const account = createWalletAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    const ds = makeMockBaseDs('mainnet')
    expect(() => createWalletClient({ network: 'testnet', dataSource: ds, account })).toThrow(
      NetworkMismatchError
    )
  })

  it('should support extend with actions', async () => {
    const account = createWalletAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    const ds = makeMockBaseDs('mainnet')
    const client = createWalletClient({ network: 'mainnet', dataSource: ds, account }).extend(
      c => ({
        getBalance: () => c.dataSource.btcGetBalance(c.account.getAddress('payment')),
      })
    )

    const balance = await client.getBalance()
    expect(balance).toBe('50000')
  })

  it('should support chaining multiple action groups', async () => {
    const account = createWalletAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    const ds = makeMockBaseDs('mainnet')
    const client = createWalletClient({ network: 'mainnet', dataSource: ds, account })
      .extend(c => ({
        getBalance: () => c.dataSource.btcGetBalance(c.account.getAddress('payment')),
      }))
      .extend(c => ({
        getUtxos: () => c.dataSource.btcGetAddressUtxos(c.account.getAddress('payment')),
      }))

    const balance = await client.getBalance()
    const utxos = await client.getUtxos()

    expect(balance).toBe('50000')
    expect(utxos.data).toEqual([])
  })
})
