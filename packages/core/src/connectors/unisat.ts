/**
 * Unisat wallet connector.
 *
 * @module connectors/unisat
 */

import { BaseConnector } from './base'
import { loadUnisatWalletAdapter } from '../adapters/unisat'
import type { BitcoinProviderAdapter } from '../types/provider'
import type { CreateConnectorFn } from '../types/connector'

/**
 * Unisat Wallet connector.
 *
 * @remarks
 * Wraps the Unisat adapter and provides lifecycle management.
 * Unisat provides a single address that serves as both payment and ordinals.
 */
export class UnisatConnector extends BaseConnector {
  readonly id = 'unisat'
  readonly name = 'Unisat Wallet'
  readonly icon = 'https://unisat.io/img/logo.png'
  readonly rdns = 'io.unisat.wallet'

  /**
   * Load Unisat adapter.
   */
  protected loadAdapter(): BitcoinProviderAdapter | null {
    return loadUnisatWalletAdapter()
  }

  /**
   * Get download URL for Unisat extension.
   */
  getDownloadUrl(): string {
    return 'https://unisat.io/download'
  }
}

/**
 * Factory function to create Unisat connector.
 *
 * @returns Connector factory function
 *
 * @example
 * ```ts
 * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
 * import { unisatConnector } from '@omnisat/lasereyes-core/connectors'
 *
 * const core = createLaserEyesCore({
 *   connectors: [unisatConnector()]
 * })
 * ```
 */
export function unisatConnector(): CreateConnectorFn {
  return (config) => new UnisatConnector(config)
}
