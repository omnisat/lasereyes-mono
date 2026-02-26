/**
 * Base adapter class for normalizing wallet provider APIs.
 *
 * @module adapters/base
 */

import type {
  AddressType,
  BitcoinProviderAdapter,
  ProviderCapabilities,
  ProviderRpcError,
  RequestArguments,
} from '../types/provider'

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
  abstract request(args: RequestArguments): Promise<unknown>

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
   * Helper: Detect address type from address string.
   */
  protected detectAddressType(address: string): AddressType {
    // Taproot (P2TR) - starts with bc1p or tb1p
    if (address.startsWith('bc1p') || address.startsWith('tb1p') || address.startsWith('bcrt1p')) {
      return 'p2tr'
    }

    // Native SegWit (P2WPKH) - starts with bc1q or tb1q
    if (
      address.startsWith('bc1q') ||
      address.startsWith('tb1q') ||
      address.startsWith('bcrt1q')
    ) {
      return 'p2wpkh'
    }

    // P2SH (could be P2SH-P2WPKH) - starts with 3 or 2
    if (address.startsWith('3') || address.startsWith('2')) {
      return 'p2sh-p2wpkh'
    }

    // Legacy P2PKH - starts with 1
    if (address.startsWith('1')) {
      return 'p2pkh'
    }

    // Default to P2WPKH
    return 'p2wpkh'
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
