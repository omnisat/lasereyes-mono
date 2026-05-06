/**
 * Bitcoin Provider Standard (BIP-XXXX proposal).
 *
 * @module types/provider
 */

// ============================================================================
// Core Provider Interface
// ============================================================================

/**
 * Standard Bitcoin Provider Interface.
 *
 * @remarks
 * All Bitcoin wallet providers SHOULD implement this interface.
 * Modeled after EIP-1193 with Bitcoin-specific adaptations.
 *
 * Key differences from EIP-1193:
 * - Network IDs instead of chain IDs
 * - PSBT-centric signing model
 * - Multi-address support (payment, ordinals, taproot)
 * - Capabilities discovery with TypeScript types
 */
export interface BitcoinProvider {
  /**
   * Generic RPC-style request method.
   * ALL operations go through this single method.
   *
   * @param args - Request arguments with method name and params
   * @returns Promise resolving to method-specific return type
   * @throws {ProviderRpcError} If request fails
   *
   * @example
   * ```ts
   * const accounts = await provider.request({
   *   method: 'bitcoin_requestAccounts'
   * })
   * ```
   */
  request(
    ...args: [
      /** RPC method name (e.g., 'bitcoin_signPsbt') */
      method: string,
      /** Named parameters object (optional) */
      params?: { [key: string]: unknown },
    ]
  ): Promise<unknown>

  /**
   * Subscribe to provider events.
   * Implements Node.js EventEmitter API.
   *
   * @param event - Event name
   * @param listener - Event handler function
   */
  on(event: string, listener: (...args: any[]) => void): void

  /**
   * Unsubscribe from provider events.
   *
   * @param event - Event name
   * @param listener - Event handler function to remove
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
 * Required methods MUST be implemented by all providers.
 * Optional methods depend on wallet capabilities.
 */
export type BitcoinRpcMethod =
  // Required methods
  | 'bitcoin_requestAccounts'
  | 'bitcoin_getAccounts'
  | 'bitcoin_getNetwork'
  | 'bitcoin_getCapabilities'
  | 'bitcoin_signMessage'
  // Optional methods
  | 'bitcoin_switchNetwork'
  | 'bitcoin_signPsbt'
  | 'bitcoin_signAndBroadcastTranaction'
  | 'bitcoin_signMultiplePsbts'
  | 'bitcoin_signAndBroadcastMultipleTransactions'
  | 'bitcoin_sendBitcoin'
  | 'bitcoin_pushPsbt'

// ============================================================================
// Provider Events
// ============================================================================

/**
 * Standard provider events.
 */
export type BitcoinProviderEvent =
  | 'connect'
  | 'disconnect'
  | 'accountsChanged'
  | 'networkChanged'
  | 'message'

/**
 * Connect event data.
 */
export interface ConnectInfo {
  /** Connected network ID */
  network: string
}

/**
 * Disconnect event data.
 */
export interface DisconnectInfo {
  /** Optional error if disconnection was unexpected */
  error?: ProviderRpcError
}

/**
 * Provider message event data.
 */
export interface ProviderMessage {
  /** Message type */
  type: string

  /** Message data */
  data: unknown
}

// ============================================================================
// Errors
// ============================================================================

/**
 * Provider RPC error.
 */
export class ProviderRpcError extends Error {
  constructor(
    /** Error code */
    public code: number,
    /** Error message */
    message: string,
    /** Additional error data */
    public data?: unknown
  ) {
    super(message)
    this.name = 'ProviderRpcError'
  }
}

/**
 * Common error codes (following EIP-1193 pattern).
 *
 * @remarks
 * These are suggested codes. Wallets may use different codes.
 * String error messages are more important than codes.
 */
export enum ProviderErrorCode {
  /** User rejected the request */
  USER_REJECTED = 4001,
  /** Unauthorized - method requires authorization */
  UNAUTHORIZED = 4100,
  /** Unsupported method */
  UNSUPPORTED_METHOD = 4200,
  /** Disconnected from network */
  DISCONNECTED = 4900,
  /** Invalid request */
  INVALID_REQUEST = -32600,
  /** Method not found */
  METHOD_NOT_FOUND = -32601,
  /** Invalid params */
  INVALID_PARAMS = -32602,
  /** Internal error */
  INTERNAL_ERROR = -32603,
}

// ============================================================================
// Provider Capabilities (using TypeScript types)
// ============================================================================

/**
 * Provider capabilities for all networks.
 *
 * @remarks
 * Capabilities are organized by network ID.
 * Each network can have different method support.
 */
export interface ProviderCapabilities {
  [networkId: string]: NetworkCapabilities
}

/**
 * Capabilities for a specific network.
 */
export interface NetworkCapabilities {
  [methodName: string]: MethodCapability<any, any>
}

/**
 * Method capability descriptor with TypeScript types.
 *
 * @typeParam TParams - Parameter type
 * @typeParam TReturn - Return type
 */
export interface MethodCapability<TParams = any, TReturn = any> {
  /** Whether this method is supported */
  supported: boolean

  /** Parameter type (for type checking and documentation) */
  paramsType?: TypeDescriptor<TParams>

  /** Return type (for type checking and documentation) */
  returnType?: TypeDescriptor<TReturn>

  /** Additional metadata */
  metadata?: {
    /** Implementation version */
    version?: string
    /** Human-readable description */
    description?: string
    /** Custom metadata */
    [key: string]: unknown
  }
}

/**
 * TypeScript type descriptor.
 *
 * @remarks
 * Used for runtime type information in capabilities.
 * Provides TypeScript type names as strings for documentation.
 */
export interface TypeDescriptor<T = any> {
  /** Type name (e.g., 'string', 'SignPsbtOptions', 'AddressInfo[]') */
  name: string

  /** Type kind */
  kind: 'primitive' | 'object' | 'array' | 'union' | 'interface'

  /** Human-readable description */
  description?: string

  /** For object/interface types: property descriptors */
  properties?: Record<string, TypeDescriptor>

  /** For array types: element type */
  elementType?: TypeDescriptor

  /** For union types: possible types */
  unionTypes?: TypeDescriptor[]

  /** Required properties (for object/interface types) */
  required?: string[]

  /** Example value */
  example?: T
}

// ============================================================================
// Capability Type Helpers
// ============================================================================

/**
 * Helper to create method capability with type inference.
 */
export function createMethodCapability<TParams, TReturn>(
  supported: boolean,
  options?: {
    paramsType?: TypeDescriptor<TParams>
    returnType?: TypeDescriptor<TReturn>
    metadata?: MethodCapability<TParams, TReturn>['metadata']
  }
): MethodCapability<TParams, TReturn> {
  return {
    supported,
    ...options,
  }
}

/**
 * Helper to create type descriptor.
 */
export function describeType<T>(
  name: string,
  kind: TypeDescriptor['kind'],
  options?: Partial<Omit<TypeDescriptor<T>, 'name' | 'kind'>>
): TypeDescriptor<T> {
  return {
    name,
    kind,
    ...options,
  }
}
