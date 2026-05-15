/**
 * Read-only client factory.
 *
 * @module client/public
 */

import type { ChainNetwork, NetworkId } from '../chains'
import { resolveNetwork } from '../chains'
import type { ActionGroup } from '../data-source/capabilities'
import { NetworkMismatchError } from '../errors'
import type { ChainDataSource } from '../types/data-source'
import type { Extension, Prettify } from '../types/utils'
import type { Client, ClientConfig } from './types'

/**
 * Creates a new client instance that wraps a chain data source with action methods.
 *
 * The client validates that the configured network matches the data source's
 * network, and provides an {@link Client.extend | extend} method to add
 * action groups.
 *
 * @param config - The client configuration
 * @param config.network - The Bitcoin network this client operates on. Pass
 *   either a {@link NetworkId} string (e.g. `'mainnet'`) or a
 *   {@link ChainNetwork} value (e.g. `MAINNET`). Strings are looked up via the
 *   built-in `NETWORKS` registry; custom chains must be passed as
 *   `ChainNetwork` values produced by `defineChain()`.
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
 * const ds = createDataSource({ network: 'mainnet' })
 * const client = createClient({ network: 'mainnet', dataSource: ds })
 *   .extend(publicActions())
 *
 * const balance = await client.getAddressBalance('bc1q...')
 * ```
 */
export function createClient<dsMethods extends ActionGroup>(config: {
  network: NetworkId | ChainNetwork
  dataSource: ChainDataSource<dsMethods>
}): Client<ClientConfig<dsMethods>, dsMethods, {}> {
  const network = resolveNetwork(config.network)
  if (config.dataSource.network !== network) {
    throw new NetworkMismatchError(network.name, config.dataSource.network.name)
  }

  type Config = ClientConfig<dsMethods>
  const resolvedConfig: Config = { network, dataSource: config.dataSource }

  function buildClient<TActions extends ActionGroup>(
    actions: TActions
  ): Client<Config, dsMethods, TActions> {
    const client = {
      config: resolvedConfig,
      extend<TNew extends Extension<'config' | 'extend'>>(
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
