import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DataSourceContext } from '../../types'
import { alkaneCapabilities } from '../../vendors/sandshrew/alkanes'
import { baseCapabilities } from '../../vendors/sandshrew/base'
import { inscriptionCapabilities } from '../../vendors/sandshrew/inscriptions'
import { runeCapabilities } from '../../vendors/sandshrew/runes'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('sandshrew vendor', () => {
  const ctx: DataSourceContext = {
    network: 'mainnet',
    config: {},
  }

  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('baseCapabilities', () => {
    it('should return btc capability group', () => {
      const factory = baseCapabilities()
      const group = factory(ctx)
      expect(group.group).toBe('btc')
      expect(group.methods.btcGetBalance).toBeDefined()
      expect(group.methods.btcGetAddressUtxos).toBeDefined()
      expect(group.methods.btcGetTransaction).toBeDefined()
    })

    it('should fetch balance via esplora RPC', async () => {
      const factory = baseCapabilities()
      const { methods } = factory(ctx)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 'esplora_address',
          result: {
            chain_stats: {
              funded_txo_sum: '200000',
              spent_txo_sum: '50000',
            },
          },
        }),
      })

      const balance = await methods.btcGetBalance('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')
      expect(balance).toBe('150000')
    })

    it('should fetch fee estimates', async () => {
      const factory = baseCapabilities()
      const { methods } = factory(ctx)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          id: 'esplora_fee-estimates',
          result: { '1': 20.5, '2': 15.0, '6': 10.0, '25': 5.0 },
        }),
      })

      const fees = await methods.btcGetRecommendedFees()
      expect(fees.fastFee).toBe(21)
      expect(fees.minFee).toBe(5)
    })
  })

  describe('runeCapabilities', () => {
    it('should return runes capability group', () => {
      const factory = runeCapabilities()
      const group = factory(ctx)
      expect(group.group).toBe('runes')
      expect(group.methods.runesGetAddressBalances).toBeDefined()
      expect(group.methods.runesGetById).toBeDefined()
      expect(group.methods.runesGetByName).toBeDefined()
      expect(group.methods.runesGetOutpoints).toBeDefined()
    })

    it('should fetch rune balances for address', async () => {
      const factory = runeCapabilities()
      const { methods } = factory(ctx)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          result: {
            runes_balances: [
              ['SOME•RUNE', '1000', '★'],
              ['ANOTHER•RUNE', '500', '◆'],
            ],
          },
        }),
      })

      const result = await methods.runesGetAddressBalances('bc1qtest')
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('SOME•RUNE')
      expect(result.data[0].balance).toBe('1000')
    })
  })

  describe('alkaneCapabilities', () => {
    it('should return alkanes capability group', () => {
      const factory = alkaneCapabilities()
      const group = factory(ctx)
      expect(group.group).toBe('alkanes')
      expect(group.methods.alkanesGetAddressBalances).toBeDefined()
      expect(group.methods.alkanesGetByAddress).toBeDefined()
    })
  })

  describe('inscriptionCapabilities', () => {
    it('should return inscriptions capability group', () => {
      const factory = inscriptionCapabilities()
      const group = factory(ctx)
      expect(group.group).toBe('inscriptions')
      expect(group.methods.inscriptionsGetByAddress).toBeDefined()
      expect(group.methods.inscriptionsGetInfo).toBeDefined()
      expect(group.methods.inscriptionsBatchGetInfo).toBeDefined()
    })
  })
})
