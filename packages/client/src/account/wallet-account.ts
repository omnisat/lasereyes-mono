/**
 * Wallet account implementation.
 *
 * @module account/wallet-account
 */

import type { AddressInfo, AddressPurpose, WalletAccount } from '../types/account'

/**
 * Configuration for creating a wallet account.
 */
export interface WalletAccountConfig {
  /**
   * Addresses controlled by this account.
   * Must include at least one address with purpose 'payment'.
   */
  addresses: AddressInfo[]

  /**
   * Public keys for each address purpose.
   * Keys are hex-encoded compressed public keys.
   */
  publicKeys: Record<AddressPurpose, string>
}

/**
 * Creates a wallet account with signing capability (via external signer).
 *
 * @param config - Account configuration with addresses and public keys
 * @returns A WalletAccount instance
 * @throws {Error} If no payment address is provided or if addresses/keys are inconsistent
 *
 * @example
 * ```ts
 * import { createWalletAccount } from '@omnisat/lasereyes-client/wallet'
 * import { AddressType } from '@omnisat/lasereyes-client'
 *
 * const account = createWalletAccount({
 *   addresses: [
 *     {
 *       address: 'bc1q...',
 *       purpose: 'payment',
 *       type: AddressType.P2WPKH
 *     },
 *     {
 *       address: 'bc1p...',
 *       purpose: 'ordinals',
 *       type: AddressType.P2TR
 *     }
 *   ],
 *   publicKeys: {
 *     payment: '02abcd...',
 *     ordinals: '03ef01...',
 *     taproot: '03ef01...'
 *   }
 * })
 *
 * const paymentAddr = account.getAddress() // defaults to 'payment'
 * const ordinalsAddr = account.getAddress('ordinals')
 * const paymentPubkey = account.getPublicKey('payment')
 * ```
 */
export function createWalletAccount(config: WalletAccountConfig): WalletAccount {
  const { addresses, publicKeys } = config

  // Validation
  if (!addresses || addresses.length === 0) {
    throw new Error('WalletAccount must have at least one address')
  }

  // Ensure payment address exists
  const hasPayment = addresses.some(a => a.purpose === 'payment')
  if (!hasPayment) {
    throw new Error('WalletAccount must have a payment address')
  }

  // Ensure public keys match address purposes
  const purposes = new Set(addresses.map(a => a.purpose))
  for (const purpose of purposes) {
    if (!publicKeys[purpose]) {
      throw new Error(`Missing public key for address purpose: ${purpose}`)
    }
  }

  // Build address lookup map
  const addressMap = new Map<AddressPurpose, AddressInfo>()
  for (const addr of addresses) {
    addressMap.set(addr.purpose, addr)
  }

  return {
    getAddress(purpose: AddressPurpose = 'payment'): string {
      const addr = addressMap.get(purpose)
      if (!addr) {
        throw new Error(`No address found for purpose: ${purpose}`)
      }
      return addr.address
    },

    getPublicKey(purpose: AddressPurpose = 'payment'): string {
      const pubkey = publicKeys[purpose]
      if (!pubkey) {
        throw new Error(`No public key found for purpose: ${purpose}`)
      }
      return pubkey
    },

    addresses,
    publicKeys,
  }
}
