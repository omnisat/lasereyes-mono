/**
 * Read-only account implementation.
 *
 * @module account/readonly-account
 */

import type { Account, AddressInfo, AddressPurpose } from '../types/account'

/**
 * Configuration for creating a read-only account.
 *
 * @remarks
 * A read-only account has addresses but no signing capability.
 * It is suitable for watching balances and constructing unsigned transactions
 * when combined with an external signing flow.
 */
export interface ReadOnlyAccountConfig {
  /**
   * Addresses to include in this account.
   * Must include at least one address with purpose `'payment'`.
   */
  addresses: AddressInfo[]
}

/**
 * Creates a read-only account with address access but no signing capability.
 *
 * @remarks
 * Use this when you have addresses but no in-process signer — for example,
 * when building watch-only wallets or hardware-signer integrations where
 * signing happens out-of-band.
 *
 * @param config - Account configuration with addresses
 * @returns An {@link Account} instance
 * @throws {Error} If no payment address is provided
 *
 * @example
 * ```ts
 * import { createReadOnlyAccount } from '@omnisat/lasereyes-client/wallet'
 * import { AddressType } from '@omnisat/lasereyes-client'
 *
 * const account = createReadOnlyAccount({
 *   addresses: [
 *     { address: 'bc1q...', purpose: 'payment', type: AddressType.P2WPKH },
 *     { address: 'bc1p...', purpose: 'ordinals', type: AddressType.P2TR },
 *   ],
 * })
 *
 * const paymentAddr = account.getAddress()          // 'payment' (default)
 * const ordinalsAddr = account.getAddress('ordinals')
 * ```
 */
export function createReadOnlyAccount(config: ReadOnlyAccountConfig): Account {
  const { addresses } = config

  if (!addresses || addresses.length === 0) {
    throw new Error('ReadOnlyAccount must have at least one address')
  }

  const hasPayment = addresses.some((a) => a.purpose === 'payment')
  if (!hasPayment) {
    throw new Error('ReadOnlyAccount must have a payment address')
  }

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

    addresses,
  }
}
