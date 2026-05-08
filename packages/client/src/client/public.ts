/**
 * Read-only client factory.
 *
 * @module client/public
 */

import type { ActionGroup } from '../data-source/capabilities'
import { NetworkMismatchError } from '../errors'
import type { Prettify } from '../types/utils'
import type { Client, ClientConfig } from './types'

/**
 * Creates a new client instance that wraps a chain data source with action methods.
 *
 * The client validates that the configured network matches the data source's
 * network, and provides an {@link Client.extend | extend} method to add
 * action groups.
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
 * import { createClient, publicActions, MAINNET } from '@omnisat/lasereyes-client'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * const ds = createDataSource({ network: MAINNET })
 * const client = createClient({ network: MAINNET, dataSource: ds })
 *   .extend(publicActions())
 *
 * const balance = await client.getBalance('bc1q...')
 * ```
 */
export function createClient<dsMethods extends ActionGroup>(
  config: ClientConfig<dsMethods>
): Client<ClientConfig<dsMethods>, dsMethods, {}> {
  if (config.dataSource.network !== config.network) {
    throw new NetworkMismatchError(
      config.network.name,
      config.dataSource.network.name
    )
  }

  type Config = ClientConfig<dsMethods>

  function buildClient<TActions extends ActionGroup>(
    actions: TActions
  ): Client<Config, dsMethods, TActions> {
    const client = {
      config,
      extend<TNew extends ActionGroup>(
        factory: (c: Client<Config, dsMethods, TActions>) => TNew
      ): Client<Config, dsMethods, Prettify<TActions & TNew>> {
        const newActions = factory(client)
        const merged = { ...actions, ...newActions } as Prettify<
          TActions & TNew
        >
        return buildClient(merged) as Client<
          Config,
          dsMethods,
          Prettify<TActions & TNew>
        >
      },
      ...(actions as TActions),
    } as Client<Config, dsMethods, TActions>
    return client
  }

  return buildClient({} as {})
}
