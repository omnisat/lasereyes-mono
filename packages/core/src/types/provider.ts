/**
 * Bitcoin Provider Standard.
 *
 * @remarks
 * Modeled on EIP-1193 with Bitcoin-specific adaptations:
 * - Network IDs (strings), not chain IDs (integers)
 * - PSBT-centric signing model
 * - Multi-address support (payment / ordinals / taproot)
 * - Capabilities discovery with TypeScript types
 *
 * Wallets that conform to this interface need no adapter; otherwise an
 * adapter (see {@link BaseAdapter}) translates the wallet's native API
 * to this surface.
 *
 * @module types/provider
 */

// `ProviderRpcError` and `ProviderErrorCode` live in the client package's
// `errors.ts` (errors are values, not state). Re-export here for adapter
// consumers that already import from `types/provider`.
export { ProviderErrorCode, ProviderRpcError } from '@omnisat/lasereyes-client'

// ============================================================================
// Core Provider Interface
// ============================================================================

/**
 * Standard Bitcoin Provider Interface.
 *
 * @remarks
 * All Bitcoin wallet providers SHOULD implement this interface. Once they
 * do, their adapter file can be deleted; only their connector remains.
 */
export interface BitcoinProvider {
  /**
   * Generic RPC-style request method. ALL operations go through this.
   *
   * @param method - RPC method name (e.g. `'bitcoin_signPsbt'`).
   * @param params - Optional named-parameters object.
   * @returns Method-specific return value.
   * @throws {ProviderRpcError} If the request fails.
   *
   * @example
   * ```ts
   * const accounts = await provider.request('bitcoin_requestAccounts')
   * const signed = await provider.request('bitcoin_signPsbt', { psbt, finalize: true })
   * ```
   */
  request(method: string, params?: { [key: string]: unknown }): Promise<unknown>

  /**
   * Subscribe to provider events. Implements Node.js EventEmitter API.
   */
  on(event: string, listener: (...args: any[]) => void): void

  /**
   * Unsubscribe from provider events.
   */
  removeListener(event: string, listener: (...args: any[]) => void): void
}

// ============================================================================
// RPC Methods
// ============================================================================

/**
 * Standard Bitcoin RPC methods.
 *
 * @remarks
 * Required methods MUST be implemented by all providers. Optional methods
 * depend on wallet capabilities surfaced via `bitcoin_getCapabilities`.
 *
 * **Return shapes are JSON-serializable wire data.** Account-flavored
 * methods (`bitcoin_requestAccounts`, `bitcoin_getAccounts`) return the
 * plain `WalletAccountConfig` shape (`{ addresses, publicKeys }`) — NOT
 * a `WalletAccount` with `getAddress` / `getPublicKey` methods. The
 * connector layer constructs the `WalletAccount` from the wire data
 * via `createWalletAccount(...)`. This keeps `request()` consistent
 * with JSON-RPC semantics and makes the boundary survivable across
 * postMessage, iframe-rpc bridges, devtools serialization, etc.
 */
export type BitcoinRpcMethod =
  // Required
  | 'bitcoin_requestAccounts'
  | 'bitcoin_getAccounts'
  | 'bitcoin_getNetwork'
  | 'bitcoin_getCapabilities'
  | 'bitcoin_signMessage'
  // Optional
  | 'bitcoin_getBalance'
  | 'bitcoin_switchNetwork'
  | 'bitcoin_signPsbt'
  | 'bitcoin_signMultiplePsbts'
  | 'bitcoin_signAndBroadcastTransaction'
  | 'bitcoin_signAndBroadcastMultipleTransactions'
  | 'bitcoin_sendBitcoin'
  | 'bitcoin_pushPsbt'

// ============================================================================
// Provider Events
// ============================================================================

/**
 * Standard provider event names.
 */
export type BitcoinProviderEvent =
  | 'connect'
  | 'disconnect'
  | 'accountsChanged'
  | 'networkChanged'
  | 'message'

/** Connect event data. */
export interface ConnectInfo {
  /** Connected network ID. */
  network: string
}

/** Disconnect event data. */
export interface DisconnectInfo {
  /** Optional error if disconnection was unexpected. */
  error?: Error
}

/** Provider message event data. */
export interface ProviderMessage {
  type: string
  data: unknown
}

// ============================================================================
// Provider Capabilities (TypeScript-typed)
// ============================================================================

/**
 * Provider capabilities, organized by network.
 *
 * @remarks
 * Each network may expose a different method set. Returned by
 * `bitcoin_getCapabilities`.
 */
export interface ProviderCapabilities {
  [networkId: string]: NetworkCapabilities
}

/** Capabilities for a single network. */
export interface NetworkCapabilities {
  [methodName: string]: MethodCapability<any, any>
}

/**
 * Method capability descriptor.
 *
 * @typeParam TParams - Parameter type.
 * @typeParam TReturn - Return type.
 */
export interface MethodCapability<TParams = any, TReturn = any> {
  /** Whether this method is supported. */
  supported: boolean
  /** Parameter type descriptor (documentation/runtime introspection). */
  paramsType?: TypeDescriptor<TParams>
  /** Return type descriptor. */
  returnType?: TypeDescriptor<TReturn>
  /** Implementation metadata. */
  metadata?: {
    version?: string
    description?: string
    [key: string]: unknown
  }
}

/**
 * Runtime type descriptor for capability introspection.
 */
export interface TypeDescriptor<T = any> {
  /** Type name (e.g. `'string'`, `'SignPsbtOptions'`, `'AddressInfo[]'`). */
  name: string
  /** Type kind. */
  kind: 'primitive' | 'object' | 'array' | 'union' | 'interface'
  /** Human-readable description. */
  description?: string
  /** Object/interface property descriptors. */
  properties?: Record<string, TypeDescriptor>
  /** Array element type. */
  elementType?: TypeDescriptor
  /** Union member types. */
  unionTypes?: TypeDescriptor[]
  /** Required properties for object/interface types. */
  required?: string[]
  /** Example value. */
  example?: T
}

// ============================================================================
// Capability constructors
// ============================================================================

/**
 * Construct a {@link MethodCapability} with type inference.
 */
export function createMethodCapability<TParams, TReturn>(
  supported: boolean,
  options?: {
    paramsType?: TypeDescriptor<TParams>
    returnType?: TypeDescriptor<TReturn>
    metadata?: MethodCapability<TParams, TReturn>['metadata']
  }
): MethodCapability<TParams, TReturn> {
  return { supported, ...options }
}

/**
 * Construct a {@link TypeDescriptor}.
 */
export function describeType<T>(
  name: string,
  kind: TypeDescriptor['kind'],
  options?: Partial<Omit<TypeDescriptor<T>, 'name' | 'kind'>>
): TypeDescriptor<T> {
  return { name, kind, ...options }
}
