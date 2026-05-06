/**
 * Wallet-client type definitions.
 *
 * @remarks
 * Type-parameter discipline:
 * - `Config`, `TAccount`, and `dsMethods` are fixed at construction
 *   time ({@link createWalletClient}) and passed through `.extend()`
 *   unchanged.
 * - Only `clientActions` accumulates. Each `.extend()` widens
 *   `clientActions` to `Prettify<clientActions & TNew>`.
 *
 * @module client/wallet-types
 */

import type { Account } from '../account/types'
import type { ActionGroup } from '../data-source/capabilities'
import type { Prettify } from '../types/utils'
import type { Client, ClientConfig } from './types'

/**
 * Configuration for creating a wallet client.
 *
 * @typeParam TAccount - The account type
 * @typeParam dsMethods - The data source capabilities
 */
export interface WalletClientConfig<
  TAccount extends Account,
  dsMethods extends ActionGroup = {},
> extends ClientConfig<dsMethods> {
  /** The account providing address and key information. */
  account: TAccount
}

/**
 * A wallet client with account context.
 *
 * @remarks
 * The wallet client extends the base client concept with account awareness.
 * It knows about the user's addresses and can provide account-aware
 * convenience methods. Signing capability is added via the
 * {@link signingActions} action group.
 *
 * @typeParam WalletConfig - The wallet client configuration
 * @typeParam TAccount - The account type (Account / WalletAccount / ReadOnlyAccount)
 * @typeParam clientActions - The action methods added via `.extend()`
 * @typeParam dsMethods - The data source capabilities
 *
 * @example
 * ```ts
 * const walletClient = createWalletClient({
 *   network: MAINNET,
 *   dataSource: ds,
 *   account,
 * })
 *   .extend(walletBtcActions())
 *   .extend(signingActions(mySigner))
 *
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * ```
 */
export type WalletClient<
  WalletConfig extends WalletClientConfig<TAccount, dsMethods>,
  TAccount extends Account = Account,
  clientActions extends ActionGroup = {},
  dsMethods extends ActionGroup = {},
> = Client<WalletConfig, dsMethods, clientActions> & {
  /**
   * Adds a new action group to this wallet client.
   *
   * @typeParam TNew - The action group being added
   * @param factory - A function that receives the current client and returns new action methods
   * @returns A new wallet client with the additional action methods
   */
  extend<TNew extends ActionGroup>(
    factory: (
      client: WalletClient<WalletConfig, TAccount, clientActions, dsMethods>
    ) => TNew
  ): WalletClient<WalletConfig, TAccount, Prettify<clientActions & TNew>, dsMethods>
}
