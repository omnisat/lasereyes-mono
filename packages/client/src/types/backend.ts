import type { ActionGroup } from '../backend/capabilities'
import type { ChainNetwork } from '../chains'
import type { Extension, Prettify } from './utils'

/**
 * Parameters for cursor-based pagination.
 */
export type PaginationParams = {
  /** An opaque cursor returned from a previous paginated response. */
  cursor?: string | number
  /** Maximum number of items to return per page. */
  limit?: number
}

/**
 * A page of results from a paginated query.
 *
 * @typeParam T - The type of items in the result set
 */
export type PaginatedResult<T> = {
  /** The items in this page of results. */
  data: T[]
  /** Cursor to pass as `PaginationParams.cursor` to fetch the next page, or `undefined` if no more pages. */
  nextCursor?: string | number
}

/**
 * Context passed to capability factory functions during {@link ChainBackend.extend | .extend()} calls.
 */
export type ChainBackendContext = {
  /** The Bitcoin network this backend is configured for. */
  network: ChainNetwork
  /** Arbitrary configuration data shared across capability factories. */
  config: Record<string, unknown>
}

/**
 * A composable blockchain backend that provides typed capability methods.
 *
 * Start with {@link createChainBackend} to create a bare source, then call
 * {@link ChainBackend.extend | .extend()} one or more times to add capabilities
 * from vendor implementations.
 *
 * @typeParam TCapabilities - The union of all capability interfaces added via `.extend()`
 *
 * @example
 * ```ts
 * const ds: ChainBackend<BaseCapability & RuneCapability> =
 *   createChainBackend({ network: MAINNET })
 *     .extend(baseCapabilities(config))
 *     .extend(runeCapabilities(config))
 * ```
 */
export type ChainBackend<SupportedMethods extends ActionGroup = {}> = {
  /** The Bitcoin network this backend operates on. */
  network: ChainNetwork
  /**
   * Returns the names of the capability methods registered on this backend.
   *
   * @remarks
   * Typed as `string[]` (not `(keyof SupportedMethods)[]`): the value is only
   * ever iterated at runtime (e.g. for the merge dedup in
   * {@link mergeChainBackends}), and the precise key union made `ChainBackend`
   * invariant in `SupportedMethods` — which forced `any` at every position
   * that holds a heterogeneous backend. Keeping it `string[]` restores
   * covariance so `ChainBackend<ActionGroup>` can serve as a permissive
   * supertype.
   */
  getCapabilities(): string[]
  /**
   * Adds a new capability group to this backend.
   *
   * @remarks
   * The `TNew extends Extension<'network' | 'getCapabilities' | 'extend'>`
   * constraint protects the backend's reserved members from being
   * silently shadowed by a capability factory return. Any other key with
   * any value type is permitted.
   *
   * @typeParam TNew - The interface of the capability being added
   * @param factory - A function that receives the backend context and returns a capability group
   * @returns A new backend with the additional capability methods
   */
  extend<TNew extends Extension<'network' | 'getCapabilities' | 'extend'>>(
    factory: (context: ChainBackendContext) => TNew
  ): ChainBackend<Prettify<SupportedMethods & TNew>>
} & SupportedMethods
