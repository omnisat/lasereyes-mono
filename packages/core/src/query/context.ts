/**
 * Shared cache "context" for the per-action query stores.
 *
 * @remarks
 * The nanoquery analogue of wagmi's app-owned `QueryClient`: one `nanoquery()`
 * call = one cache + dedup/revalidation engine, shared by every per-action
 * query module that imports {@link defaultQueryContext}. Mirrors the nanoquery
 * README's "define the context once, create fetcher stores per resource"
 * layout and wagmi's `@wagmi/core/query` split (per-action files, shared cache).
 *
 * The default context is process-wide. Pass a custom one (with its own `cache`
 * Map) into any `getXxxQuery(config, …, ctx)` call for SSR / test isolation —
 * the cache stays injectable, like wagmi's QueryClient, rather than hidden.
 *
 * Verified against `@nanostores/query@0.3.4`: settings are `dedupeTime`,
 * `cacheLifetime` (must be ≥ `dedupeTime`; default `Infinity`),
 * `revalidateOnFocus`/`revalidateOnReconnect`/`revalidateInterval`.
 *
 * @module query/context
 */

import { type NanoqueryArgs, nanoquery } from '@nanostores/query'
import { atom, computed, type ReadableAtom } from 'nanostores'
import type { LaserEyesConfig } from '../config'

/** Delimiter interleaved into key parts so `parts.join("")` stays collision-free. */
export const SEP = ':'

/** Tunables forwarded to `nanoquery`. */
export interface QueryContextOptions {
  /** Window (ms) in which identical keys dedupe to one request. Default 4000. */
  dedupeTime?: number
  /** How long (ms) stale cache is served after the last subscriber leaves. Must be ≥ dedupeTime. Default 60000. */
  cacheLifetime?: number
  /** Refetch when the tab regains focus. Default false. */
  revalidateOnFocus?: boolean
  /** Refetch when the network connection is restored. Default true. */
  revalidateOnReconnect?: boolean
  /** Background refetch interval (ms). Off by default (0). */
  revalidateInterval?: number
  /** Injectable cache. Pass a fresh `new Map()` per request for SSR isolation. */
  cache?: NanoqueryArgs['cache']
}

/** Build an isolated cache context (own cache + settings). */
export function createQueryContext(options: QueryContextOptions = {}) {
  const { ...settings } = options
  return nanoquery({
    dedupeTime: 4_000,
    cacheLifetime: 60_000,
    revalidateOnReconnect: true,
    ...settings,
  })
}

/** The `[createFetcherStore, createMutatorStore, helpers]` tuple from `nanoquery()`. */
export type QueryContext = ReturnType<typeof createQueryContext>

/**
 * Default process-wide context (one shared cache). Per-action `getXxxQuery`
 * helpers default to this; inject a {@link createQueryContext} result for
 * SSR / per-request isolation.
 */
export const defaultQueryContext: QueryContext = createQueryContext()

/**
 * Reactive networkId key-part for a config. Recomputes on every connection
 * change, so switching networks re-keys (own cache slot) AND refetches —
 * the wagmi "identity change → new queryKey → fetch" channel, nanostores-native.
 */
export function networkIdAtom(config: LaserEyesConfig): ReadableAtom<string> {
  return computed(config.state.$connection, c => c.networkId)
}

/**
 * Per-call overrides threaded from the read hooks into a query builder.
 *
 * @remarks
 * Both fields fold into the store's identity, so the React layer can target a
 * non-active chain or pause a fetch without bypassing the cache.
 */
export interface QueryBuilderOptions {
  /**
   * Target a chain **other** than the active connection's. The id becomes the
   * networkId key-part (so the read caches under its own slot, distinct from the
   * active chain) and is forwarded to the underlying read action. Defaults to
   * the active connection's network.
   */
  chainId?: string
  /**
   * Gate the fetch. When `false`, the store resolves to a NoKey and stays idle —
   * no request, no cache entry — regardless of the address/txid. Defaults to
   * `true`.
   */
  enabled?: boolean
}

/**
 * {@link QueryBuilderOptions} plus cursor pagination, for paginated reads
 * (e.g. `getAddressUtxosQuery`). `cursor` + `limit` both fold into the cache
 * key, so each page caches under its own slot, and are forwarded to the action.
 */
export interface PaginatedQueryBuilderOptions extends QueryBuilderOptions {
  /** Opaque cursor from a previous page's `nextCursor`. */
  cursor?: string | number
  /** Maximum number of items per page. */
  limit?: number
}

/**
 * The effective, reactive networkId key-part for a query store, honoring
 * {@link QueryBuilderOptions}.
 *
 * @remarks
 * - **No `chainId`** → tracks the active connection's network (reactive: a
 *   network switch re-keys and refetches), exactly like {@link networkIdAtom}.
 * - **`chainId` set** → pins the key to that chain (static), so the read caches
 *   under its own slot and the builder forwards `{ chainId }` to its action.
 * - **`enabled === false`** → resolves to `null`, which nanoquery treats as a
 *   NoKey: the fetcher never runs and nothing is cached.
 *
 * @param config - The LaserEyes config.
 * @param options - Optional per-call overrides.
 */
export function effectiveNetworkIdAtom(
  config: LaserEyesConfig,
  options?: QueryBuilderOptions
): ReadableAtom<string | null> {
  const { chainId, enabled } = options ?? {}
  if (enabled === false) return atom<string | null>(null)
  if (chainId !== undefined) return atom<string | null>(chainId)
  return computed(config.state.$connection, c => c.networkId)
}
