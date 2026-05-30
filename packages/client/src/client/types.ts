/**
 * Read-only client type definitions.
 *
 * @remarks
 * Type-parameter discipline:
 * - `Config` and `dsMethods` are fixed at construction time
 *   ({@link createClient}) and passed through `.extend()` unchanged.
 * - Only `clientActions` accumulates. Each `.extend()` widens
 *   `clientActions` to `Prettify<clientActions & TNew>`.
 *
 * @module client/types
 */

import type { ChainNetwork } from '../chains'
import type { ActionGroup } from '../data-source/capabilities'
import type { ChainDataSource } from '../types/data-source'
import type { ExactPartial, Extension, Prettify } from '../types/utils'
import type { ExtendableProtectedActions } from './extendable-actions'

/**
 * A client instance that wraps a chain data source and exposes action methods.
 *
 * Actions are added via {@link Client.extend | .extend()}, which merges new
 * methods into the client. The client is the primary interface consumers use
 * to interact with the Bitcoin blockchain.
 *
 * @typeParam Config - The client configuration including data source capabilities
 * @typeParam dsMethods - The capabilities available on the underlying data source
 * @typeParam clientActions - The action methods added via `.extend()`
 *
 * @example
 * ```ts
 * const client = createClient({ network: MAINNET, dataSource: ds })
 *   .extend(publicActions())
 *
 * const balance = await client.getAddressBalance('bc1q...')
 * ```
 */
export type Client<
  Config extends ClientConfig<dsMethods>,
  dsMethods extends ActionGroup = {},
  clientActions extends ActionGroup = {},
> = {
  config: Config
} & {
  /**
   * Adds a new action group to this client.
   *
   * @remarks
   * Two-part constraint on `TNew`:
   *
   * 1. `Extension<'config' | 'extend'>` — reserved-member protection.
   *    Cannot redeclare `config` or `extend` with real values.
   * 2. `ExactPartial<ExtendableProtectedActions>` — shape protection.
   *    Any key matching a dispatched action's canonical name (those
   *    listed in {@link ExtendableProtectedActions}) must have the
   *    canonical signature. Mis-shaped overrides fail at compile time.
   *    Novel keys (not in the registry) remain unconstrained.
   *
   * Mirrors viem's `.extend()` (`createClient.ts`).
   *
   * @typeParam TNew - The action group being added
   * @param factory - A function that receives the current client and returns new action methods
   * @returns A new client with the additional action methods
   */
  extend<TNew extends Extension<'config' | 'extend'> & ExactPartial<ExtendableProtectedActions>>(
    factory: (client: Client<Config, dsMethods, clientActions>) => TNew
  ): Client<Config, dsMethods, Prettify<clientActions & TNew>>
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
