/**
 * Account types for wallet integration.
 *
 * @remarks
 * Accounts represent the addresses (and optionally public keys) controlled by
 * a wallet. They are pure data containers — accounts know nothing about
 * signing. Signing capability is layered on separately via the
 * {@link Signer} interface and reached through the actions installed by
 * {@link walletBtcActions}.
 *
 * @module account/types
 */

import type { AddressType } from '../types/psbt'

/**
 * Address purpose in Bitcoin wallet context.
 *
 * @remarks
 * Bitcoin wallets typically expose multiple addresses for different roles:
 * - `payment`: Standard payments and change outputs (P2WPKH or P2SH-P2WPKH).
 * - `ordinals`: Ordinals, inscriptions, runes (P2TR / taproot).
 * - `taproot`: General taproot usage where a separate ordinals address
 *    isn't appropriate.
 */
export type AddressPurpose = 'payment' | 'ordinals' | 'taproot'

/**
 * Information about a single controlled address.
 */
export interface AddressInfo {
  /** Bitcoin address string. */
  address: string
  /** Purpose / role of this address. */
  purpose: AddressPurpose
  /** Address type (P2PKH, P2WPKH, P2TR, …). */
  type: AddressType
}

/**
 * Base account interface — addresses only.
 *
 * @remarks
 * All account types implement this. Use a `ReadOnlyAccount` for watch-only
 * scenarios; use a {@link WalletAccount} when you need public keys for PSBT
 * construction.
 */
export interface Account {
  /**
   * Resolve the address for a purpose.
   *
   * @param purpose - Purpose to look up; defaults to `'payment'`.
   * @throws Error if no address exists for the given purpose.
   */
  getAddress(purpose?: AddressPurpose): string

  /** All addresses controlled by this account. */
  readonly addresses: AddressInfo[]
}

/**
 * Account that also exposes hex-encoded public keys.
 *
 * @remarks
 * Required for actions that construct PSBTs against P2SH-P2WPKH or other
 * address types where the redeem script is derived from the public key. The
 * account provides the keys; signing happens via the separate {@link Signer}.
 */
export interface WalletAccount extends Account {
  /**
   * Resolve the public key (hex-encoded) for a purpose.
   *
   * @param purpose - Purpose to look up; defaults to `'payment'`.
   * @throws Error if no public key exists for the given purpose.
   */
  getPublicKey(purpose?: AddressPurpose): string

  /** Public keys for each address purpose. */
  readonly publicKeys: Readonly<Record<AddressPurpose, string>>
}
