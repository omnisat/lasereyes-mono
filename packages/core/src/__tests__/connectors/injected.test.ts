/**
 * Tests for the `injected()` connector — specifically:
 *
 *   1. `connect()` constructs a `WalletAccount` from the adapter's
 *      JSON-serializable wire reply (`WalletAccountConfig`).
 *   2. `getClient` hook installs the right override under the right
 *      key for each `nativeRpc.*` flag.
 *   3. The override's `catch` branch is selective:
 *      - `METHOD_NOT_FOUND` (-32601) → falls back via `getAction`.
 *      - User rejection (4001) / network errors → re-throw.
 *   4. The `getAddressBalance` override is keyed on the leaf action
 *      (post-rename), not the wallet-shaped `getAccountBalance`.
 *
 * Mocks: a fake `BitcoinProvider` whose `request()` returns canned
 * responses or throws canned errors. The connector is exercised end
 * to end against this mock without any real wallet extension.
 */

import { createClient, MAINNET } from '@omnisat/lasereyes-client'
import { createChainDataSource } from '@omnisat/lasereyes-client'
import { AddressType } from '@omnisat/lasereyes-client/utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { injected } from '../../connectors/injected'
import type { BitcoinProvider, BitcoinRpcMethod } from '../../types/provider'

// `injected.ts`'s `resolveProvider` short-circuits when `typeof window
// === 'undefined'`. In Node this is true, so we stub a minimal global.
// The connector ignores the value (we override `getProvider` per-test
// to return our mock directly), but the typeof-check still has to pass.
beforeAll(() => {
  ;(globalThis as any).window = globalThis
})

/** Minimal connector-config bag the factory needs. */
const CONNECTOR_CONFIG = {
  networks: [MAINNET] as const,
}

/** A valid mainnet P2TR test address (BIP-350 vector). */
const ADDR = 'bc1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5sspknck9'
const PUBKEY = '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'

const ACCOUNT_WIRE = {
  addresses: [
    { address: ADDR, purpose: 'payment' as const, type: AddressType.P2TR },
    { address: ADDR, purpose: 'ordinals' as const, type: AddressType.P2TR },
  ],
  publicKeys: { payment: PUBKEY, ordinals: PUBKEY, taproot: PUBKEY } as Record<string, string>,
}

/**
 * Build a mock `BitcoinProvider` whose `request()` dispatches by
 * method name. Test cases pass per-method handlers.
 */
function makeProvider(
  handlers: Partial<Record<BitcoinRpcMethod, (params?: any) => unknown>>
): BitcoinProvider & { request: ReturnType<typeof vi.fn> } {
  const listeners = new Map<string, Array<(...args: any[]) => void>>()
  const request = vi.fn(async (method: string, params?: any) => {
    const h = handlers[method as BitcoinRpcMethod]
    if (!h) throw new Error(`mock: no handler for ${method}`)
    return h(params)
  }) as ReturnType<typeof vi.fn>

  return {
    request,
    on(event: string, listener: (...args: any[]) => void) {
      if (!listeners.has(event)) listeners.set(event, [])
      listeners.get(event)?.push(listener)
    },
    removeListener(event: string, listener: (...args: any[]) => void) {
      const arr = listeners.get(event)
      if (!arr) return
      const idx = arr.indexOf(listener)
      if (idx >= 0) arr.splice(idx, 1)
    },
  } as any
}

function buildConnector(
  provider: BitcoinProvider,
  nativeRpc?: { sendBtc?: boolean; broadcastPsbt?: boolean; getAddressBalance?: boolean }
) {
  return injected({
    id: 'mock',
    name: 'Mock Wallet',
    rdns: 'test.mock',
    getProvider: () => provider,
    nativeRpc,
  })(CONNECTOR_CONFIG as any)
}

// ============================================================================
// connect() — wire data → WalletAccount construction
// ============================================================================

