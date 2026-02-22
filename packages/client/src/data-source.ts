import { NetworkMismatchError } from './errors'
import type { CapabilityGroup, ChainDataSource, DataSourceContext, NetworkType } from './types'

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
export function createChainDataSource(config: { network: NetworkType }): ChainDataSource {
  const capabilities: Record<string, string[]> = {}
  const context: DataSourceContext = {
    network: config.network,
    config: {},
  }

  function buildDataSource<T>(methods: T): ChainDataSource<T> {
    const ds = {
      network: config.network,
      getCapabilities() {
        return { ...capabilities }
      },
      extend<TNew>(
        factory: (ctx: DataSourceContext) => CapabilityGroup<TNew>
      ): ChainDataSource<T & TNew> {
        const group = factory(context)
        capabilities[group.group] = Object.keys(group.methods as object)
        const merged = { ...methods, ...group.methods } as T & TNew
        return buildDataSource(merged)
      },
      ...(methods as object),
    } as ChainDataSource<T>
    return ds
  }

  return buildDataSource({} as object) as ChainDataSource
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
export function mergeDataSources<A, B>(
  primary: ChainDataSource<A>,
  secondary: ChainDataSource<B>
): ChainDataSource<A & B> {
  if (primary.network !== secondary.network) {
    throw new NetworkMismatchError(primary.network, secondary.network)
  }

  const primaryCaps = primary.getCapabilities()
  const secondaryCaps = secondary.getCapabilities()

  const mergedCapabilities: Record<string, string[]> = { ...secondaryCaps }
  for (const [group, methods] of Object.entries(primaryCaps)) {
    if (mergedCapabilities[group]) {
      const combined = new Set([...mergedCapabilities[group], ...methods])
      mergedCapabilities[group] = [...combined]
    } else {
      mergedCapabilities[group] = methods
    }
  }

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
      return { ...mergedCapabilities }
    },
    extend<TNew>(
      factory: (ctx: DataSourceContext) => CapabilityGroup<TNew>
    ): ChainDataSource<A & B & TNew> {
      const group = factory(context)
      mergedCapabilities[group.group] = Object.keys(group.methods as object)
      Object.assign(mergedMethods, group.methods)
      return ds as unknown as ChainDataSource<A & B & TNew>
    },
    ...mergedMethods,
  } as ChainDataSource<A & B>

  return ds
}
