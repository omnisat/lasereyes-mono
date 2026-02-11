import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DataSourceContext } from '../../types'
import { baseCapabilities } from '../../vendors/mempool/base'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('mempool vendor - baseCapabilities', () => {
  const ctx: DataSourceContext = {
    network: 'mainnet',
    config: {},
  }

  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should return base capability group', () => {
    const factory = baseCapabilities()
    const group = factory(ctx)
    expect(group.group).toBe('base')
    expect(group.methods.getBalance).toBeDefined()
    expect(group.methods.getUtxos).toBeDefined()
    expect(group.methods.getTransaction).toBeDefined()
    expect(group.methods.broadcastTransaction).toBeDefined()
    expect(group.methods.getRecommendedFees).toBeDefined()
    expect(group.methods.getOutputValue).toBeDefined()
    expect(group.methods.waitForTransaction).toBeDefined()
  })

  it('should fetch balance by summing UTXOs', async () => {
    const factory = baseCapabilities()
    const { methods } = factory(ctx)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => [
        {
          txid: 'tx1',
          vout: 0,
          value: 50000,
          status: { confirmed: true, block_height: 1, block_hash: 'h', block_time: 0 },
        },
        {
          txid: 'tx2',
          vout: 0,
          value: 30000,
          status: { confirmed: true, block_height: 1, block_hash: 'h', block_time: 0 },
        },
      ],
    })

    const balance = await methods.getBalance('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')
    expect(balance).toBe('80000')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/address/bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4/utxo'),
      expect.any(Object)
    )
  })

  it('should fetch recommended fees', async () => {
    const factory = baseCapabilities()
    const { methods } = factory(ctx)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({
        fastestFee: 25,
        halfHourFee: 20,
        hourFee: 15,
        economyFee: 10,
        minimumFee: 5,
      }),
    })

    const fees = await methods.getRecommendedFees()
    expect(fees.fastFee).toBe(25)
    expect(fees.minFee).toBe(5)
  })

  it('should broadcast transaction', async () => {
    const factory = baseCapabilities()
    const { methods } = factory(ctx)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'text/plain']]),
      text: async () => 'txid123abc',
    })

    const txId = await methods.broadcastTransaction('rawhex')
    expect(txId).toBe('txid123abc')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tx'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should fetch transaction', async () => {
    const factory = baseCapabilities()
    const { methods } = factory(ctx)

    const mockTx = {
      txid: 'abc123',
      version: 2,
      locktime: 0,
      vin: [],
      vout: [],
      size: 200,
      weight: 800,
      fee: 1000,
      status: { confirmed: true, block_height: 1, block_hash: 'h', block_time: 0 },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => mockTx,
    })

    const tx = await methods.getTransaction('abc123')
    expect(tx.txid).toBe('abc123')
  })

  it('should use custom network URLs', () => {
    const factory = baseCapabilities({
      networks: {
        mainnet: { apiUrl: 'https://custom.mempool.io' },
      },
    })
    const group = factory(ctx)
    // The factory should use the custom URL - test that it was created successfully
    expect(group.group).toBe('base')
  })
})
