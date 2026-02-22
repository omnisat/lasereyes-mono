import type { NetworkType } from './network'

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
 * Describes a named group of capability methods to be added to a data source.
 *
 * @typeParam T - The interface shape of the methods provided by this group
 *
 * @remarks
 * Capability groups are registered by name when calling
 * {@link ChainDataSource.extend | dataSource.extend()}, allowing introspection
 * via {@link ChainDataSource.getCapabilities | getCapabilities()}.
 */
export interface CapabilityGroup<T> {
  /** The name of this capability group (e.g., `'base'`, `'rune'`, `'inscription'`). */
  group: string
  /** The method implementations provided by this capability group. */
  methods: T
}

/**
 * Context passed to capability factory functions during {@link ChainDataSource.extend | .extend()} calls.
 */
export type DataSourceContext = {
  /** The Bitcoin network this data source is configured for. */
  network: NetworkType
  /** Arbitrary configuration data shared across capability factories. */
  config: Record<string, unknown>
}

/**
 * A composable blockchain data source that provides typed capability methods.
 *
 * Start with {@link createChainDataSource} to create a bare source, then call
 * {@link ChainDataSource.extend | .extend()} one or more times to add capabilities
 * from vendor implementations.
 *
 * @typeParam TCapabilities - The union of all capability interfaces added via `.extend()`
 *
 * @example
 * ```ts
 * const ds: ChainDataSource<BaseCapability & RuneCapability> =
 *   createChainDataSource({ network: MAINNET })
 *     .extend(baseCapabilities(config))
 *     .extend(runeCapabilities(config))
 * ```
 */
export type ChainDataSource<TCapabilities = object> = {
  /** The Bitcoin network this data source operates on. */
  network: NetworkType
  /** Returns a record mapping capability group names to their registered method names. */
  getCapabilities(): Record<string, string[]>
  /**
   * Adds a new capability group to this data source.
   *
   * @typeParam TNew - The interface of the capability being added
   * @param factory - A function that receives the data source context and returns a capability group
   * @returns A new data source with the additional capability methods
   */
  extend<TNew>(
    factory: (context: DataSourceContext) => CapabilityGroup<TNew>
  ): ChainDataSource<TCapabilities & TNew>
} & TCapabilities
