/**
 * Account factories and types.
 *
 * @remarks
 * Accounts are address (and optionally public-key) containers. Signing is
 * handled separately by a {@link Signer} attached to the wallet client.
 *
 * @module account
 */

export type { ReadOnlyAccountConfig } from './readonly-account'
export { createReadOnlyAccount } from './readonly-account'
export type { Account, AddressInfo, AddressPurpose, WalletAccount } from './types'
export type { WalletAccountConfig } from './wallet-account'
export { createWalletAccount } from './wallet-account'