describe('injected().connect()', () => {
  it('returns a WalletAccount (method-bearing) constructed from the wire reply', async () => {
    const provider = makeProvider({
      bitcoin_requestAccounts: () => ACCOUNT_WIRE,
      bitcoin_getNetwork: () => 'mainnet',
    })
    const connector = buildConnector(provider)

    const result = await connector.connect()

    expect(typeof result.account.getAddress).toBe('function')
    expect(typeof result.account.getPublicKey).toBe('function')
    expect(result.account.getAddress('payment')).toBe(ADDR)
    expect(result.account.getPublicKey('payment')).toBe(PUBKEY)
    expect(result.networkId).toBe('mainnet')
  })

  it('throws when the adapter returns no addresses', async () => {
    const provider = makeProvider({
      bitcoin_requestAccounts: () => ({ addresses: [], publicKeys: {} }),
    })
    const connector = buildConnector(provider)

    await expect(connector.connect()).rejects.toThrow(/No account returned/)
  })
})

describe('injected().isAuthorized()', () => {
  it('returns true when the wallet replies with addresses', async () => {
    const provider = makeProvider({ bitcoin_getAccounts: () => ACCOUNT_WIRE })
    expect(await buildConnector(provider).isAuthorized()).toBe(true)
  })

  it('returns false when the adapter throws (wallet locked, etc.)', async () => {
    const provider = makeProvider({
      bitcoin_getAccounts: () => {
        throw new Error('wallet locked')
      },
    })
    expect(await buildConnector(provider).isAuthorized()).toBe(false)
  })
})

// ============================================================================
// getClient hook — overrides installed per nativeRpc flag
// ============================================================================

describe('injected().getClient — override installation', () => {
  it('returns the bare client unchanged when no nativeRpc flags are set', async () => {
    const provider = makeProvider({})
    const connector = buildConnector(provider, undefined)
    // No nativeRpc → no getClient hook at all.
    expect(connector.getClient).toBeUndefined()
  })

  it('installs `sendBtc` override when nativeRpc.sendBtc is true', async () => {
    const provider = makeProvider({
      bitcoin_sendBitcoin: () => 'native-sent-txid',
    })
    const connector = buildConnector(provider, { sendBtc: true })
    const bare = createClient({
      network: MAINNET,
      dataSource: createChainDataSource({ network: MAINNET }) as any,
    })
    const extended = await connector.getClient!({ client: bare as any, chainId: 'mainnet' })

    expect(typeof (extended as any).sendBtc).toBe('function')
    const result = await (extended as any).sendBtc({ to: ADDR, amount: 100 })
    expect(result).toBe('native-sent-txid')
    expect(provider.request).toHaveBeenCalledWith('bitcoin_sendBitcoin', {
      to: ADDR,
      amount: 100,
    })
  })

  it('installs `getAddressBalance` override (post-rename: keyed on the leaf action)', async () => {
    // The override key must be `getAddressBalance`, NOT `getAccountBalance`
    // — the data-action path dispatches `getAction(client, …,
    // 'getAddressBalance')`. Pre-rename this was wrong and the showcase
    // silently hit mempool.
    const provider = makeProvider({
      bitcoin_getBalance: () => '54321',
    })
    const connector = buildConnector(provider, { getAddressBalance: true })
    const bare = createClient({
      network: MAINNET,
      dataSource: createChainDataSource({ network: MAINNET }) as any,
    })
    const extended = await connector.getClient!({ client: bare as any, chainId: 'mainnet' })

    expect(typeof (extended as any).getAddressBalance).toBe('function')
    // No `getAccountBalance` slot — that would be the bug.
    expect((extended as any).getAccountBalance).toBeUndefined()

    const result = await (extended as any).getAddressBalance(ADDR)
    expect(result).toBe('54321')
    expect(provider.request).toHaveBeenCalledWith('bitcoin_getBalance', { address: ADDR })
  })

  it('installs `broadcastPsbt` override when nativeRpc.broadcastPsbt is true', async () => {
    const provider = makeProvider({
      bitcoin_pushPsbt: () => 'broadcast-txid',
    })
    const connector = buildConnector(provider, { broadcastPsbt: true })
    const bare = createClient({
      network: MAINNET,
      dataSource: createChainDataSource({ network: MAINNET }) as any,
    })
    const extended = await connector.getClient!({ client: bare as any, chainId: 'mainnet' })

    expect(typeof (extended as any).broadcastPsbt).toBe('function')
    const result = await (extended as any).broadcastPsbt('hex')
    expect(result).toBe('broadcast-txid')
    expect(provider.request).toHaveBeenCalledWith('bitcoin_pushPsbt', { psbt: 'hex' })
  })
})

