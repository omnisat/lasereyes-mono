import { NetworkMismatchError } from './errors'
import type { ChainDataSource, Client, ClientConfig, NetworkType } from './types'

/**
 * Creates a new client instance that wraps a chain data source with action methods.
 *
 * The client validates that the configured network matches the data source's network,
 * and provides an {@link Client.extend | extend} method to add action groups (e.g., BTC actions).
 *
 * @param config - The client configuration
 * @param config.network - The Bitcoin network this client operates on
 * @param config.dataSource - The chain data source providing blockchain data
 * @returns A client instance that can be extended with action groups
 *
 * @throws {@link NetworkMismatchError} If the client network does not match the data source network
 *
 * @example
 * ```ts
 * import { createClient } from '@omnisat/lasereyes-client'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { btcActions } from '@omnisat/lasereyes-client/actions/btc'
 * import { MAINNET } from '@omnisat/lasereyes-client/constants/networks'
 *
 * const ds = createDataSource({ network: MAINNET })
 * const client = createClient({ network: MAINNET, dataSource: ds })
 *   .extend(btcActions())
 *
 * const balance = await client.btcGetBalance('bc1q...')
 * ```
 */
export function createClient<TDS>(config: ClientConfig<TDS>): Client<TDS> {
  if (config.dataSource.network !== config.network) {
    throw new NetworkMismatchError(config.network, config.dataSource.network)
  }

  function buildClient<TActions>(
    network: NetworkType,
    dataSource: ChainDataSource<TDS>,
    actions: TActions
  ): Client<TDS, TActions> {
    const client = {
      network,
      dataSource,
      extend<TNew>(factory: (c: Client<TDS, TActions>) => TNew): Client<TDS, TActions & TNew> {
        const newActions = factory(client)
        const merged = { ...actions, ...newActions } as TActions & TNew
        return buildClient(network, dataSource, merged)
      },
      ...(actions as object),
    } as Client<TDS, TActions>
    return client
  }

  return buildClient(config.network, config.dataSource, {} as object) as Client<TDS>
}
