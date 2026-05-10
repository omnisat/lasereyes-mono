/**
 * Internal: resolve the merged data source for a chain.
 *
 * @remarks
 * Folds `config.transports[chainId]` (an array of `ChainDataSource`s in
 * priority order) into a single merged source via `mergeDataSources`. This
 * is the runtime fold; the type-level companion is `MergedCapabilities<T>`
 * in the client package.
 *
 * Phase 10's keystone (`getClient(config, opts?)`) wraps this helper to
 * return a typed `Client`. For Phase 9 actions that just need data-source
 * methods (read-fallback paths), this lower-level helper is enough.
 *
 * @internal
 */

import { type ChainDataSource, mergeDataSources } from '@omnisat/lasereyes-client'
import type { LaserEyesConfig } from '../config'

/**
 * Resolve the merged data source for a chain.
 *
 * @param config - The LaserEyes config.
 * @param chainId - Optional chain ID. Defaults to the active network.
 * @returns The merged `ChainDataSource` for the chain.
 *
 * @throws {Error} If no transports are configured for `chainId`.
 */
export function resolveDataSource(
  config: LaserEyesConfig<any, any, any>,
  chainId?: string
): ChainDataSource<any> {
  const id = chainId ?? config.state.$networkId.get()
  const sources = (config.transports as Record<string, readonly ChainDataSource<any>[]>)[id]
  if (!sources || sources.length === 0) {
    throw new Error(`No data sources configured for chain '${id}'`)
  }
  if (sources.length === 1) return sources[0]
  // First source wins on overlap — `mergeDataSources(primary, secondary)`.
  // `reduceRight` folds right-to-left so the leftmost (priority 0) ends as primary.
  return sources.reduceRight((acc, src) => mergeDataSources(src, acc))
}
