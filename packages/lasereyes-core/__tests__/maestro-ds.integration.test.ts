import { describe, it, expect } from 'vitest'
import { MaestroDataSource } from '../src/lib/data-sources/sources/maestro-ds'
import { getMaestroUrl, MAESTRO_API_KEY_MAINNET } from '../src/lib/urls'
import { MAINNET } from '../src/constants'

// Integration test for MaestroDataSource (no axios mocking)
const realAddress =
  'bc1p47ta74hclhr5vz4h0e5qsmn4nu9uyg8ltfjtuanwyn6uk9yl428s2muzu3'
const config = {
  networks: {
    mainnet: {
      apiUrl: getMaestroUrl(MAINNET),
      apiKey: MAESTRO_API_KEY_MAINNET,
    },
  },
}
const ds = new MaestroDataSource(MAINNET, config as any)

describe('MaestroDataSource integration', () => {
  it('fetches first 5 inscriptions', async () => {
    const result = await ds.getAddressInscriptions(realAddress, 0, 5)
    console.log(
      'First 5:',
      result.data.map((i) => i.inscription_id)
    )
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.data.length).toBeLessThanOrEqual(5)
  })

  it('fetches first 100 inscriptions', async () => {
    const result = await ds.getAddressInscriptions(realAddress, 0, 100)
    console.log(
      'First 100:',
      result.data.map((i) => i.inscription_id)
    )
    expect(result.data.length).toBeLessThanOrEqual(100)
    // Should be 100 if address has 100+
    expect(result.data.length).toBe(100)
  })

  it('fetches inscriptions with offset=100, limit=5', async () => {
    const result = await ds.getAddressInscriptions(realAddress, 100, 5)
    console.log(
      'Offset 100, next 5:',
      result.data.map((i) => i.inscription_id)
    )
    expect(result.data.length).toBeLessThanOrEqual(5)
    // Should be 5 if address has 105+
    expect(result.data.length).toBe(5)
  })

  it('fetches all inscriptions in batches of 50 and checks uniqueness', async () => {
    let allIds: string[] = []
    let offset = 0
    let batchSize = 50
    let batch: any[] = []
    let total = 0
    do {
      const result = await ds.getAddressInscriptions(
        realAddress,
        offset,
        batchSize
      )
      batch = result.data
      const ids = batch.map((i) => i.inscription_id)
      console.log(`Batch offset ${offset}:`, ids)
      allIds.push(...ids)
      offset += batchSize
      total += batch.length
    } while (batch.length === batchSize)
    // Check for duplicates
    const uniqueIds = new Set(allIds)
    expect(uniqueIds.size).toBe(allIds.length)
    expect(allIds.length).toBeGreaterThan(100)
    console.log('Total unique inscriptions:', allIds.length)
  }, 30000)
})
