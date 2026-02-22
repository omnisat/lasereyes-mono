import { describe, expect, it } from 'vitest'
import { createChainDataSource } from '../data-source'
import type { DataSourceContext } from '../types'

describe('createChainDataSource', () => {
  it('should create a data source with given network', () => {
    const ds = createChainDataSource({ network: 'mainnet' })
    expect(ds.network).toBe('mainnet')
  })

  it('should start with empty capabilities', () => {
    const ds = createChainDataSource({ network: 'mainnet' })
    expect(ds.getCapabilities()).toEqual({})
  })

  it('should accumulate capabilities via extend', () => {
    const ds = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'btc',
      methods: {
        btcGetBalance: async (_address: string) => '100',
        btcGetAddressUtxos: async (_address: string) => ({ data: [] }),
      },
    }))

    expect(ds.getCapabilities()).toEqual({
      btc: ['btcGetBalance', 'btcGetAddressUtxos'],
    })
  })

  it('should make extended methods available on the data source', async () => {
    const ds = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'btc',
      methods: {
        btcGetBalance: async (_address: string) => '12345',
      },
    }))

    const balance = await ds.btcGetBalance('bc1test')
    expect(balance).toBe('12345')
  })

  it('should chain multiple extensions', () => {
    const ds = createChainDataSource({ network: 'mainnet' })
      .extend(_ctx => ({
        group: 'btc',
        methods: {
          btcGetBalance: async (_addr: string) => '0',
        },
      }))
      .extend(_ctx => ({
        group: 'runes',
        methods: {
          runesGetById: async (_id: string) => ({ id: _id }),
        },
      }))

    const caps = ds.getCapabilities()
    expect(caps.btc).toEqual(['btcGetBalance'])
    expect(caps.runes).toEqual(['runesGetById'])
  })

  it('should pass network in context to factory', () => {
    let receivedNetwork = ''
    createChainDataSource({ network: 'signet' }).extend(ctx => {
      receivedNetwork = ctx.network
      return { group: 'test', methods: {} }
    })
    expect(receivedNetwork).toBe('signet')
  })
})
