import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { MaestroDataSource } from '../src/lib/data-sources/sources/maestro-ds'
import type {
  MaestroGetAddressInscriptions,
  MaestroAddressInscription,
} from '../src/types/maestro'
import { getMaestroUrl, MAESTRO_API_KEY_MAINNET } from '../src/lib/urls'
import { MAINNET } from '../src/constants'

vi.mock('axios')
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> }

describe('MaestroDataSource', () => {
  const address = 'test-address'
  const config = {
    networks: {
      mainnet: {
        apiUrl: getMaestroUrl(MAINNET),
        apiKey: MAESTRO_API_KEY_MAINNET,
      },
    },
  }
  let ds: MaestroDataSource

  beforeEach(() => {
    ds = new MaestroDataSource('mainnet', config as any)
    mockedAxios.get.mockReset()
  })

  it('fetches inscriptions with offset=0, limit=2', async () => {
    const apiResponse: MaestroGetAddressInscriptions = {
      data: [
        {
          inscription_id: 'a',
          satoshis: '1',
          utxo_sat_offset: 0,
          utxo_txid: 'tx1',
          utxo_vout: 0,
          utxo_block_height: 1,
          utxo_confirmations: 1,
        },
        {
          inscription_id: 'b',
          satoshis: '2',
          utxo_sat_offset: 0,
          utxo_txid: 'tx2',
          utxo_vout: 0,
          utxo_block_height: 2,
          utxo_confirmations: 2,
        },
      ],
      last_updated: { block_hash: 'hash', block_height: 1 },
      next_cursor: 'cursor1',
    }
    mockedAxios.get.mockResolvedValueOnce({ data: apiResponse })
    const result = await ds.getAddressInscriptions(address, 0, 2)
    expect(result.data.length).toBe(2)
    expect((result.data[0] as any).address).toBe(address)
    expect(result.data[1].inscription_id).toBe('b')
  })

  it('fetches inscriptions with offset > 0 (pagination)', async () => {
    // First call: skip 2 (count=2)
    const page1: MaestroGetAddressInscriptions = {
      data: [
        {
          inscription_id: 'a',
          satoshis: '1',
          utxo_sat_offset: 0,
          utxo_txid: 'tx1',
          utxo_vout: 0,
          utxo_block_height: 1,
          utxo_confirmations: 1,
        },
        {
          inscription_id: 'b',
          satoshis: '2',
          utxo_sat_offset: 0,
          utxo_txid: 'tx2',
          utxo_vout: 0,
          utxo_block_height: 2,
          utxo_confirmations: 2,
        },
      ],
      last_updated: { block_hash: 'hash', block_height: 1 },
      next_cursor: 'cursor2',
    }
    // Second call: fetch next 2
    const page2: MaestroGetAddressInscriptions = {
      data: [
        {
          inscription_id: 'c',
          satoshis: '3',
          utxo_sat_offset: 0,
          utxo_txid: 'tx3',
          utxo_vout: 0,
          utxo_block_height: 3,
          utxo_confirmations: 3,
        },
        {
          inscription_id: 'd',
          satoshis: '4',
          utxo_sat_offset: 0,
          utxo_txid: 'tx4',
          utxo_vout: 0,
          utxo_block_height: 4,
          utxo_confirmations: 4,
        },
      ],
      last_updated: { block_hash: 'hash', block_height: 1 },
      next_cursor: 'cursor3',
    }
    mockedAxios.get
      .mockResolvedValueOnce({ data: page1 }) // skip offset
      .mockResolvedValueOnce({ data: page2 }) // fetch limit
    const result = await ds.getAddressInscriptions(address, 2, 2)
    expect(result.data.length).toBe(2)
    expect(result.data[0].inscription_id).toBe('c')
    expect((result.data[0] as any).address).toBe(address)
  })

  it('returns empty if offset is beyond available data', async () => {
    const page1: MaestroGetAddressInscriptions = {
      data: [],
      last_updated: { block_hash: 'hash', block_height: 1 },
      next_cursor: '',
    }
    mockedAxios.get.mockImplementation(() => Promise.resolve({ data: page1 }))
    const result = await ds.getAddressInscriptions(address, 100, 10)
    expect(result.data.length).toBe(0)
  })
})
