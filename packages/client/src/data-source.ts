import { NetworkMismatchError } from './errors'
import type { ActionGroup, ChainDataSource, DataSourceContext, NetworkType } from './types'

/**
 * Creates a new chain data source with the specified network configuration.
 *
 * A chain data source is a composable object that provides blockchain data access.
 * Start with a bare data source, then use {@link ChainDataSource.extend | .extend()} to
 * add capability groups (base, runes, inscriptions, etc.) from vendor implementations.
 *
 * @param config - The data source configuration
 * @param config.network - The Bitcoin network to connect to (e.g., `MAINNET`, `TESTNET`)
 * @returns A chain data source that can be extended with capabilities
 *
 * @example
 * ```ts
 * import { createChainDataSource } from '@omnisat/lasereyes-client'
 * import { baseCapabilities } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { MAINNET } from '@omnisat/lasereyes-client/constants/networks'
 *
 * const ds = createChainDataSource({ network: MAINNET })
 *   .extend(baseCapabilities({ networks: { mainnet: { apiUrl: 'https://mempool.space/api' } } }))
 * ```
 */
export function createChainDataSource(config: { network: NetworkType }): ChainDataSource<{}> {
  const context: DataSourceContext = {
    network: config.network,
    config: {},
  }

  function buildDataSource<T extends ActionGroup>(methods: T): ChainDataSource<T> {
    const ds = {
      network: config.network,
      getCapabilities() {
        return Object.keys(methods) as (keyof T)[]
      },
      extend<TNew>(
        factory: (ctx: DataSourceContext) => TNew
      ): ChainDataSource<T & TNew> {
        const newMethods = factory(context)
        const merged = { ...methods, ...newMethods } as T & TNew
        return buildDataSource(merged)
      },
      ...(methods),
    }
    return ds as ChainDataSource<T>
  }

  return buildDataSource({})
}

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
    throw new NetworkMismatchError(primary.network, secondary.network)
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
      return {
        ...secondaryMethods,
        ...primaryMethods,
      }
    },
    extend<TNew>(
      factory: (ctx: DataSourceContext) => TNew
    ): ChainDataSource<A & B & TNew> {
      const group = factory(context)
      Object.assign(mergedMethods, group)
      return ds as unknown as ChainDataSource<A & B & TNew>
    },
    ...mergedMethods,
  } as ChainDataSource<A & B>

  return ds
}
