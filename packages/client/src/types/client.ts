import type { ChainDataSource } from './data-source'
import type { NetworkType } from './network'

/**
 * A client instance that wraps a chain data source and exposes action methods.
 *
 * Actions are added via {@link Client.extend | .extend()}, which merges new methods
 * into the client. The client is the primary interface consumers use to interact
 * with the Bitcoin blockchain.
 *
 * @typeParam TDataSource - The capabilities available on the underlying data source
 * @typeParam TActions - The action methods added via `.extend()`
 *
 * @example
 * ```ts
 * const client: Client<BaseCapability, BtcActions> =
 *   createClient({ network: MAINNET, dataSource: ds })
 *     .extend(btcActions())
 *
 * const balance = await client.btcGetBalance('bc1q...')
 * ```
 */
export type Client<TDataSource = object, TActions = object> = {
  /** The Bitcoin network this client operates on. */
  network: NetworkType
  /** The underlying chain data source providing blockchain data access. */
  dataSource: ChainDataSource<TDataSource>
  /**
   * Adds a new action group to this client.
   *
   * @typeParam TNew - The interface of the actions being added
   * @param factory - A function that receives the current client and returns new action methods
   * @returns A new client with the additional action methods
   */
  extend<TNew>(
    factory: (client: Client<TDataSource, TActions>) => TNew
  ): Client<TDataSource, TActions & TNew>
} & TActions

/**
 * Configuration for creating a new client via {@link createClient}.
 *
 * @typeParam TDS - The capabilities available on the provided data source
 */
export interface ClientConfig<TDS> {
  /** The Bitcoin network this client should operate on. */
  network: NetworkType
  /** The chain data source to use. Must be configured for the same network. */
  dataSource: ChainDataSource<TDS>
}
