import { describe, expect, it } from 'vitest'
import { createChainDataSource, mergeDataSources } from '../data-source'
import { NetworkMismatchError } from '../errors'
import type { DataSourceContext } from '../types'

describe('mergeDataSources', () => {
  it('should merge capabilities from both data sources', () => {
    const ds1 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'btc',
      methods: {
        btcGetBalance: async () => '100',
      },
    }))

    const ds2 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'runes',
      methods: {
        runesGetById: async () => ({ id: 'test' }),
      },
    }))

    const merged = mergeDataSources(ds1, ds2)
    const caps = merged.getCapabilities()

    expect(caps.btc).toEqual(['btcGetBalance'])
    expect(caps.runes).toEqual(['runesGetById'])
  })

  it('should give primary precedence on overlapping methods', async () => {
    const ds1 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'btc',
      methods: {
        btcGetBalance: async () => 'primary',
      },
    }))

    const ds2 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'btc',
      methods: {
        btcGetBalance: async () => 'secondary',
      },
    }))

    const merged = mergeDataSources(ds1, ds2)
    const result = await (merged as any).btcGetBalance()
    expect(result).toBe('primary')
  })

  it('should throw NetworkMismatchError when networks differ', () => {
    const ds1 = createChainDataSource({ network: 'mainnet' })
    const ds2 = createChainDataSource({ network: 'testnet' })

    expect(() => mergeDataSources(ds1, ds2)).toThrow(NetworkMismatchError)
  })

  it('should preserve the primary network', () => {
    const ds1 = createChainDataSource({ network: 'mainnet' }).extend(() => ({
      group: 'a',
      methods: {},
    }))
    const ds2 = createChainDataSource({ network: 'mainnet' }).extend(() => ({
      group: 'b',
      methods: {},
    }))

    const merged = mergeDataSources(ds1, ds2)
    expect(merged.network).toBe('mainnet')
  })

  it('should merge overlapping capability groups', () => {
    const ds1 = createChainDataSource({ network: 'mainnet' }).extend(() => ({
      group: 'btc',
      methods: {
        btcGetBalance: async () => '0',
        btcGetAddressUtxos: async () => ({ data: [] }),
      },
    }))

    const ds2 = createChainDataSource({ network: 'mainnet' }).extend(() => ({
      group: 'btc',
      methods: {
        btcGetBalance: async () => '0',
        btcGetTransaction: async () => ({}),
      },
    }))

    const merged = mergeDataSources(ds1, ds2)
    const caps = merged.getCapabilities()
    expect(caps.btc).toContain('btcGetBalance')
    expect(caps.btc).toContain('btcGetAddressUtxos')
    expect(caps.btc).toContain('btcGetTransaction')
  })
})
