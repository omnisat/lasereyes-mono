import { NetworkMismatchError } from '../errors'
import type { ChainDataSource, DataSourceContext } from '../types/data-source'
import type { ActionGroup } from './capabilities'

/**
 * Merges two chain data sources into a single data source that combines their capabilities.
 *
 * When both data sources provide methods with the same name, the primary data source's
 * methods take precedence. Capability group registrations are merged, combining method
 * lists for overlapping groups.
 *
 * @param primary - The primary data source whose methods take precedence on overlap
 * @param secondary - The secondary data source providing fallback methods
 * @returns A merged data source combining capabilities from both sources
 *
 * @throws {@link NetworkMismatchError} If the two data sources are configured for different networks
 *
 * @example
 * ```ts
 * import { mergeDataSources } from '@omnisat/lasereyes-client'
 * import { createDataSource as createMempool } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { createDataSource as createSandshrew } from '@omnisat/lasereyes-client/vendors/sandshrew'
 *
 * const mempool = createMempool({ network: MAINNET })
 * const sandshrew = createSandshrew({ network: MAINNET, apiKey: '...' })
 * const merged = mergeDataSources(sandshrew, mempool)
 * ```
 */
export function mergeDataSources<A extends ActionGroup, B extends ActionGroup>(
  primary: ChainDataSource<A>,
  secondary: ChainDataSource<B>
): ChainDataSource<A & B> {
  if (primary.network !== secondary.network) {
    throw new NetworkMismatchError(primary.network.name, secondary.network.name)
  }

  const primaryMethods = primary.getCapabilities()
  const secondaryMethods = secondary.getCapabilities()

  // Collect all method names from both data sources (excluding built-in props)
  const builtins = new Set(['network', 'getCapabilities', 'extend'])

  // Secondary methods first, then primary wins on overlap
  const mergedMethods: Record<string, unknown> = {}

  for (const key of Object.keys(secondary as object)) {
    if (!builtins.has(key)) {
      mergedMethods[key] = (secondary as Record<string, unknown>)[key]
    }
  }
  for (const key of Object.keys(primary as object)) {
    if (!builtins.has(key)) {
      mergedMethods[key] = (primary as Record<string, unknown>)[key]
    }
  }

  const context: DataSourceContext = {
    network: primary.network,
    config: {},
  }

  const ds = {
    network: primary.network,
    getCapabilities() {
      return [...new Set([...secondaryMethods, ...primaryMethods])] as (keyof (A & B))[]
    },
    extend<TNew>(factory: (ctx: DataSourceContext) => TNew): ChainDataSource<A & B & TNew> {
      const group = factory(context)
      Object.assign(mergedMethods, group)
      return ds as unknown as ChainDataSource<A & B & TNew>
    },
    ...mergedMethods,
  } as ChainDataSource<A & B>

  return ds
}
