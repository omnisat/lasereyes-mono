import { describe, expect, it } from 'vitest'
import { createChainDataSource, mergeDataSources } from '../data-source'
import { NetworkMismatchError } from '../errors'
import type { DataSourceContext } from '../types'

describe('mergeDataSources', () => {
  it('should merge capabilities from both data sources', () => {
    const ds1 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'base',
      methods: {
        getBalance: async () => '100',
      },
    }))

    const ds2 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'rune',
      methods: {
        getRuneById: async () => ({ id: 'test' }),
      },
    }))

    const merged = mergeDataSources(ds1, ds2)
    const caps = merged.getCapabilities()

    expect(caps.base).toEqual(['getBalance'])
    expect(caps.rune).toEqual(['getRuneById'])
  })

  it('should give primary precedence on overlapping methods', async () => {
    const ds1 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'base',
      methods: {
        getBalance: async () => 'primary',
      },
    }))

    const ds2 = createChainDataSource({ network: 'mainnet' }).extend((_ctx: DataSourceContext) => ({
      group: 'base',
      methods: {
        getBalance: async () => 'secondary',
      },
    }))

    const merged = mergeDataSources(ds1, ds2)
    const result = await (merged as any).getBalance()
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
      group: 'base',
      methods: {
        getBalance: async () => '0',
        getUtxos: async () => [],
      },
    }))

    const ds2 = createChainDataSource({ network: 'mainnet' }).extend(() => ({
      group: 'base',
      methods: {
        getBalance: async () => '0',
        getTransaction: async () => ({}),
      },
    }))

    const merged = mergeDataSources(ds1, ds2)
    const caps = merged.getCapabilities()
    expect(caps.base).toContain('getBalance')
    expect(caps.base).toContain('getUtxos')
    expect(caps.base).toContain('getTransaction')
  })
})
