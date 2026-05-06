import type { ChainNetwork } from '../chains'
import { ActionGroup } from './capabilities'

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
 * Context passed to capability factory functions during {@link ChainDataSource.extend | .extend()} calls.
 */
export type DataSourceContext = {
  /** The Bitcoin network this data source is configured for. */
  network: ChainNetwork
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
export type ChainDataSource<SupportedMethods extends ActionGroup = {}> = {
  /** The Bitcoin network this data source operates on. */
  network: ChainNetwork
  /** Returns a record mapping capability group names to their registered method names. */
  getCapabilities(): (keyof SupportedMethods)[]
  /**
   * Adds a new capability group to this data source.
   *
   * @typeParam TNew - The interface of the capability being added
   * @param factory - A function that receives the data source context and returns a capability group
   * @returns A new data source with the additional capability methods
   */
  extend<TNew>(
    factory: (context: DataSourceContext) => TNew
  ): ChainDataSource<SupportedMethods & TNew>
} & SupportedMethods
