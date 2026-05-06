/**
 * Wallet client types.
 *
 * @module types/wallet-client
 */

import type { Account } from '../account/types'
import type { ActionGroup } from '../data-source/capabilities'
import type { Client, ClientConfig } from './client'

/**
 * Configuration for creating a wallet client.
 *
 * @typeParam TDS - The data source capabilities
 * @typeParam TAccount - The account type
 */
export interface WalletClientConfig<TAccount extends Account, dsMethods extends ActionGroup = {}> extends ClientConfig<dsMethods> {
  /** The account providing address and key information */
  account: TAccount
}

/**
 * A wallet client with account context.
 *
 * @remarks
 * The wallet client extends the base client concept with account awareness.
 * It knows about the user's addresses and can provide account-aware convenience
 * methods. Signing capability is added via the signingActions() action group.
 *
 * @typeParam TDS - The data source capabilities
 * @typeParam TAccount - The account type (Account, WalletAccount, ReadOnlyAccount, etc.)
 * @typeParam TActions - The action methods added via `.extend()`
 *
 * @example
 * ```ts
 * import { createWalletClient, createWalletAccount } from '@omnisat/lasereyes-client/wallet'
 * import { walletBtcActions, signingActions } from '@omnisat/lasereyes-client/wallet'
 *
 * const account = createWalletAccount({
 *   addresses: [...],
 *   publicKeys: {...}
 * })
 *
 * const walletClient = createWalletClient({
 *   network: MAINNET,
 *   dataSource: ds,
 *   account
 * })
 *   .extend(walletBtcActions())
 *   .extend(signingActions(mySigner))
 *
 * // Use account-aware methods
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * ```
 */
export type WalletClient<WalletConfig extends WalletClientConfig<TAccount, dsMethods>, TAccount extends Account = Account, clientActions extends ActionGroup = {}, dsMethods extends ActionGroup = {}>  = Client<WalletConfig, dsMethods, clientActions> & {
  /**
   * Adds a new action group to this wallet client.
   *
   * @typeParam TNew - The interface of the actions being added
   * @param factory - A function that receives the current client and returns new action methods
   * @returns A new wallet client with the additional action methods
   */
  extend<TNew>(
    factory: (client: WalletClient<WalletConfig, TAccount, clientActions, dsMethods>) => TNew
  ): WalletClient<WalletConfig, TAccount, clientActions, dsMethods> & TNew
}
