/**
 * Internal: per-config, per-chain client cache.
 *
 * @remarks
 * `getClient` and `getWalletClient` go through this cache so a client isn't
 * rebuilt on every call.
 *
 * @internal
 */

// Mechanism: a module-private WeakMap keyed by the config object (the config is
// a plain value, not a class with a captured closure), conceptually a per-config
// `Map<chainId, Client>` cache. Entries are invalidated by:
// - `connect()` populating a fresh wallet client for the active chain.
// - `disconnect()` / `networkChanged` / `accountsChanged` clearing the relevant
//   chain entry.

import type { Client } from '@omnisat/lasereyes-client'

/** Module-private cache, lifetime tied to the config object. */
const store = new WeakMap<object, Map<string, Client<any, any, any>>>()

/**
 * Get (or create) the per-chain client map for a config.
 *
 * @internal
 */
export function getClientCache(config: object): Map<string, Client<any, any, any>> {
  let cache = store.get(config)
  if (!cache) {
    cache = new Map()
    store.set(config, cache)
  }
  return cache
}

/**
 * Read a cached client for a chain, if any.
 *
 * @internal
 */
export function readCachedClient(
  config: object,
  chainId: string
): Client<any, any, any> | undefined {
  return store.get(config)?.get(chainId)
}

/**
 * Store a client for a chain.
 *
 * @internal
 */
export function writeCachedClient(
  config: object,
  chainId: string,
  client: Client<any, any, any>
): void {
  getClientCache(config).set(chainId, client)
}

/**
 * Drop the cached client for a chain (or for every chain if omitted).
 *
 * @internal
 */
export function invalidateClientCache(config: object, chainId?: string): void {
  const cache = store.get(config)
  if (!cache) return
  if (chainId) cache.delete(chainId)
  else cache.clear()
}
