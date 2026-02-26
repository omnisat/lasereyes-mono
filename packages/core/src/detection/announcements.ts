/**
 * EIP-6963-like wallet announcement system for Bitcoin.
 *
 * @module detection/announcements
 */

import type { BitcoinProviderAdapter } from '../types/provider'

/**
 * Wallet announcement detail (similar to EIP-6963).
 *
 * @remarks
 * Wallets announce themselves with this structure via custom events.
 * This enables discovery of multiple injected wallet providers.
 */
export interface WalletAnnouncement {
  /** Unique identifier for this wallet instance */
  uuid: string

  /** Human-readable wallet name */
  name: string

  /** Wallet icon (data URI or URL) */
  icon: string

  /** Optional reverse DNS (e.g., 'com.unisat.wallet') */
  rdns?: string

  /** The provider instance conforming to Bitcoin Provider Standard */
  provider: BitcoinProviderAdapter
}

/**
 * Bitcoin wallet announcement events.
 *
 * @remarks
 * Following EIP-6963 pattern for Ethereum but adapted for Bitcoin.
 */
export const ANNOUNCE_PROVIDER_EVENT = 'bitcoin:announceProvider'
export const REQUEST_PROVIDER_EVENT = 'bitcoin:requestProvider'

/**
 * Listen for wallet announcements.
 *
 * @param callback - Called when a wallet announces itself
 * @returns Cleanup function to stop listening
 *
 * @example
 * ```ts
 * const cleanup = listenForWalletAnnouncements((announcement) => {
 *   console.log('Wallet detected:', announcement.name)
 *   // Create connector from announcement.provider
 * })
 *
 * // Later: cleanup()
 * ```
 */
export function listenForWalletAnnouncements(
  callback: (announcement: WalletAnnouncement) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      const announcement = event.detail as WalletAnnouncement
      if (announcement && announcement.provider) {
        callback(announcement)
      }
    }
  }

  // Listen for announcements
  window.addEventListener(ANNOUNCE_PROVIDER_EVENT, handler)

  // Request wallets to announce themselves
  window.dispatchEvent(new Event(REQUEST_PROVIDER_EVENT))

  // Return cleanup function
  return () => {
    window.removeEventListener(ANNOUNCE_PROVIDER_EVENT, handler)
  }
}

/**
 * Announce a wallet provider.
 *
 * @remarks
 * Wallet extensions should call this function to announce themselves.
 * This is part of the Bitcoin Provider Standard.
 *
 * @param announcement - Wallet announcement details
 *
 * @example
 * ```ts
 * // In wallet extension code:
 * announceWallet({
 *   uuid: crypto.randomUUID(),
 *   name: 'My Bitcoin Wallet',
 *   icon: 'data:image/svg+xml;base64,...',
 *   rdns: 'com.example.wallet',
 *   provider: myProviderInstance
 * })
 * ```
 */
export function announceWallet(announcement: WalletAnnouncement): void {
  if (typeof window === 'undefined') return

  // Announce immediately
  window.dispatchEvent(
    new CustomEvent(ANNOUNCE_PROVIDER_EVENT, {
      detail: announcement,
    })
  )

  // Also listen for requests and re-announce
  const requestHandler = () => {
    window.dispatchEvent(
      new CustomEvent(ANNOUNCE_PROVIDER_EVENT, {
        detail: announcement,
      })
    )
  }

  window.addEventListener(REQUEST_PROVIDER_EVENT, requestHandler)
}
