/**
 * Tests for `actions/public` — the address-keyed leaf actions.
 *
 * @remarks
 * These actions are pure backend pass-throughs. Each test verifies
 * that the action calls the correct `BaseCapability` method with the
 * correct args and returns its result unchanged. No composition, no
 * `getAction` cascade — that's tested separately.
 *
 * Mock client + mock backend. No real bitcoin libs touched.
 */

import { describe, expect, it, vi } from 'vitest'
import {
  broadcastTransaction,
  getAddressBalance,
  getAddressUtxos,
  getOutputValue,
  getRecommendedFees,
  getTransaction,
  publicActions,
  waitForTransaction,
} from '../../actions/public'
import type { Client } from '../../client/types'

/**
 * Build a mock client whose `config.backend` is the supplied stubs.
 *
 * @remarks
 * All actions only touch `client.config.backend.btc*` — everything
 * else can stay unset. The cast is fine because we never reach for
 * anything the stubs don't provide.
 */
function makeClient(backend: Record<string, any>): Client<any, any, any> {
  return { config: { network: { id: 'mainnet' }, backend } } as any
}

describe('getAddressBalance', () => {
  it('forwards the address to backend.btcGetBalance and returns its result', async () => {
    const btcGetBalance = vi.fn(async () => '12345')
    const client = makeClient({ btcGetBalance })

    await expect(getAddressBalance(client, 'bc1qaddr')).resolves.toBe('12345')
    expect(btcGetBalance).toHaveBeenCalledTimes(1)
    expect(btcGetBalance).toHaveBeenCalledWith('bc1qaddr')
  })

  it('propagates backend errors verbatim', async () => {
    const btcGetBalance = vi.fn(async () => {
      throw new Error('indexer 502')
    })
    const client = makeClient({ btcGetBalance })

    await expect(getAddressBalance(client, 'bc1qaddr')).rejects.toThrow('indexer 502')
  })
})

describe('getAddressUtxos', () => {
  it('forwards address and pagination to backend.btcGetAddressUtxos', async () => {
    const result = { data: [], pagination: { offset: 0, limit: 50, total: 0 } }
    const btcGetAddressUtxos = vi.fn(async () => result)
    const client = makeClient({ btcGetAddressUtxos })

    const pagination = { offset: 10, limit: 25 }
    await expect(getAddressUtxos(client, 'bc1qaddr', pagination)).resolves.toBe(result)
    expect(btcGetAddressUtxos).toHaveBeenCalledWith('bc1qaddr', pagination)
  })

  it('omits pagination arg when caller does', async () => {
    const btcGetAddressUtxos = vi.fn(async () => ({ data: [], pagination: {} }))
    const client = makeClient({ btcGetAddressUtxos })

    await getAddressUtxos(client, 'bc1qaddr')
    expect(btcGetAddressUtxos).toHaveBeenCalledWith('bc1qaddr', undefined)
  })
})

describe('getTransaction', () => {
  it('forwards the txId to backend.btcGetTransaction', async () => {
    const tx = { txid: 'abc', confirmations: 2 }
    const btcGetTransaction = vi.fn(async () => tx)
    const client = makeClient({ btcGetTransaction })

    await expect(getTransaction(client, 'abc123')).resolves.toBe(tx)
    expect(btcGetTransaction).toHaveBeenCalledWith('abc123')
  })
})

describe('broadcastTransaction', () => {
  it('forwards the raw hex to backend.btcBroadcastTransaction and returns the txid', async () => {
    const btcBroadcastTransaction = vi.fn(async () => 'txid_returned')
    const client = makeClient({ btcBroadcastTransaction })

    await expect(broadcastTransaction(client, '02000000…')).resolves.toBe('txid_returned')
    expect(btcBroadcastTransaction).toHaveBeenCalledWith('02000000…')
  })
})

