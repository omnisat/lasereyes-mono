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
import type { Signer } from '../signer/types'
import type { Extension, Prettify } from '../types/utils'
import type { Client, ClientConfig } from './types'

/**
 * Configuration for creating a wallet client.
 *
 * @remarks
 * `signer` is optional — a wallet client may carry an account without a
 * signing capability (read-only-with-account contexts: observation,
 * multisig watching, signer attached later). Signing actions read the
 * signer from `config.signer` at runtime and throw a clear error if it's
 * absent.
 *
 * Type-level guard against accidentally calling signing actions on a
 * signer-less client comes from the factory path: `signingActions()`'s
 * factory accepts the signer at construction time, and `walletActions()`'s
 * `Actions extends …` constraint ensures `signPsbt` is on the client
 * before composing actions that depend on it.
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
  /**
   * Optional cryptographic signer. When present, signing actions
   * (`signPsbt`, `signMessage`, etc.) and composed actions that need them
   * can be invoked. When absent, calling a signing action surfaces a
   * runtime error.
   */
  signer?: Signer
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
   * @remarks
   * The `TNew extends Extension<'config' | 'extend'>` constraint protects
   * the wallet client's reserved members from being silently shadowed by a
   * factory return. Any other key with any value type is permitted.
   *
   * @typeParam TNew - The action group being added
   * @param factory - A function that receives the current client and returns new action methods
   * @returns A new wallet client with the additional action methods
   */
  extend<TNew extends Extension<'config' | 'extend'>>(
    factory: (
      client: WalletClient<WalletConfig, TAccount, clientActions, dsMethods>
    ) => TNew
  ): WalletClient<WalletConfig, TAccount, Prettify<clientActions & TNew>, dsMethods>
}
