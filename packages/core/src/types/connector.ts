/**
 * Connector types for wallet integration.
 *
 * @module types/connector
 */

import type {
  AddressInfo,
  BitcoinProviderAdapter,
  ProviderCapabilities,
  SignedPsbt,
  SignMessageOptions,
  SignPsbtOptions,
} from './provider'
import type { NetworkId } from './network'

/**
 * Connection result returned by connect().
 */
export interface ConnectResult {
  /** Connected addresses with purpose and public keys */
  accounts: AddressInfo[]

  /** Current network ID */
  networkId: NetworkId
}

/**
 * Connection status states.
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

/**
 * Connector interface for wallet integration.
 *
 * @remarks
 * Connectors sit between the Core state manager and Adapters.
 * They provide:
 * - Lifecycle management (connect/disconnect)
 * - Event orchestration (adapter events → core)
 * - State queries (accounts, network, capabilities)
 * - Direct wallet operations (signing, sending)
 */
export interface Connector {
  // ============================================================================
  // Identification
  // ============================================================================

  /** Unique connector identifier (e.g., 'unisat', 'xverse') */
  readonly id: string

  /** Human-readable wallet name */
  readonly name: string

  /** Wallet icon URL or data URI */
  readonly icon?: string

  /** Reverse DNS notation (e.g., 'com.unisat.wallet') */
  readonly rdns?: string

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Connect to wallet.
   *
   * @returns Connection result with accounts and network
   * @throws {Error} If connection fails or user rejects
   */
  connect(): Promise<ConnectResult>

  /**
   * Disconnect from wallet.
   * Cleans up event listeners and resets state.
   */
  disconnect(): Promise<void>

  /**
   * Check if wallet is ready (extension installed and available).
   *
   * @returns True if wallet can be used
   */
  isReady(): boolean

  /**
   * Check if wallet is already authorized (connected previously).
   *
   * @returns True if wallet remembers previous authorization
   */
  isAuthorized(): Promise<boolean>

  // ============================================================================
  // State Queries
  // ============================================================================

  /**
   * Get current accounts.
   *
   * @returns Array of addresses with purpose and public keys
   */
  getAccounts(): Promise<AddressInfo[]>

  /**
   * Get current network.
   *
   * @returns Network identifier
   */
  getNetwork(): Promise<NetworkId>

  /**
   * Get wallet capabilities.
   *
   * @returns Capabilities by network
   */
  getCapabilities(): Promise<ProviderCapabilities>

  // ============================================================================
  // Network Switching
  // ============================================================================

  /**
   * Switch to different network (if supported).
   *
   * @param networkId - Target network ID
   * @throws {Error} If wallet doesn't support network switching
   */
  switchNetwork?(networkId: NetworkId): Promise<void>

  // ============================================================================
  // Wallet Operations (bypass to wallet extension)
  // ============================================================================

  /**
   * Send Bitcoin transaction.
   *
   * @param to - Recipient address
   * @param amount - Amount in satoshis
   * @returns Transaction ID
   * @throws {Error} If user rejects or transaction fails
   */
  sendBitcoin(to: string, amount: number): Promise<string>

  /**
   * Sign PSBT.
   *
   * @param psbt - PSBT in hex or base64 format
   * @param options - Signing options
   * @returns Signed PSBT
   * @throws {Error} If user rejects or signing fails
   */
  signPsbt(psbt: string, options?: SignPsbtOptions): Promise<SignedPsbt>

  /**
   * Sign message.
   *
   * @param message - Message to sign
   * @param options - Signing options (address, protocol)
   * @returns Signature string
   * @throws {Error} If user rejects or signing fails
   */
  signMessage(message: string, options?: SignMessageOptions): Promise<string>

  // ============================================================================
  // Provider Access
  // ============================================================================

  /**
   * Get underlying provider adapter.
   *
   * @remarks
   * Allows access to adapter for advanced use cases.
   * Most applications should use connector methods instead.
   */
  getProvider(): BitcoinProviderAdapter

  // ============================================================================
  // Setup Hook
  // ============================================================================

  /**
   * Optional setup hook called during connector initialization.
   *
   * @remarks
   * Use this for one-time setup tasks like:
   * - Registering event listeners
   * - Loading cached state
   * - Detecting wallet availability
   */
  setup?(): Promise<void>

  // ============================================================================
  // Event Handlers (called by core)
  // ============================================================================

  /**
   * Handle accounts changed event.
   * Called by core when adapter emits accountsChanged.
   *
   * @param accounts - New accounts
   */
  onAccountsChanged(accounts: AddressInfo[]): void

  /**
   * Handle network changed event.
   * Called by core when adapter emits networkChanged.
   *
   * @param networkId - New network ID
   */
  onNetworkChanged(networkId: NetworkId): void

  /**
   * Handle connect event.
   * Called by core when connection succeeds.
   *
   * @param data - Connection result
   */
  onConnect(data: ConnectResult): void

  /**
   * Handle disconnect event.
   * Called by core when wallet disconnects.
   */
  onDisconnect(): void
}

/**
 * Connector factory function type.
 *
 * @remarks
 * Connector factories create connector instances with config.
 * This allows lazy initialization and dependency injection.
 *
 * @example
 * ```ts
 * const unisatConnector: CreateConnectorFn = (config) => {
 *   return new UnisatConnector(config)
 * }
 * ```
 */
export type CreateConnectorFn = (config?: ConnectorConfig) => Connector

/**
 * Configuration passed to connectors.
 *
 * @remarks
 * Connectors receive configuration from the core.
 * This allows customization per application.
 */
export interface ConnectorConfig {
  /** App name for wallet connection requests */
  appName?: string

  /** App icon URL for wallet connection requests */
  appIcon?: string

  /** Custom options per connector */
  options?: Record<string, unknown>
}

/**
 * Connector metadata for UI display.
 */
export interface ConnectorMetadata {
  /** Connector ID */
  id: string

  /** Display name */
  name: string

  /** Icon URL or data URI */
  icon?: string

  /** Description */
  description?: string

  /** Is wallet installed/available? */
  ready: boolean

  /** Download URL if not installed */
  downloadUrl?: string
}
