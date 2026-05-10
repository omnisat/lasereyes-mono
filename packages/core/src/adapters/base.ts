/**
 * Base adapter — translates a non-conforming wallet API to the Bitcoin
 * Provider Standard.
 *
 * @remarks
 * Adapters are temporary: once a wallet implements {@link BitcoinProvider}
 * natively, its adapter file can be deleted; only the connector remains.
 *
 * @module adapters/base
 */

import { ProviderErrorCode, ProviderRpcError } from '@omnisat/lasereyes-client'
import type { BitcoinProvider, ProviderCapabilities } from '../types/provider'

/**
 * Adapter interface — a {@link BitcoinProvider} that also exposes the
 * underlying wallet object for wallet-specific escapes.
 */
export interface BitcoinProviderAdapter extends BitcoinProvider {
  /**
   * The underlying wallet provider object.
   *
   * @remarks
   * Use only for wallet-specific methods not yet expressible through the
   * standard `request()` interface. Prefer `request()` whenever possible.
   */
  readonly rawProvider: any

  /** Wallet identifier (e.g. `'unisat'`, `'xverse'`). */
  readonly walletId: string

  /** Human-readable wallet name. */
  readonly walletName: string
}

/**
 * Base class wallet-specific adapters extend.
 *
 * Each adapter implements {@link request} to dispatch standard
 * `bitcoin_*` method names to the wallet's native API, and
 * {@link buildCapabilities} to describe what the wallet supports per
 * network.
 */
export abstract class BaseAdapter implements BitcoinProviderAdapter {
  abstract readonly walletId: string
  abstract readonly walletName: string
  readonly rawProvider: any

  constructor(rawProvider: any) {
    this.rawProvider = rawProvider
  }

  /**
   * Translate a standard Bitcoin RPC call to the wallet's native API.
   * Subclasses dispatch on `method` and call into `rawProvider`.
   */
  abstract request(method: string, params?: { [key: string]: unknown }): Promise<unknown>

  /**
   * Per-network capability matrix this wallet exposes.
   * Subclasses return a `ProviderCapabilities` shaped to the wallet.
   */
  protected abstract buildCapabilities(): ProviderCapabilities

  // ============================================================================
  // Event delegation
  // ============================================================================

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

  // ============================================================================
  // Error helpers
  // ============================================================================

  /** Construct a {@link ProviderRpcError} for this adapter. */
  protected createError(code: number, message: string, data?: unknown): ProviderRpcError {
    return new ProviderRpcError(code, message, data)
  }

  /** Throw "method not supported" with the standard JSON-RPC code. */
  protected throwMethodNotSupported(method: string): never {
    throw this.createError(
      ProviderErrorCode.METHOD_NOT_FOUND,
      `Method ${method} not supported by ${this.walletName}`
    )
  }
}