describe('getRecommendedFees', () => {
  it('takes no args and returns the backend result', async () => {
    const fees = { fastestFee: 50, halfHourFee: 30, hourFee: 10 }
    const btcGetRecommendedFees = vi.fn(async () => fees)
    const client = makeClient({ btcGetRecommendedFees })

    await expect(getRecommendedFees(client)).resolves.toBe(fees)
    expect(btcGetRecommendedFees).toHaveBeenCalledWith()
  })
})

describe('getOutputValue', () => {
  it('forwards (txId, vout) to backend.btcGetOutputValue', async () => {
    const btcGetOutputValue = vi.fn(async () => 100000)
    const client = makeClient({ btcGetOutputValue })

    await expect(getOutputValue(client, 'abc123', 0)).resolves.toBe(100000)
    expect(btcGetOutputValue).toHaveBeenCalledWith('abc123', 0)
  })

  it('returns null when the backend reports the output is unspent / missing', async () => {
    const btcGetOutputValue = vi.fn(async () => null)
    const client = makeClient({ btcGetOutputValue })

    await expect(getOutputValue(client, 'abc123', 9)).resolves.toBeNull()
  })
})

describe('waitForTransaction', () => {
  it('forwards the txId to backend.btcWaitForTransaction', async () => {
    const btcWaitForTransaction = vi.fn(async () => true)
    const client = makeClient({ btcWaitForTransaction })

    await expect(waitForTransaction(client, 'abc123')).resolves.toBe(true)
    expect(btcWaitForTransaction).toHaveBeenCalledWith('abc123')
  })
})

// ============================================================================
// publicActions() factory
// ============================================================================

describe('publicActions()', () => {
  it('installs every public method on the client with the right shape', async () => {
    const ds = {
      btcGetBalance: vi.fn(async () => '12345'),
      btcGetAddressUtxos: vi.fn(async () => ({ data: [], pagination: {} })),
      btcGetTransaction: vi.fn(async () => ({ txid: 'abc' })),
      btcBroadcastTransaction: vi.fn(async () => 'txid'),
      btcGetRecommendedFees: vi.fn(async () => ({ fastestFee: 1, halfHourFee: 1, hourFee: 1 })),
      btcGetOutputValue: vi.fn(async () => 100000),
      btcWaitForTransaction: vi.fn(async () => true),
    }
    const bare = makeClient(ds)
    const factory = publicActions()
    const extended = { ...bare, ...factory(bare as any) }

    await extended.getAddressBalance('bc1q')
    await extended.getAddressUtxos('bc1q', { offset: 0, limit: 10 })
    await extended.getTransaction('abc')
    await extended.broadcastTransaction('02…')
    await extended.getRecommendedFees()
    await extended.getOutputValue('abc', 0)
    await extended.waitForTransaction('abc')

    expect(ds.btcGetBalance).toHaveBeenCalledWith('bc1q')
    expect(ds.btcGetAddressUtxos).toHaveBeenCalledWith('bc1q', { offset: 0, limit: 10 })
    expect(ds.btcGetTransaction).toHaveBeenCalledWith('abc')
    expect(ds.btcBroadcastTransaction).toHaveBeenCalledWith('02…')
    expect(ds.btcGetRecommendedFees).toHaveBeenCalledWith()
    expect(ds.btcGetOutputValue).toHaveBeenCalledWith('abc', 0)
    expect(ds.btcWaitForTransaction).toHaveBeenCalledWith('abc')
  })

  it('factory methods close over the client passed at extend time', async () => {
    const dsA = { btcGetBalance: vi.fn(async () => 'A') }
    const dsB = { btcGetBalance: vi.fn(async () => 'B') }
    const factory = publicActions()
    const aMethods = factory(makeClient(dsA) as any)
    const bMethods = factory(makeClient(dsB) as any)

    await expect(aMethods.getAddressBalance('bc1q')).resolves.toBe('A')
    await expect(bMethods.getAddressBalance('bc1q')).resolves.toBe('B')
    expect(dsA.btcGetBalance).toHaveBeenCalledOnce()
    expect(dsB.btcGetBalance).toHaveBeenCalledOnce()
  })
})
