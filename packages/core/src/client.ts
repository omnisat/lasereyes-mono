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
 *    backend })` against the chain's backend. Build → cache →
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
  type ChainNetwork,
  type Client,
  type ClientConfig,
  createClient,
  type MergedCapabilities,
  NetworkNotConfiguredError,
} from '@omnisat/lasereyes-client'
import type { LaserEyesConfig } from './config'
import { readCachedClient, resolveChainBackend, writeCachedClient } from './internal'

/**
 * The index-signature-stripped capability set of the backend configured for
 * chain `K`. Stripping (via {@link MergedCapabilities}) makes method *absence*
 * real — `client.config.backend.notAMethod` errors instead of resolving to the
 * `ActionGroup` index signature's `AnyFn`.
 */
type StrippedCapsFor<C extends LaserEyesConfig, K extends keyof C['backends']> = MergedCapabilities<
  readonly [C['backends'][K]]
>

/**
 * The precise `Client` `getClient(config, { chainId: K })` returns: a bare
 * client (no installed actions — reads go through the free-function actions)
 * carrying chain `K`'s stripped capability set.
 */
export type ClientFor<C extends LaserEyesConfig, K extends keyof C['backends']> = Client<
  ClientConfig<StrippedCapsFor<C, K>>,
  StrippedCapsFor<C, K>,
  // biome-ignore lint/complexity/noBannedTypes: bare client installs no actions
  {}
>

/**
 * The sound union `getClient(config)` returns when `chainId` is omitted: the
 * omitted case resolves to the *active* network at runtime (which
 * `switchNetwork` can change to any configured chain), so the static type is
 * "one of the configured chains' clients, unknown which". Callers can reach
 * only methods present on every chain without narrowing.
 */
export type ClientUnionFor<C extends LaserEyesConfig> = keyof C['backends'] extends infer K
  ? K extends keyof C['backends']
    ? ClientFor<C, K>
    : never
  : never

/**
 * `getClient`'s return: precise for an explicit `chainId`, the sound union when
 * omitted.
 */
type GetClientReturn<C extends LaserEyesConfig, K extends keyof C['backends'] | undefined> = [
  K,
] extends [undefined]
  ? ClientUnionFor<C>
  : K extends keyof C['backends']
    ? ClientFor<C, K>
    : never

/**
 * Build a typed `Client` for one of the chains in the config.
 *
 * @remarks
 * See module-level docblock for the resolution precedence. Sync — async
 * wallet-client construction happens at `connect()` time and is cached;
 * by the time you call `getClient`, the result is ready.
 *
 * @throws {Error} If `chainId` is not in `config.chains`.
 * @throws {Error} If no backend is configured for `chainId`.
 */
export function getClient<
  const config extends LaserEyesConfig,
  const chainId extends keyof config['backends'] | undefined = undefined,
>(config: config, options?: { chainId?: chainId }): GetClientReturn<config, chainId> {
  // The runtime client can't be precisely typed here (the chain is a runtime
  // value, the cache is heterogeneous, and `config.client` is opaque), so the
  // body works in `Client<any,…>` terms and the public return type is asserted
  // via a single cast. Soundness rests on: the default path builds exactly the
  // chain's backend client; the union/precise discrimination is on `chainId`.
  type Ret = GetClientReturn<config, chainId>
  const id = (options?.chainId ?? config.state.$connection.get().networkId) as string

  // 1. Cached.
  const cached = readCachedClient(config, id)
  if (cached) return cached as Ret

  const chains = config.chains as readonly ChainNetwork[]
  const network = chains.find(c => c.id === id)
  if (!network) {
    throw new NetworkNotConfiguredError(
      id,
      chains.map(c => c.id)
    )
  }
  const backend = resolveChainBackend(config, id)

  // 2. User-supplied factory wins unconditionally. Its output is surfaced
  // through the precise/union signature via this cast — the caller is
  // responsible for the custom client being compatible (see FUTURE-IMPROVEMENTS:
  // "getClient can't return a broad client specifically for the config.client
  // path").
  if (config.client) {
    const built = config.client({ chain: network, backend })
    writeCachedClient(config, id, built)
    return built as Ret
  }

  // 3. (Connected-wallet client.) Built at `connect()` time and stored
  // directly in the cache — the (1) check above retrieves it. Nothing to
  // do here at this layer; if we reach this point with no cache hit and
  // no custom factory, the wallet client either wasn't built (no
  // connector active on this chain) or was invalidated. Fall through to
  // the default bare client.

  // 4. Default bare client.
  const built = createClient({ network, backend })
  writeCachedClient(config, id, built)
  return built as unknown as Ret
}
