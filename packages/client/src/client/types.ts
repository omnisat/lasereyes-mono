/**
 * Read-only client type definitions.
 *
 * @module client/types
 */

import type { ChainNetwork } from '../chains'
import type { ActionGroup } from '../data-source/capabilities'
import type { ChainDataSource } from '../types/data-source'

/**
 * A client instance that wraps a chain data source and exposes action methods.
 *
 * Actions are added via {@link Client.extend | .extend()}, which merges new methods
 * into the client. The client is the primary interface consumers use to interact
 * with the Bitcoin blockchain.
 *
 * @typeParam Config - The client configuration including data source capabilities
 * @typeParam dsMethods - The capabilities available on the underlying data source
 * @typeParam clientActions - The action methods added via `.extend()`
 *
 * @example
 * ```ts
 * const client: Client<ClientConfig<BaseCapability>, BaseCapability, PublicActions> =
 *   createClient({ network: MAINNET, dataSource: ds }).extend(publicActions())
 *
 * const balance = await client.getBalance('bc1q...')
 * ```
 */
export type Client<
  Config extends ClientConfig<dsMethods>,
  dsMethods extends ActionGroup = {},
  clientActions extends ActionGroup = {},
> = {
  config: Config
  /**
   * Adds a new action group to this client.
   *
   * @typeParam TNew - The interface of the actions being added
   * @param factory - A function that receives the current client and returns new action methods
   * @returns A new client with the additional action methods
   */
  extend<TNew extends ActionGroup>(
    factory: (client: Client<Config, dsMethods, clientActions>) => TNew
  ): Client<Config, dsMethods, clientActions & TNew>
} & clientActions

/**
 * Configuration for creating a new client via {@link createClient}.
 *
 * @typeParam dsMethods - The capabilities available on the provided data source
 */
export interface ClientConfig<dsMethods extends ActionGroup = {}> {
  /** The Bitcoin network this client should operate on. */
  network: ChainNetwork
  /** The chain data source to use. Must be configured for the same network. */
  dataSource: ChainDataSource<dsMethods>
}
