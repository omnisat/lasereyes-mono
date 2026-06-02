/**
 * Tests for `core/actions/data` — the Phase 9 read actions over
 * `LaserEyesConfig`.
 *
 * @remarks
 * Each action is a thin shim: resolve `config` → build/lookup client
 * via `getClient(config, opts)` → dispatch via `getAction(client, fn,
 * 'name')`. These tests pin the **seam**: that the right method on
 * the resolved chain's backend is called with the right args,
 * that explicit `chainId` reroutes to a different backend, and that
 * a client-installed override on the resolved client wins over the
 * backend path.
 *
 * Mock backends only — no real bitcoin libs touched.
 */

import {
  type ChainNetwork,
  createChainBackend,
  MAINNET,
  type NetworkId,
  TESTNET,
} from '@omnisat/lasereyes-client'
import { describe, expect, it, vi } from 'vitest'
import {
  broadcastTransaction,
  getAddressBalance,
  getAddressUtxos,
  getRecommendedFees,
  getTransaction,
} from '../../actions/data'
import { createLaserEyesConfig } from '../../config'

function makeConfig(opts: { mainnetDS: Record<string, any>; testnetDS?: Record<string, any> }) {
  const dsFactory = (network: NetworkId | ChainNetwork) => {
    const ds = createChainBackend({ network })
    const netId = typeof network === 'string' ? network : (network as ChainNetwork).id
    switch (netId) {
      case 'testnet':
        return ds.extend(() => opts.testnetDS ?? {})
      default:
        return ds.extend(() => opts.mainnetDS)
    }
  }

  const config = createLaserEyesConfig({
    chains: [MAINNET, TESTNET],
    backends: {
      mainnet: dsFactory,
      testnet: dsFactory,
    },
  })

  return config
}

describe('getAddressBalance (core)', () => {
  it('routes to the active chain backend by default', async () => {
    const btcGetBalance = vi.fn(async () => '12345')
    const config = makeConfig({ mainnetDS: { btcGetBalance } })

    await expect(getAddressBalance(config, 'bc1qaddr')).resolves.toBe('12345')
    expect(btcGetBalance).toHaveBeenCalledWith('bc1qaddr')
  })

  it('reroutes to the testnet backend when options.chainId is "testnet"', async () => {
    const mainnetBalance = vi.fn(async () => 'mainnet')
    const testnetBalance = vi.fn(async () => 'testnet')
    const config = makeConfig({
      mainnetDS: { btcGetBalance: mainnetBalance },
      testnetDS: { btcGetBalance: testnetBalance },
    })

    await expect(getAddressBalance(config, 'bc1qaddr', { chainId: 'testnet' })).resolves.toBe(
      'testnet'
    )
    expect(testnetBalance).toHaveBeenCalledWith('bc1qaddr')
    expect(mainnetBalance).not.toHaveBeenCalled()
  })

  it('throws NetworkNotConfiguredError when chainId is not in config.chains', async () => {
    const config = makeConfig({ mainnetDS: { btcGetBalance: vi.fn() } })

    await expect(
      getAddressBalance(config, 'bc1qaddr', { chainId: 'signet' as any })
    ).rejects.toThrow(/signet/)
  })
})

describe('getAddressUtxos (core)', () => {
  it('forwards address to backend.btcGetAddressUtxos and returns its result', async () => {
    const result = { data: [], pagination: { offset: 0, limit: 50, total: 0 } }
    const btcGetAddressUtxos = vi.fn(async () => result)
    const config = makeConfig({ mainnetDS: { btcGetAddressUtxos } })

    await expect(getAddressUtxos(config, 'bc1qaddr')).resolves.toBe(result)
    expect(btcGetAddressUtxos).toHaveBeenCalledWith('bc1qaddr', undefined)
  })
})

describe('getRecommendedFees (core)', () => {
  it('forwards to backend.btcGetRecommendedFees and returns its result', async () => {
    const fees = { fastestFee: 50, halfHourFee: 30, hourFee: 10 }
    const btcGetRecommendedFees = vi.fn(async () => fees)
    const config = makeConfig({ mainnetDS: { btcGetRecommendedFees } })

    await expect(getRecommendedFees(config)).resolves.toBe(fees)
    expect(btcGetRecommendedFees).toHaveBeenCalledWith()
  })
})

describe('getTransaction (core)', () => {
  it('forwards txId to backend.btcGetTransaction', async () => {
    const tx = { txid: 'abc' }
    const btcGetTransaction = vi.fn(async () => tx)
    const config = makeConfig({ mainnetDS: { btcGetTransaction } })

    await expect(getTransaction(config, 'abc123')).resolves.toBe(tx)
    expect(btcGetTransaction).toHaveBeenCalledWith('abc123')
  })
})

describe('broadcastTransaction (core)', () => {
  it('forwards raw hex to backend.btcBroadcastTransaction and returns the txid', async () => {
    const btcBroadcastTransaction = vi.fn(async () => 'final-txid')
    const config = makeConfig({ mainnetDS: { btcBroadcastTransaction } })

    await expect(broadcastTransaction(config, '02000000…')).resolves.toBe('final-txid')
    expect(btcBroadcastTransaction).toHaveBeenCalledWith('02000000…')
  })
})

// ============================================================================
// User-factory wins (config.client)
// ============================================================================

describe('config.client factory wins unconditionally', () => {
  it('honors a user-supplied client over the default bare client', async () => {
    const userClientGetBalance = vi.fn(async () => 'from-user-factory')
    const dsGetBalance = vi.fn(async () => 'from-ds')

    const dsFactory = (n: NetworkId | ChainNetwork) =>
      createChainBackend({ network: n }).extend(() => ({ btcGetBalance: dsGetBalance }) as any)

    const config = createLaserEyesConfig({
      chains: [MAINNET],
      backends: { mainnet: dsFactory },
      // User-supplied factory: return a client whose `getAddressBalance` is
      // ours, not the backend's.
      client: ({ chain, backend }) => ({
        config: { network: chain, backend } as any,
        getAddressBalance: userClientGetBalance,
        // Stub `extend` to satisfy the type — `getClient` doesn't call it.
        extend: () => null as any,
      }),
    })

    await expect(getAddressBalance(config, 'bc1qaddr')).resolves.toBe('from-user-factory')
    expect(userClientGetBalance).toHaveBeenCalledWith('bc1qaddr')
    expect(dsGetBalance).not.toHaveBeenCalled()
  })
})
