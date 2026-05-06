/**
 * Base adapter class for normalizing wallet provider APIs.
 *
 * @module adapters/base
 */

import type { BitcoinProvider, ProviderCapabilities, ProviderRpcError } from '../types/provider'

/**
 * Bitcoin Provider Adapter.
 * Wraps non-conforming wallet providers and normalizes their API.
 *
 * @remarks
 * Adapters translate wallet-specific APIs to the standard provider interface.
 * Once wallets conform to the standard, adapters can be removed.
 */
export interface BitcoinProviderAdapter extends BitcoinProvider {
  /**
   * Access to underlying wallet provider.
   * Use for wallet-specific methods not in the standard.
   */
  readonly rawProvider: any

  /** Wallet identifier (e.g., 'unisat', 'xverse') */
  readonly walletId: string

  /** Human-readable wallet name */
  readonly walletName: string
}

/**
 * Base adapter class that wallet-specific adapters extend.
 *
 * @remarks
 * Provides common functionality for normalizing wallet APIs to the
 * Bitcoin Provider Standard. Each wallet adapter translates its
 * wallet-specific API to the standard RPC methods.
 *
 * Once a wallet conforms to the standard, its adapter can be removed.
 */
export abstract class BaseAdapter implements BitcoinProviderAdapter {
  abstract readonly walletId: string
  abstract readonly walletName: string
  readonly rawProvider: any

  constructor(rawProvider: any) {
    this.rawProvider = rawProvider
  }

  /**
   * Handle RPC requests.
   * Subclasses implement this to translate standard methods to wallet-specific APIs.
   */
  abstract request: BitcoinProviderAdapter['request']

  /**
   * Build capabilities for this wallet.
   * Subclasses implement this to describe what methods they support.
   */
  protected abstract buildCapabilities(): ProviderCapabilities

  /**
   * Event methods delegate to raw provider.
   */
  on(event: string, listener: (...args: any[]) => void): void {
    if (this.rawProvider.on) {
      this.rawProvider.on(event, listener)
    }
  }

  removeListener(event: string, listener: (...args: any[]) => void): void {
    if (this.rawProvider.removeListener) {
      this.rawProvider.removeListener(event, listener)
    } else if (this.rawProvider.off) {
      this.rawProvider.off(event, listener)
    }
  }

  /**
   * Helper: Create ProviderRpcError
   */
  protected createError(code: number, message: string, data?: unknown): ProviderRpcError {
    const error = new Error(message) as ProviderRpcError
    error.name = 'ProviderRpcError'
    error.code = code
    error.data = data
    return error
  }

  /**
   * Helper: Throw method not supported error
   */
  protected throwMethodNotSupported(method: string): never {
    throw this.createError(-32601, `Method ${method} not supported by ${this.walletName}`)
  }
}
