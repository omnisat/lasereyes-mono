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

import type { NetworkId } from '@omnisat/lasereyes-client'
import { ProviderErrorCode, ProviderRpcError } from '@omnisat/lasereyes-client'
import type { WalletAccountConfig } from '@omnisat/lasereyes-client/wallet'
import EventEmitter from 'eventemitter3'
import type {
  BitcoinProvider,
  BitcoinProviderEvent,
  ConnectInfo,
  DisconnectInfo,
  ProviderCapabilities,
  ProviderMessage,
} from '../types/provider'

/**
 * Typed event map for adapter-emitted events.
 *
 * @remarks
 * Mirrors the {@link BitcoinProviderEvent} enum exactly. Listeners
 * subscribed via `adapter.on(eventName, handler)` get the typed payload.
 */
export type AdapterEventMap = {
  /**
   * Account changed. Payload is wire-data ({@link WalletAccountConfig})
   * — the consumer constructs a `WalletAccount` via `createWalletAccount`
   * before storing on state. Mirrors the JSON-serializable contract on
   * `bitcoin_(get|request)Accounts`.
   */
  accountsChanged: [WalletAccountConfig]
  networkChanged: [NetworkId]
  connect: [ConnectInfo]
  disconnect: [DisconnectInfo]
  message: [ProviderMessage]
}

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

  /**
   * Internal emitter for normalized `BitcoinProviderEvent`s.
   *
   * @remarks
   * Subclasses subscribe to wallet-native events on `rawProvider`
   * (which may use different names, e.g. `accountChanged` vs the spec's
   * `accountsChanged`) and re-emit through this emitter using the
   * standard names. Consumers (core's `connect` action, app code)
   * subscribe via `adapter.on(eventName, handler)` and get the
   * spec-normalized payload.
   *
   * Override {@link subscribeRawEvents} to attach wallet-specific
   * listeners on construction.
   *
   * @internal
   */
  protected readonly emitter = new EventEmitter<AdapterEventMap>()

  constructor(rawProvider: any) {
    this.rawProvider = rawProvider
    this.subscribeRawEvents()
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

  /**
   * Subscribe to the wallet's native events and re-emit normalized
   * `BitcoinProviderEvent`s on the internal {@link emitter}.
   *
   * @remarks
   * Default implementation passes through `accountsChanged`,
   * `networkChanged`, `connect`, `disconnect`, and `message` directly
   * (suitable for wallets that already use the spec event names — most
   * window-injected Bitcoin wallets, including Unisat). Override in
   * subclasses that use different event names (e.g. Xverse via
   * sats-connect; Magic Eden; Phantom) to do the mapping.
   *
   * Subclasses overriding this should:
   * 1. Call `this.rawProvider.on(walletEventName, payload => { ... })`.
   * 2. Translate the payload to the spec-shaped form.
   * 3. Call `this.emitter.emit(specEventName, payload)`.
   */
  protected subscribeRawEvents(): void {
    const raw = this.rawProvider
    if (!raw?.on) return

    const passthrough = (event: BitcoinProviderEvent) => {
      raw.on(event, (...args: unknown[]) => {
        // eventemitter3's `emit` is variadic; cast through unknown to
        // accommodate the union event map without per-event narrowing.
        ;(this.emitter.emit as (e: string, ...args: unknown[]) => boolean)(event, ...args)
      })
    }
    passthrough('accountsChanged')
    passthrough('networkChanged')
    passthrough('connect')
    passthrough('disconnect')
    passthrough('message')
  }

  // ============================================================================
  // BitcoinProvider event surface (spec-shaped)
  // ============================================================================

  /** Subscribe to a normalized `BitcoinProviderEvent`. */
  on(event: string, listener: (...args: any[]) => void): void {
    this.emitter.on(event as keyof AdapterEventMap, listener as never)
  }

  /** Unsubscribe a previously-registered listener. */
  removeListener(event: string, listener: (...args: any[]) => void): void {
    this.emitter.removeListener(event as keyof AdapterEventMap, listener as never)
  }

  /**
   * Remove all listeners (for one event, or all if no event given).
   *
   * @remarks
   * Useful for disconnect-time cleanup. Not part of the
   * EIP-1193-style {@link BitcoinProvider} surface; available as a
   * convenience on the adapter.
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.emitter.removeAllListeners(event as keyof AdapterEventMap)
    } else {
      this.emitter.removeAllListeners()
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
