/**
 * Account types for wallet integration.
 *
 * Accounts represent the addresses and keys controlled by a wallet, but do not
 * contain signing logic. Signing is handled by the wallet client via a separate Signer.
 *
 * @module types/account
 */

import type { AddressType } from './psbt'

/**
 * Address purpose in Bitcoin wallet context.
 *
 * @remarks
 * Different transaction types require different address types:
 * - `payment`: Standard payments, change outputs (P2WPKH, P2SH-P2WPKH)
 * - `ordinals`: Ordinals, inscriptions, runes (P2TR taproot)
 * - `taproot`: General taproot usage
 */
export type AddressPurpose = 'payment' | 'ordinals' | 'taproot'

/**
 * Information about a controlled address.
 */
export interface AddressInfo {
  /** Bitcoin address string */
  address: string
  /** Purpose/use case for this address */
  purpose: AddressPurpose
  /** Bitcoin address type (P2PKH, P2WPKH, P2TR, etc.) */
  type: AddressType
}

/**
 * Base account interface providing address information.
 *
 * @remarks
 * All account types must implement this interface. Accounts are data containers
 * that know about addresses but do not handle signing. Signing is delegated to
 * the wallet client via a Signer interface.
 */
export interface Account {
  /**
   * Get address for the specified purpose.
   *
   * @param purpose - Address purpose, defaults to 'payment'
   * @returns Bitcoin address string
   * @throws {Error} If no address exists for the given purpose
   */
  getAddress(purpose?: AddressPurpose): string

  /**
   * All addresses controlled by this account.
   */
  readonly addresses: AddressInfo[]
}

/**
 * Wallet account with public key access.
 *
 * @remarks
 * Used for signing operations that require public keys (e.g., PSBT construction
 * for P2SH-P2WPKH addresses). The account provides keys but does not sign directly.
 */
export interface WalletAccount extends Account {
  /**
   * Get public key (hex-encoded) for the specified purpose.
   *
   * @param purpose - Key purpose, defaults to 'payment'
   * @returns Hex-encoded public key
   * @throws {Error} If no public key exists for the given purpose
   */
  getPublicKey(purpose?: AddressPurpose): string

  /**
   * Public keys for each address purpose.
   */
  readonly publicKeys: Readonly<Record<AddressPurpose, string>>
}
