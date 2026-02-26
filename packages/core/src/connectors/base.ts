/**
 * Base connector class for wallet integration.
 *
 * @module connectors/base
 */

import type {
  AddressInfo,
  BitcoinProviderAdapter,
  ProviderCapabilities,
  SignedPsbt,
  SignMessageOptions,
  SignPsbtOptions,
} from '../types/provider'
import type { NetworkId } from '../types/network'
import type { Connector, ConnectResult, ConnectorConfig } from '../types/connector'

/**
 * Abstract base connector class.
 *
 * @remarks
 * Provides common functionality for wallet connectors:
 * - Event listener management
 * - State queries delegation to adapter
 * - Error handling
 * - Connection lifecycle
 *
 * Subclasses implement wallet-specific connection logic.
 */
export abstract class BaseConnector implements Connector {
  // ============================================================================
  // Abstract Properties (subclasses provide)
  // ============================================================================

  abstract readonly id: string
  abstract readonly name: string
  abstract readonly icon?: string
  abstract readonly rdns?: string

  // ============================================================================
  // Protected State
  // ============================================================================

  protected adapter: BitcoinProviderAdapter | null = null
  protected config: ConnectorConfig
  protected eventListeners: Map<string, (...args: any[]) => void> = new Map()

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(config: ConnectorConfig = {}) {
    this.config = config
  }

  // ============================================================================
  // Abstract Methods (subclasses implement)
  // ============================================================================

  /**
   * Load the wallet adapter.
   * Subclasses implement this to detect and create adapter instance.
   */
  protected abstract loadAdapter(): BitcoinProviderAdapter | null

  // ============================================================================
  // Lifecycle
  // ============================================================================

  async connect(): Promise<ConnectResult> {
    // Load adapter if not already loaded
    if (!this.adapter) {
      this.adapter = this.loadAdapter()
      if (!this.adapter) {
        throw new Error(`${this.name} wallet not found. Please install the extension.`)
      }
    }

    // Setup event listeners
    this.setupEventListeners()

    // Request accounts from wallet
    const accounts = (await this.adapter.request({
      method: 'bitcoin_requestAccounts',
    })) as AddressInfo[]

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from wallet')
    }

    // Get current network
    const networkId = (await this.adapter.request({
      method: 'bitcoin_getNetwork',
    })) as NetworkId

    // Return connection result
    return {
      accounts,
      networkId,
    }
  }

  async disconnect(): Promise<void> {
    // Cleanup event listeners
    this.cleanupEventListeners()

    // Clear adapter reference
    this.adapter = null
  }

  isReady(): boolean {
    try {
      const adapter = this.loadAdapter()
      return adapter !== null
    } catch {
      return false
    }
  }

  async isAuthorized(): Promise<boolean> {
    if (!this.isReady()) {
      return false
    }

    try {
      const adapter = this.loadAdapter()
      if (!adapter) return false

      // Try to get accounts without prompting user
      const accounts = (await adapter.request({
        method: 'bitcoin_getAccounts',
      })) as AddressInfo[]

      return accounts && accounts.length > 0
    } catch {
      return false
    }
  }

  // ============================================================================
  // State Queries
  // ============================================================================

  async getAccounts(): Promise<AddressInfo[]> {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }

    return (await this.adapter.request({
      method: 'bitcoin_getAccounts',
    })) as AddressInfo[]
  }

  async getNetwork(): Promise<NetworkId> {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }

    return (await this.adapter.request({
      method: 'bitcoin_getNetwork',
    })) as NetworkId
  }

  async getCapabilities(): Promise<ProviderCapabilities> {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }

    return (await this.adapter.request({
      method: 'bitcoin_getCapabilities',
    })) as ProviderCapabilities
  }

  // ============================================================================
  // Network Switching
  // ============================================================================

  async switchNetwork(networkId: NetworkId): Promise<void> {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }

    await this.adapter.request({
      method: 'bitcoin_switchNetwork',
      params: { networkId },
    })
  }

  // ============================================================================
  // Wallet Operations
  // ============================================================================

  async sendBitcoin(to: string, amount: number): Promise<string> {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }

    return (await this.adapter.request({
      method: 'bitcoin_sendBitcoin',
      params: { to, amount },
    })) as string
  }

  async signPsbt(psbt: string, options?: SignPsbtOptions): Promise<SignedPsbt> {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }

    return (await this.adapter.request({
      method: 'bitcoin_signPsbt',
      params: { psbt, ...options },
    })) as SignedPsbt
  }

  async signMessage(message: string, options?: SignMessageOptions): Promise<string> {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }

    return (await this.adapter.request({
      method: 'bitcoin_signMessage',
      params: { message, ...options },
    })) as string
  }

  // ============================================================================
  // Provider Access
  // ============================================================================

  getProvider(): BitcoinProviderAdapter {
    if (!this.adapter) {
      throw new Error('Wallet not connected')
    }
    return this.adapter
  }

  // ============================================================================
  // Event Handlers (no-op by default, subclasses can override)
  // ============================================================================

  onAccountsChanged(_accounts: AddressInfo[]): void {
    // Subclasses can override to add custom logic
  }

  onNetworkChanged(_networkId: NetworkId): void {
    // Subclasses can override to add custom logic
  }

  onConnect(_data: ConnectResult): void {
    // Subclasses can override to add custom logic
  }

  onDisconnect(): void {
    // Subclasses can override to add custom logic
  }

  // ============================================================================
  // Event Listener Management
  // ============================================================================

  /**
   * Setup event listeners on adapter.
   */
  protected setupEventListeners(): void {
    if (!this.adapter) return

    // Accounts changed
    const accountsChangedHandler = (accounts: AddressInfo[]) => {
      this.onAccountsChanged(accounts)
    }
    this.adapter.on('accountsChanged', accountsChangedHandler)
    this.eventListeners.set('accountsChanged', accountsChangedHandler)

    // Network changed
    const networkChangedHandler = (networkId: NetworkId) => {
      this.onNetworkChanged(networkId)
    }
    this.adapter.on('networkChanged', networkChangedHandler)
    this.eventListeners.set('networkChanged', networkChangedHandler)

    // Connect
    const connectHandler = (info: any) => {
      // Some wallets emit connect event
      // Most don't, so this is optional
      if (info) {
        this.onConnect(info)
      }
    }
    this.adapter.on('connect', connectHandler)
    this.eventListeners.set('connect', connectHandler)

    // Disconnect
    const disconnectHandler = () => {
      this.onDisconnect()
    }
    this.adapter.on('disconnect', disconnectHandler)
    this.eventListeners.set('disconnect', disconnectHandler)
  }

  /**
   * Cleanup event listeners from adapter.
   */
  protected cleanupEventListeners(): void {
    if (!this.adapter) return

    for (const [event, handler] of this.eventListeners) {
      this.adapter.removeListener(event, handler)
    }

    this.eventListeners.clear()
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get connector metadata for UI display.
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon,
      ready: this.isReady(),
    }
  }
}
