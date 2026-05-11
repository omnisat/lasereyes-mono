/**
 * Connector types for wallet integration.
 *
 * @module types/connector
 */

import type { ChainNetwork, NetworkId } from '@omnisat/lasereyes-client'
import type { Account, WalletClient, WalletClientConfig } from '@omnisat/lasereyes-client/wallet'
import type { BitcoinProvider, ProviderCapabilities } from './provider'

/**
 * Connection result returned by connect().
 */
export interface ConnectResult {
  /** Connected addresses with purpose and public keys */
  account: Account

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
   * Get current account.
   *
   * @returns The connected account, with the associated addresses
   */
  getAccount(): Promise<Account>

  /**
   * Get current network.
   *
   * @returns Network identifier
   */
  getNetworkId(): Promise<NetworkId>

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
  switchNetwork?(networkId: NetworkId): Promise<ChainNetwork>

  // ============================================================================
  // Provider Access
  // ============================================================================

  /**
   * Get underlying provider.
   *
   */
  getProvider(): BitcoinProvider | null

  // ============================================================================
  // Optional Client Override (wagmi-shaped — see getConnectorClient pattern)
  // ============================================================================

  /**
   * Optional: provide a pre-composed `WalletClient` for this connector.
   *
   * @remarks
   * When present, the core keystone (`getWalletClient(config, options?)`)
   * delegates entirely to this method. Returning a client with method
   * overrides lets a connector route specific operations to the wallet's
   * native RPC methods (e.g. `bitcoin_sendBitcoin`, `bitcoin_pushPsbt`)
   * instead of the default composed PSBT path.
   *
   * Composition rule: connectors typically build a default bare client
   * from `(connector.getProvider(), connector.getAccount(), …config…)`,
   * then `.extend(c => ({ … }))` the methods they want to override. The
   * provider is captured via closure — it does not live on
   * `WalletClientConfig`.
   *
   * The return type is intentionally permissive
   * (`WalletClient<any, any, any, any>`) so connector implementations
   * don't have to wrestle with the full generic surface. The keystone
   * narrows on its way out where it can.
   *
   * @param parameters.chainId - Optional chain ID. Defaults to the active
   *   network when omitted.
   * @returns A fully-formed wallet client, ready to use.
   */
  getClient?(parameters?: {
    chainId?: NetworkId
  }): Promise<WalletClient<WalletClientConfig<Account, any>, Account, any, any>>

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
   * Called by core when provider emits accountsChanged.
   *
   * @param accounts - New accounts
   */
  onAccountChanged(account: Account): void

  /**
   * Handle network changed event.
   * Called by core when provider emits networkChanged.
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
export type CreateConnectorFn = (config: ConnectorConfig) => Connector

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

  /**
   * The chains this app supports. Connectors typically copy this list
   * into their authentication request to the wallet.
   */
  networks: readonly ChainNetwork[]
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
