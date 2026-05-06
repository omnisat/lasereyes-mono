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
 * **Extension order matters.** Extend `signingActions(signer)` before
 * `walletBtcActions()`.
 *
 * @module wallet
 *
 * @example
 * ```ts
 * import {
 *   createWalletClient, createWalletAccount,
 *   walletBtcActions, signingActions,
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
 * const walletClient = createWalletClient({ network: MAINNET, dataSource: ds, account })
 *   .extend(signingActions(signer))
 *   .extend(walletBtcActions())
 *
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * ```
 */

// Account factories + types
export { createReadOnlyAccount, createWalletAccount } from './account'
export type {
  Account,
  AddressInfo,
  AddressPurpose,
  ReadOnlyAccountConfig,
  WalletAccount,
  WalletAccountConfig,
} from './account'

// Wallet client factory + types
export { createWalletClient } from './client'
export type { WalletClient, WalletClientConfig } from './client/wallet-types'

// Wallet-aware BTC actions
export type { SendBtcParams } from './actions/wallet'
export {
  getBalance,
  getUtxos,
  sendBtc,
  walletBtcActions,
} from './actions/wallet'

// Signing actions
export {
  broadcastPsbt,
  signMessage,
  signPsbt,
  signingActions,
} from './actions/signing'

// Signer types
export type {
  MessageSigningProtocol,
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
} from './signer'
