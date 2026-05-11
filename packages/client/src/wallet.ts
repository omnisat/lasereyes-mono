/**
 * Wallet client subpath — account-aware Bitcoin operations.
 *
 * @remarks
 * This module provides everything you need to talk to a wallet's signer
 * with first-class types:
 * - Account factories: {@link createWalletAccount},
 *   {@link createReadOnlyAccount}.
 * - Wallet client: {@link createWalletClient}.
 * - Action factories: {@link signingActions}, {@link walletBtcActions}.
 * - Free actions: {@link sendBtc}, {@link signPsbt}, {@link signMessage},
 *   {@link broadcastPsbt}, {@link getBalance}, {@link getUtxos}.
 *
 * **Extension order matters when going through factories.** Extend
 * `signingActions()` before `walletBtcActions()` — the latter requires
 * `signPsbt` on the client at compile time. The signer itself is passed
 * to `createWalletClient` via `config.signer`, not to a factory.
 *
 * @module wallet
 *
 * @example
 * ```ts
 * import {
 *   createWalletClient, createWalletAccount,
 *   walletBtcActions, signingActions, providerSigner,
 * } from '@omnisat/lasereyes-client/wallet'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { MAINNET, AddressType } from '@omnisat/lasereyes-client'
 *
 * const account = createWalletAccount({
 *   addresses: [
 *     { address: 'bc1q...', purpose: 'payment', type: AddressType.P2WPKH },
 *     { address: 'bc1p...', purpose: 'ordinals', type: AddressType.P2TR },
 *   ],
 *   publicKeys: { payment: '02...', ordinals: '03...', taproot: '03...' },
 * })
 *
 * const ds = createDataSource({ network: MAINNET })
 *
 * const walletClient = createWalletClient({
 *   network: MAINNET, dataSource: ds, account,
 *   signer: providerSigner(provider),
 * })
 *   .extend(signingActions())
 *   .extend(walletBtcActions())
 *
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * ```
 */

export type {
  Account,
  AddressInfo,
  AddressPurpose,
  ReadOnlyAccountConfig,
  WalletAccount,
  WalletAccountConfig,
} from './account'
// Account factories + types
export { createReadOnlyAccount, createWalletAccount } from './account'
// Signing actions
export {
  broadcastPsbt,
  signingActions,
  signMessage,
  signPsbt,
} from './actions/signing'
// Wallet-aware BTC actions
export type { SendBtcParams } from './actions/wallet'
export {
  getBalance,
  getUtxos,
  sendBtc,
  walletBtcActions,
} from './actions/wallet'
// Wallet client factory + types
export { createWalletClient } from './client'
export type { WalletClient, WalletClientConfig } from './client/wallet-types'
// getAction — override-aware action dispatch (re-exported for ergonomic
// composition alongside wallet actions).
export { getAction } from './lib/get-action'
export type {
  MessageSigningProtocol,
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
} from './signer'
// Signer types + provider bridge
export { type ProviderLike, providerSigner } from './signer'
