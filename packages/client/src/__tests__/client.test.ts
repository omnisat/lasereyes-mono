import { describe, expect, it } from 'vitest'
import { createClient } from '../client'
import { createChainDataSource } from '../data-source'
import { NetworkMismatchError } from '../errors'
import type { BaseCapability, DataSourceContext } from '../types'

function makeMockBaseDs(network = 'mainnet') {
  return createChainDataSource({ network }).extend((_ctx: DataSourceContext) => ({
    group: 'base',
    methods: {
      getBalance: async (_addr: string) => '50000',
      getUtxos: async (_addr: string) => ({ data: [] }),
      getTransaction: async (_txId: string) => ({
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
      broadcastTransaction: async (_rawTx: string) => 'txid123',
      getRecommendedFees: async () => ({ fastFee: 10, minFee: 1 }),
      getOutputValue: async (_txId: string, _vout: number) => 546 as number | null,
      waitForTransaction: async (_txId: string) => true,
    } satisfies BaseCapability,
  }))
}

describe('createClient', () => {
  it('should create a client with matching network', () => {
    const ds = makeMockBaseDs('mainnet')
    const client = createClient({ network: 'mainnet', dataSource: ds })
    expect(client.network).toBe('mainnet')
    expect(client.dataSource).toBe(ds)
  })

  it('should throw NetworkMismatchError when networks differ', () => {
    const ds = makeMockBaseDs('mainnet')
    expect(() => createClient({ network: 'testnet', dataSource: ds })).toThrow(NetworkMismatchError)
  })

  it('should support extend with actions', async () => {
    const ds = makeMockBaseDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(c => ({
      myAction: async () => {
        const balance = await c.dataSource.getBalance('addr')
        return `balance: ${balance}`
      },
    }))

    const result = await client.myAction()
    expect(result).toBe('balance: 50000')
  })

  it('should chain multiple extensions', () => {
    const ds = makeMockBaseDs()
    const client = createClient({ network: 'mainnet', dataSource: ds })
      .extend(() => ({
        action1: () => 'one',
      }))
      .extend(() => ({
        action2: () => 'two',
      }))

    expect(client.action1()).toBe('one')
    expect(client.action2()).toBe('two')
  })

  it('should provide access to data source from extensions', async () => {
    const ds = makeMockBaseDs()
    const client = createClient({ network: 'mainnet', dataSource: ds }).extend(c => ({
      getNetworkInfo: () => ({
        network: c.network,
        caps: c.dataSource.getCapabilities(),
      }),
    }))

    const info = client.getNetworkInfo()
    expect(info.network).toBe('mainnet')
    expect(info.caps.base).toBeDefined()
  })
})
