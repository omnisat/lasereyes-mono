/**
 * `getClient(config, opts?)` — typed read-or-connected client for a chain.
 *
 * @remarks
 * Resolves the right `Client` for a chain. Precedence:
 *
 * 1. **Cached.** Returns whatever's cached for this chainId (populated by
 *    a prior call here, by `getWalletClient`, or by `connect()` after a
 *    successful connection).
 * 2. **`config.client` factory.** If the user supplied one to
 *    `createLaserEyesConfig`, it wins unconditionally — including when a
 *    wallet is connected. Build → cache → return.
 * 3. **Connected-wallet client.** If a wallet is connected on this chain
 *    and no custom factory is set, return the cached wallet client built
 *    at connect time (or, if the cache was cleared, build it now). This
 *    is what makes the action-layer's `getAction(client, baseFn, 'name')`
 *    dispatch automatically pick up connector overrides — the wallet
 *    client carries them.
 * 4. **Default bare client.** Otherwise build `createClient({ network,
 *    dataSource })` against the chain's data source. Build → cache →
 *    return.
 *
 * Cache lifetime is tied to the config (`WeakMap<config, …>` internally).
 * Invalidation happens on `connect()` / `disconnect()` / connection-event
 * handlers so a stale client never lingers across a connection change.
 *
 * Pairs with {@link getWalletClient} which asserts the typed
 * `WalletClient` return.
 *
 * @module client
 */

import {
  type BaseCapability,
  type ChainDataSource,
  type ChainNetwork,
  type Client,
  createClient,
  UnsupportedNetworkError,
} from '@omnisat/lasereyes-client'
import type { LaserEyesConfig } from './config'
import { readCachedClient, resolveDataSource, writeCachedClient } from './internal'

/**
 * Build a typed `Client` for one of the chains in the config.
 *
 * @remarks
 * See module-level docblock for the resolution precedence. Sync — async
 * wallet-client construction happens at `connect()` time and is cached;
 * by the time you call `getClient`, the result is ready.
 *
 * @throws {Error} If `chainId` is not in `config.chains`.
 * @throws {Error} If no transports are configured for `chainId`.
 */
export function getClient<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  options?: { chainId?: config['chains'][number]['id'] }
) {
  const id = (options?.chainId ?? config.state.$connection.get().networkId) as string

  // 1. Cached.
  const cached = readCachedClient(config, id)
  if (cached) return cached

  const chains = config.chains as readonly ChainNetwork[]
  const network = chains.find(c => c.id === id)
  if (!network) {
    throw new UnsupportedNetworkError(
      id,
      chains.map(c => c.id)
    )
  }
  const dataSource = resolveDataSource(config, id) as ChainDataSource<BaseCapability>

  // 2. User-supplied factory wins unconditionally.
  if (config.client) {
    const built = config.client({ chain: network, dataSource })
    writeCachedClient(config, id, built)
    return built
  }

  // 3. (Connected-wallet client.) Built at `connect()` time and stored
  // directly in the cache — the (1) check above retrieves it. Nothing to
  // do here at this layer; if we reach this point with no cache hit and
  // no custom factory, the wallet client either wasn't built (no
  // connector active on this chain) or was invalidated. Fall through to
  // the default bare client.

  // 4. Default bare client.
  const built = createClient({ network, dataSource })
  writeCachedClient(config, id, built)
  return built as Client<any, any, any>
}
