/**
 * Xverse wallet connector.
 *
 * @module connectors/xverse
 */

import { BaseConnector } from './base'
import { loadXverseWalletAdapter } from '../adapters/xverse'
import type { BitcoinProviderAdapter } from '../types/provider'
import type { CreateConnectorFn } from '../types/connector'

/**
 * Xverse Wallet connector.
 *
 * @remarks
 * Wraps the Xverse adapter and provides lifecycle management.
 * Xverse provides separate payment (P2WPKH) and ordinals (P2TR) addresses.
 */
export class XverseConnector extends BaseConnector {
  readonly id = 'xverse'
  readonly name = 'Xverse Wallet'
  readonly icon = 'https://www.xverse.app/favicon.ico'
  readonly rdns = 'app.xverse.wallet'

  /**
   * Load Xverse adapter.
   */
  protected loadAdapter(): BitcoinProviderAdapter | null {
    return loadXverseWalletAdapter()
  }

  /**
   * Get download URL for Xverse extension.
   */
  getDownloadUrl(): string {
    return 'https://www.xverse.app/download'
  }

  /**
   * Handle mobile redirect for Xverse.
   *
   * @remarks
   * Xverse supports mobile wallet connection via deep link.
   */
  connectMobile(): void {
    if (typeof window === 'undefined') return

    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    // Redirect to Xverse mobile app
    const url = `xverse://browser?url=${encodeURIComponent(window.location.href)}`
    window.location.href = url
  }

  /**
   * Override connect to handle mobile redirect.
   */
  async connect() {
    // Check if adapter is available
    if (!this.isReady() && typeof window !== 'undefined') {
      // Check if on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        this.connectMobile()
        // Wait for app to return (or timeout)
        throw new Error('Redirecting to Xverse mobile app...')
      }
    }

    return super.connect()
  }
}

/**
 * Factory function to create Xverse connector.
 *
 * @returns Connector factory function
 *
 * @example
 * ```ts
 * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
 * import { xverseConnector } from '@omnisat/lasereyes-core/connectors'
 *
 * const core = createLaserEyesCore({
 *   connectors: [xverseConnector()]
 * })
 * ```
 */
export function xverseConnector(): CreateConnectorFn {
  return (config) => new XverseConnector(config)
}
