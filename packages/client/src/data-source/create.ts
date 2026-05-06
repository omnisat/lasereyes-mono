import type { ChainNetwork } from '../chains'
import type { ChainDataSource, DataSourceContext } from '../types/data-source'
import type { ActionGroup } from './capabilities'

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
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * const ds = createChainDataSource({ network: MAINNET })
 *   .extend(baseCapabilities({ networks: { mainnet: { apiUrl: 'https://mempool.space/api' } } }))
 * ```
 */
export function createChainDataSource(config: { network: ChainNetwork }): ChainDataSource<{}> {
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
      extend<TNew>(factory: (ctx: DataSourceContext) => TNew): ChainDataSource<T & TNew> {
        const newMethods = factory(context)
        const merged = { ...methods, ...newMethods } as T & TNew
        return buildDataSource(merged)
      },
      ...methods,
    }
    return ds as ChainDataSource<T>
  }

  return buildDataSource({})
}
