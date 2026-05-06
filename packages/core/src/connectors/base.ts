/**
 * Base connector class for wallet integration.
 *
 * @module connectors/base
 */

import type { Network, NetworkId } from '@omnisat/lasereyes-client'
import type { Account } from '@omnisat/lasereyes-client/wallet'
import type { Connector, ConnectorConfig, ConnectResult } from '../types/connector'
import type { BitcoinProvider, ProviderCapabilities } from '../types/provider'

function walletNotConnectedError(connectorName?: string): Error {
  return new Error(`${connectorName ?? 'Wallet'} not connected. Please connect the wallet first.`)
}

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

  protected config: ConnectorConfig
  protected eventListeners: Map<string, (...args: any[]) => void> = new Map()

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(config: ConnectorConfig) {
    this.config = config
  }

  abstract getProvider(): BitcoinProvider | null

  // ============================================================================
  // Lifecycle
  // ============================================================================

  async connect(): Promise<ConnectResult> {
    const provider = this.getProvider()
    if (!provider) {
      throw new Error(`${this.name} wallet not found. Please install the extension.`)
    }

    // Setup event listeners
    this.setupEventListeners()

    // Request accounts from wallet
    const account = (await provider.request('bitcoin_requestAccounts')) as Account

    if (!account) {
      throw new Error('No accounts returned from wallet')
    }

    // Get current network
    const networkId = (await provider.request('bitcoin_getNetwork')) as NetworkId

    // Return connection result
    return {
      account,
      networkId,
    }
  }

  async disconnect(): Promise<void> {
    // Cleanup event listeners
    this.cleanupEventListeners()
  }

  isReady(): boolean {
    try {
      const provider = this.getProvider()
      return provider !== null
    } catch {
      return false
    }
  }

  async isAuthorized(): Promise<boolean> {
    if (!this.isReady()) {
      return false
    }

    try {
      let provider = this.getProvider()
      // Wallets sometimes fail to inject their provider immediately so we use a timeout to check after a delay
      if (!provider) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        provider = this.getProvider()
      }

      if (!provider) {
        return false
      }

      // Try to get accounts without prompting user
      const account = (await provider.request('bitcoin_getAccount')) as Account

      return account && account.addresses.length > 0
    } catch {
      return false
    }
  }

  // ============================================================================
  // State Queries
  // ============================================================================

  async getAccount(): Promise<Account> {
    const provider = this._getProviderOrThrow()

    return (await provider.request('bitcoin_getAccount')) as Account
  }

  private _getProviderOrThrow() {
    const provider = this.getProvider()
    if (!provider) {
      throw walletNotConnectedError(this.name)
    }
    return provider
  }

  async getNetworkId(): Promise<NetworkId> {
    const provider = this._getProviderOrThrow()

    return (await provider.request('bitcoin_getNetwork')) as NetworkId
  }

  async getCapabilities(): Promise<ProviderCapabilities> {
    const provider = this._getProviderOrThrow()

    return (await provider.request('bitcoin_getCapabilities')) as ProviderCapabilities
  }

  async switchNetwork(networkId: NetworkId): Promise<Network> {
    const provider = this._getProviderOrThrow()

    const network = (await provider.request('bitcoin_switchNetwork', { networkId })) as Network

    return network
  }

  // ============================================================================
  // Event Handlers (no-op by default, subclasses can override)
  // ============================================================================

  // TODO: Emit events on emmiter set in constructor
  onAccountChanged(_account: Account): void {
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
    const provider = this.getProvider()
    if (!provider) return

    // Accounts changed
    const accountChangedHandler = (account: Account) => {
      this.onAccountChanged(account)
    }
    provider.on('accountChanged', accountChangedHandler)
    this.eventListeners.set('accountChanged', accountChangedHandler)

    // Network changed
    const networkChangedHandler = (networkId: NetworkId) => {
      this.onNetworkChanged(networkId)
    }
    provider.on('networkChanged', networkChangedHandler)
    this.eventListeners.set('networkChanged', networkChangedHandler)

    // Connect
    const connectHandler = (info: any) => {
      // Some wallets emit connect event
      // Most don't, so this is optional
      if (info) {
        this.onConnect(info)
      }
    }
    provider.on('connect', connectHandler)
    this.eventListeners.set('connect', connectHandler)

    // Disconnect
    const disconnectHandler = () => {
      this.onDisconnect()
    }
    provider.on('disconnect', disconnectHandler)
    this.eventListeners.set('disconnect', disconnectHandler)
  }

  /**
   * Cleanup event listeners from adapter.
   */
  protected cleanupEventListeners(): void {
    const provider = this.getProvider()
    if (!provider) return

    for (const [event, handler] of this.eventListeners) {
      provider.removeListener(event, handler)
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