// ============================================================================
// Selective fallback — only METHOD_NOT_FOUND falls back
// ============================================================================

describe('injected().getClient — selective fallback semantics', () => {
  it('falls back to the composed path on -32601 METHOD_NOT_FOUND', async () => {
    const provider = makeProvider({
      bitcoin_sendBitcoin: () => {
        const err = new Error('method not found') as any
        err.code = -32601
        throw err
      },
    })
    const connector = buildConnector(provider, { sendBtc: true })

    // Provide a client whose `sendBtc` is the fallback target — this
    // simulates "the composed path is reachable via getAction." Because
    // there's no override key matching `sendBtc.name`, the fallback
    // free-fn runs and we can detect that by replacing it.
    const fallbackResult = 'fallback-via-getAction'
    const bare = {
      config: { network: MAINNET, dataSource: {} },
      sendBtc: vi.fn(async () => fallbackResult),
      extend(fn: any) {
        const overrides = fn(this)
        return { ...this, ...overrides }
      },
    } as any

    const extended = await connector.getClient!({ client: bare, chainId: 'mainnet' })
    const result = await (extended as any).sendBtc({ to: ADDR, amount: 100 })
    expect(result).toBe(fallbackResult)
    expect(bare.sendBtc).toHaveBeenCalledWith({ to: ADDR, amount: 100 })
  })

  it('re-throws user rejections (4001) without falling back', async () => {
    const provider = makeProvider({
      bitcoin_sendBitcoin: () => {
        const err = new Error('User rejected the request') as any
        err.code = 4001
        throw err
      },
    })
    const connector = buildConnector(provider, { sendBtc: true })
    const fallback = vi.fn(async () => 'should-not-run')
    const bare = {
      config: { network: MAINNET, dataSource: {} },
      sendBtc: fallback,
      extend(fn: any) {
        return { ...this, ...fn(this) }
      },
    } as any
    const extended = await connector.getClient!({ client: bare, chainId: 'mainnet' })

    await expect((extended as any).sendBtc({ to: ADDR, amount: 100 })).rejects.toThrow(
      /User rejected/
    )
    expect(fallback).not.toHaveBeenCalled()
  })

  it('re-throws non-RPC errors (network failure, internal wallet bug) without falling back', async () => {
    const provider = makeProvider({
      bitcoin_pushPsbt: () => {
        throw new Error('TypeError: cannot read property foo of undefined')
      },
    })
    const connector = buildConnector(provider, { broadcastPsbt: true })
    const fallback = vi.fn(async () => 'should-not-run')
    const bare = {
      config: { network: MAINNET, dataSource: {} },
      broadcastPsbt: fallback,
      extend(fn: any) {
        return { ...this, ...fn(this) }
      },
    } as any
    const extended = await connector.getClient!({ client: bare, chainId: 'mainnet' })

    await expect((extended as any).broadcastPsbt('hex')).rejects.toThrow(/TypeError/)
    expect(fallback).not.toHaveBeenCalled()
  })

  it('getAddressBalance falls back to data-source path when wallet rejects with -32601 (foreign address)', async () => {
    // Mirrors Unisat's adapter behavior: throws -32601 for addresses
    // outside the wallet's accounts. The override should defer to the
    // composed path, which hits the data source.
    const provider = makeProvider({
      bitcoin_getBalance: () => {
        const err = new Error('not my address') as any
        err.code = -32601
        throw err
      },
    })
    const connector = buildConnector(provider, { getAddressBalance: true })
    const dsResult = 'from-data-source'
    const bare = {
      config: { network: MAINNET, dataSource: {} },
      getAddressBalance: vi.fn(async () => dsResult),
      extend(fn: any) {
        return { ...this, ...fn(this) }
      },
    } as any
    const extended = await connector.getClient!({ client: bare, chainId: 'mainnet' })

    await expect((extended as any).getAddressBalance('bc1qOTHER')).resolves.toBe(dsResult)
    expect(bare.getAddressBalance).toHaveBeenCalledWith('bc1qOTHER')
  })
})
