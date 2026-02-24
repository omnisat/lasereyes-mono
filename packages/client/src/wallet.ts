/**
 * Wallet client module - account-aware Bitcoin operations.
 *
 * @remarks
 * This module provides wallet-aware abstractions over the base client, including:
 * - Account types (WalletAccount, ReadOnlyAccount)
 * - Wallet client with account context
 * - Account-aware action groups
 * - Signing capabilities via action groups
 *
 * @module wallet
 *
 * @example
 * ```ts
 * import {
 *   createWalletClient,
 *   createWalletAccount,
 *   walletBtcActions,
 *   signingActions
 * } from '@omnisat/lasereyes-client/wallet'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { MAINNET, AddressType } from '@omnisat/lasereyes-client'
 *
 * // Create account
 * const account = createWalletAccount({
 *   addresses: [
 *     { address: 'bc1q...', purpose: 'payment', type: AddressType.P2WPKH },
 *     { address: 'bc1p...', purpose: 'ordinals', type: AddressType.P2TR }
 *   ],
 *   publicKeys: {
 *     payment: '02...',
 *     ordinals: '03...',
 *     taproot: '03...'
 *   }
 * })
 *
 * // Create signer
 * const signer = {
 *   signPsbt: async (opts) => window.unisat.signPsbt(opts.psbt),
 *   signMessage: async (msg, opts) => window.unisat.signMessage(msg, opts?.address)
 * }
 *
 * // Create wallet client
 * const ds = createDataSource({ network: MAINNET })
 * const walletClient = createWalletClient({
 *   network: MAINNET,
 *   dataSource: ds,
 *   account
 * })
 *   .extend(walletBtcActions())
 *   .extend(signingActions(signer))
 *
 * // Use account-aware methods
 * const balance = await walletClient.getBalance()
 * await walletClient.sendBtc({ to: 'bc1q...', amount: 10000 })
 * const sig = await walletClient.signMessage('Hello Bitcoin!')
 * ```
 */

export type { ReadOnlyAccountConfig, WalletAccountConfig } from './account'
// Account factories
export { createReadOnlyAccount, createWalletAccount } from './account'
export type { SendBtcParams as WalletSendBtcParams, WalletBtcActions } from './actions/wallet-btc'

// Actions
export { getBalance, getUtxos, sendBtc, walletBtcActions } from './actions/wallet-btc'
export type { SigningActions } from './actions/wallet-signing'

export { signingActions } from './actions/wallet-signing'
// Re-export types for convenience
export type {
  // Account types
  Account,
  AddressInfo,
  AddressPurpose,
  SignedPsbt,
  // Signer
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
  WalletAccount,
  // Wallet client
  WalletClient,
  WalletClientConfig,
} from './types'
// Wallet client factory
export { createWalletClient } from './wallet-client'
