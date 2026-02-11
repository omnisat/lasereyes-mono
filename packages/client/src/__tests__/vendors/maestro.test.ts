import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DataSourceContext } from '../../types'
import { baseCapabilities } from '../../vendors/maestro/base'
import { brc20Capabilities } from '../../vendors/maestro/brc20'
import { inscriptionCapabilities } from '../../vendors/maestro/inscriptions'
import { runeCapabilities } from '../../vendors/maestro/runes'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('maestro vendor', () => {
  const config = { apiKey: 'test-key' }
  const ctx: DataSourceContext = {
    network: 'mainnet',
    config: {},
  }

  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('baseCapabilities', () => {
    it('should return base capability group', () => {
      const factory = baseCapabilities(config)
      const group = factory(ctx)
      expect(group.group).toBe('base')
      expect(group.methods.getBalance).toBeDefined()
      expect(group.methods.getRecommendedFees).toBeDefined()
      expect(group.methods.broadcastTransaction).toBeDefined()
    })

    it('should fetch balance', async () => {
      const factory = baseCapabilities(config)
      const { methods } = factory(ctx)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: '123456' }),
      })

      const balance = await methods.getBalance('bc1qtest')
      expect(balance).toBe('123456')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/addresses/bc1qtest/balance'),
        expect.objectContaining({
          headers: expect.objectContaining({ 'api-key': 'test-key' }),
        })
      )
    })

    it('should fetch recommended fees', async () => {
      const factory = baseCapabilities(config)
      const { methods } = factory(ctx)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ sats_per_vb: { min: 3, median: 15, max: 30 } }],
        }),
      })

      const fees = await methods.getRecommendedFees()
      expect(fees.fastFee).toBe(15)
      expect(fees.minFee).toBe(3)
    })
  })

  describe('inscriptionCapabilities', () => {
    it('should return inscription capability group', () => {
      const factory = inscriptionCapabilities(config)
      const group = factory(ctx)
      expect(group.group).toBe('inscription')
      expect(group.methods.getAddressInscriptions).toBeDefined()
      expect(group.methods.getInscriptionInfo).toBeDefined()
    })
  })

  describe('brc20Capabilities', () => {
    it('should return brc20 capability group', () => {
      const factory = brc20Capabilities(config)
      const group = factory(ctx)
      expect(group.group).toBe('brc20')
      expect(group.methods.getAddressBrc20Balances).toBeDefined()
      expect(group.methods.getBrc20ByTicker).toBeDefined()
    })

    it('should fetch BRC-20 balances', async () => {
      const factory = brc20Capabilities(config)
      const { methods } = factory(ctx)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            ordi: { total: '1000', available: '800' },
            sats: { total: '5000', available: '5000' },
          },
        }),
      })

      const balances = await methods.getAddressBrc20Balances('bc1qtest')
      expect(balances).toHaveLength(2)
      expect(balances[0].ticker).toBe('ordi')
      expect(balances[0].overall).toBe('1000')
      expect(balances[0].available).toBe('800')
    })
  })

  describe('runeCapabilities', () => {
    it('should return rune capability group with partial methods', () => {
      const factory = runeCapabilities(config)
      const group = factory(ctx)
      expect(group.group).toBe('rune')
      expect(group.methods.getRuneById).toBeDefined()
      expect(group.methods.getRuneByName).toBeDefined()
    })

    it('should fetch rune by ID', async () => {
      const factory = runeCapabilities(config)
      const { methods } = factory(ctx)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: '840000:1',
            name: 'TESTRUNE',
            spaced_name: 'TEST•RUNE',
            symbol: '★',
            divisibility: 8,
            premine: '0',
            etching_tx: 'abc',
            etching_height: 840000,
            max_supply: '21000000',
            circulating_supply: '1000000',
            mints: 100,
            terms: {},
          },
        }),
      })

      const rune = await methods.getRuneById('840000:1')
      expect(rune.id).toBe('840000:1')
      expect(rune.entry.spaced_rune).toBe('TEST•RUNE')
    })
  })
})
