import type { ChainNetwork, NetworkId } from '../chains'
import { resolveNetwork } from '../chains'
import type { ChainDataSource, DataSourceContext } from '../types/data-source'
import type { Extension, Prettify } from '../types/utils'
import type { ActionGroup } from './capabilities'

/**
 * Creates a new chain data source with the specified network configuration.
 *
 * A chain data source is a composable object that provides blockchain data access.
 * Start with a bare data source, then use {@link ChainDataSource.extend | .extend()} to
 * add capability groups (base, runes, inscriptions, etc.) from vendor implementations.
 *
 * @param config - The data source configuration
 * @param config.network - The Bitcoin network. Pass either a {@link NetworkId}
 *   string (e.g. `'mainnet'`) or a {@link ChainNetwork} value (e.g. `MAINNET`).
 *   Strings are looked up via the built-in `NETWORKS` registry; custom chains
 *   must be passed as `ChainNetwork` values produced by `defineChain()`.
 * @returns A chain data source that can be extended with capabilities
 *
 * @example
 * ```ts
 * import { createChainDataSource } from '@omnisat/lasereyes-client'
 * import { baseCapabilities } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * // Both of these work:
 * const ds1 = createChainDataSource({ network: 'mainnet' })
 * const ds2 = createChainDataSource({ network: MAINNET })
 * ```
 */
export function createChainDataSource(config: {
  network: NetworkId | ChainNetwork
}): ChainDataSource<{}> {
  const network = resolveNetwork(config.network)
  const context: DataSourceContext = {
    network,
    config: {},
  }

  function buildDataSource<T extends ActionGroup>(methods: T): ChainDataSource<T> {
    const ds = {
      network,
      getCapabilities() {
        return Object.keys(methods) as (keyof T)[]
      },
      extend<TNew extends Extension<'network' | 'getCapabilities' | 'extend'>>(
        factory: (ctx: DataSourceContext) => TNew
      ): ChainDataSource<Prettify<T & TNew>> {
        const newMethods = factory(context)
        const merged = { ...methods, ...newMethods } as Prettify<T & TNew>
        return buildDataSource(merged)
      },
      ...methods,
    }
    return ds as ChainDataSource<T>
  }

  return buildDataSource({})
}
