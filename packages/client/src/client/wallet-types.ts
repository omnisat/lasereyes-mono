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
import type { ActionGroup } from '../backend/capabilities'
import type { Signer } from '../signer/types'
import type { ExactPartial, Extension, Prettify } from '../types/utils'
import type { ExtendableProtectedActions } from './extendable-actions'
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
 * No compile-time guard against extending a signer-less client with
 * `walletBtcActions()` — the factory installs `signPsbt` / `signMessage`
 * / `broadcastPsbt` whether or not a signer is configured, and the
 * action bodies throw a clear runtime error if `config.signer` is
 * absent at call time. Signer-less wallet clients are useful for
 * read-only-with-account contexts (observation, multisig watching,
 * deferring signer attachment).
 *
 * @typeParam TAccount - The account type
 * @typeParam dsMethods - The backend capabilities
 */
export interface WalletClientConfig<TAccount extends Account, dsMethods extends ActionGroup = {}>
  extends ClientConfig<dsMethods> {
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
 * {@link walletBtcActions} action group (which installs both BTC ops
 * and signing primitives).
 *
 * @typeParam WalletConfig - The wallet client configuration
 * @typeParam TAccount - The account type (Account / WalletAccount / ReadOnlyAccount)
 * @typeParam clientActions - The action methods added via `.extend()`
 * @typeParam dsMethods - The backend capabilities
 *
 * @example
 * ```ts
 * const walletClient = createWalletClient({
 *   network: MAINNET,
 *   backend: ds,
 *   account,
 * })
 *   .extend(walletBtcActions())
 *
 * const balance = await walletClient.getAccountBalance()
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
   * Same two-part constraint as {@link Client.extend}: reserved-member
   * protection + canonical-shape protection against
   * {@link ExtendableProtectedActions}.
   *
   * @typeParam TNew - The action group being added
   * @param factory - A function that receives the current client and returns new action methods
   * @returns A new wallet client with the additional action methods
   */
  extend<TNew extends Extension<'config' | 'extend'> & ExactPartial<ExtendableProtectedActions>>(
    factory: (client: WalletClient<WalletConfig, TAccount, clientActions, dsMethods>) => TNew
  ): WalletClient<WalletConfig, TAccount, Prettify<clientActions & TNew>, dsMethods>
}
