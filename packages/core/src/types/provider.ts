/**
 * Bitcoin Provider Standard (BIP-XXXX proposal).
 * Inspired by EIP-1193 for Ethereum.
 *
 * @module types/provider
 */

import type { NetworkId } from './network'

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
  request(args: RequestArguments): Promise<unknown>

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

/**
 * Request arguments for provider.request()
 */
export interface RequestArguments {
  /** RPC method name (e.g., 'bitcoin_signPsbt') */
  readonly method: string

  /** Named parameters object (optional) */
  readonly params?: { [key: string]: unknown }
}

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
  | 'bitcoin_signPsbts'
  | 'bitcoin_sendBitcoin'
  | 'bitcoin_pushPsbt'
  | 'bitcoin_inscribe'
  | 'bitcoin_getInscriptions'
  | 'bitcoin_sendInscriptions'
  | 'bitcoin_sendRunes'
  | 'bitcoin_sendBrc20'
  | 'bitcoin_sendAlkanes'
  | 'bitcoin_getRunesBalances'
  | 'bitcoin_getBrc20Balances'
  | 'bitcoin_getAlkanesBalances'

// ============================================================================
// Address Types
// ============================================================================

/**
 * Bitcoin address type.
 */
export type AddressType = 'p2pkh' | 'p2wpkh' | 'p2sh-p2wpkh' | 'p2tr' | 'p2wsh'

/**
 * Address purpose in multi-address wallets.
 */
export type AddressPurpose = 'payment' | 'ordinals' | 'taproot'

/**
 * Address information with embedded public key.
 *
 * @remarks
 * Returned by bitcoin_requestAccounts and bitcoin_getAccounts.
 * Wallets return whatever addresses they support:
 * - Unisat: 1 address (payment = ordinals)
 * - Xverse: 2 addresses (separate payment + ordinals)
 */
export interface AddressInfo {
  /** Bitcoin address string */
  address: string

  /** Address purpose/use case */
  purpose: AddressPurpose

  /** Address type for script generation */
  type: AddressType

  /** Hex-encoded public key for this address */
  publicKey: string
}

// ============================================================================
// PSBT Signing
// ============================================================================

/**
 * Options for signing a PSBT.
 */
export interface SignPsbtOptions {
  /** Finalize the PSBT after signing */
  finalize?: boolean

  /** Broadcast the transaction after signing */
  broadcast?: boolean

  /** Specific inputs to sign (optional, signs all by default) */
  inputsToSign?: Array<{
    /** Input index */
    index: number
    /** Address that should sign this input */
    address: string
  }>
}

/**
 * Signed PSBT result.
 */
export interface SignedPsbt {
  /** Signed PSBT in hex format */
  psbtHex?: string

  /** Signed PSBT in base64 format */
  psbtBase64?: string

  /** Transaction ID (if broadcast was requested) */
  txId?: string

  /** Raw transaction hex (if finalized) */
  txHex?: string
}

/**
 * Options for batch signing PSBTs.
 */
export interface SignPsbtsOptions {
  /** Finalize PSBTs after signing */
  finalize?: boolean

  /** Broadcast transactions after signing */
  broadcast?: boolean

  /** Specific inputs to sign for each PSBT */
  inputsToSign?: Array<Array<{
    index: number
    address: string
  }>>
}

// ============================================================================
// Message Signing
// ============================================================================

/**
 * Options for signing a message.
 */
export interface SignMessageOptions {
  /** Address to sign with (optional, uses default if omitted) */
  address?: string

  /** Signing protocol */
  protocol?: 'ecdsa' | 'bip322'
}

// ============================================================================
// Inscriptions
// ============================================================================

/**
 * Inscription data.
 */
export interface Inscription {
  /** Inscription ID */
  id: string

  /** Inscription number */
  number: number

  /** Owner address */
  address: string

  /** Content type (MIME type) */
  contentType: string

  /** Content preview URL */
  preview?: string

  /** Content URL */
  content?: string

  /** Output value in satoshis */
  outputValue: number

  /** Location (txid:vout) */
  location: string

  /** Genesis transaction ID */
  genesisTransaction: string

  /** Timestamp */
  timestamp: number
}

// ============================================================================
// Meta-Protocol Balances
// ============================================================================

/**
 * Rune balance.
 */
export interface RuneBalance {
  /** Rune ID (e.g., '840000:1') */
  runeId: string

  /** Rune name */
  name: string

  /** Spaced name with spacers */
  spacedName: string

  /** Symbol (emoji) */
  symbol: string

  /** Divisibility (decimal places) */
  divisibility: number

  /** Balance amount (as string to preserve precision) */
  amount: string

  /** Formatted balance with divisibility applied */
  formattedAmount: string
}

/**
 * BRC-20 balance.
 */
export interface Brc20Balance {
  /** Ticker symbol */
  ticker: string

  /** Available balance */
  availableBalance: string

  /** Transferable balance */
  transferableBalance: string

  /** Overall balance */
  overallBalance: string
}

/**
 * Alkane balance.
 */
export interface AlkaneBalance {
  /** Alkane ID (e.g., '2:1') */
  id: string

  /** Alkane name */
  name?: string

  /** Symbol */
  symbol?: string

  /** Decimals */
  decimals: number

  /** Balance amount (as string) */
  amount: string

  /** Formatted amount */
  formattedAmount: string
}

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
  network: NetworkId
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
