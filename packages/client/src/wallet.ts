/**
 * Wallet client subpath — account-aware Bitcoin operations.
 *
 * @remarks
 * This module provides everything you need to talk to a wallet's signer
 * with first-class types:
 * - Account factories: {@link createWalletAccount},
 *   {@link createReadOnlyAccount}.
 * - Wallet client: {@link createWalletClient}.
 * - Action factory: {@link walletBtcActions} — installs signing primitives
 *   *and* account-aware BTC operations in a single extend pass.
 * - Free actions: {@link signPsbt}, {@link signMessage},
 *   {@link broadcastPsbt}, {@link sendBtc}, {@link getAccountBalance},
 *   {@link getAccountUtxos}.
 *
 * The signer is passed to `createWalletClient` via `config.signer`, not to
 * a factory. No extend-order footgun: signing and BTC actions ship in the
 * same factory.
 *
 * @module wallet
 *
 * @example
 * ```ts
 * import {
 *   createWalletClient, createWalletAccount,
 *   walletBtcActions, providerSigner,
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
 *   .extend(walletBtcActions())
 *
 * const balance = await walletClient.getAccountBalance()
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
// Wallet-aware BTC actions (signing primitives + account-aware BTC ops)
export type { SendBtcParams } from './actions/wallet'
export {
  broadcastPsbt,
  getAccountBalance,
  getAccountUtxos,
  sendBtc,
  signMessage,
  signPsbt,
  walletBtcActions,
  type WalletBtcActions,
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
