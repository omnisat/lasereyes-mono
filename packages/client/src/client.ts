import { NetworkMismatchError } from './errors'
import type { ActionGroup, Client, ClientConfig } from './types'

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
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * const ds = createDataSource({ network: MAINNET })
 * const client = createClient({ network: MAINNET, dataSource: ds })
 *   .extend(btcActions())
 *
 * const balance = await client.btcGetBalance('bc1q...')
 * ```
 */
export function createClient<Config extends ClientConfig<dsMethods>, dsMethods extends ActionGroup = {}, clientActions extends ActionGroup = {}>(
  config: Config
): Client<Config, dsMethods, clientActions> {
  if (config.dataSource.network !== config.network) {
    throw new NetworkMismatchError(config.network.name, config.dataSource.network.name)
  }

  function buildClient<TActions extends ActionGroup>(
    config: Config,
    actions: TActions
  ): Client<Config, dsMethods, TActions> {
    const client = {
      config,
      extend<TNew>(factory: (c: Client<Config, dsMethods, TActions>) => TNew): Client<Config, dsMethods, TActions & TNew> {
        const newActions = factory(client)
        const merged = { ...actions, ...newActions } as TActions & TNew
        return buildClient(config, merged)
      },
      ...(actions as TActions),
    } as Client<Config, dsMethods, TActions>
    return client
  }

  return buildClient<clientActions>(config, {} as clientActions)
}
