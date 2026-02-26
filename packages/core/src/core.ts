/**
 * LaserEyes Core State Manager.
 *
 * @module core
 */

import { atom, map } from 'nanostores'
import type { WritableAtom, MapStore } from 'nanostores'
import type { BtcActions, ChainDataSource, Client } from '@omnisat/lasereyes-client'
import { btcActions, createClient, mergeDataSources } from '@omnisat/lasereyes-client'
import { listenForWalletAnnouncements, type WalletAnnouncement } from './detection/announcements'
import type { Connector, ConnectorConfig, ConnectionStatus } from './types/connector'
import type { AddressInfo } from './types/provider'
import type { NetworkId } from './types/network'

/**
 * Per-network data source configuration.
 *
 * @remarks
 * Groups data sources for a given network.
 * Data sources are tried in order: first in the array = highest precedence.
 */
export interface NetworkConfig {
  /** Data sources in order of precedence (first = primary, used before later entries). */
  dataSources: ChainDataSource<any>[]
}

/**
 * Configuration for LaserEyesCore.
 */
export interface LaserEyesCoreConfig {
  /** Default network ID */
  network?: NetworkId

  /** App name shown in wallet connection prompts */
  appName?: string

  /** App icon URL shown in wallet connection prompts */
  appIcon?: string

  /** Connectors to register (user provides these) */
  connectors?: Connector[]

  /** Configuration passed to connectors */
  connectorConfig?: ConnectorConfig

  /** Enable auto-reconnect on initialization (default: true) */
  autoReconnect?: boolean

  /** Per-network configuration. Key is a NetworkId (e.g. 'mainnet', 'testnet4'). */
  networks?: Partial<Record<NetworkId, NetworkConfig>>
}

/**
 * Core state manager for LaserEyes wallet integration.
 *
 * @remarks
 * Manages wallet connection state, connector registry, and event orchestration.
 * Does NOT auto-import adapters - users must explicitly provide connectors or call loaders.
 *
 * @example
 * ```ts
 * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
 * import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
 *
 * const core = createLaserEyesCore({
 *   network: 'mainnet',
 *   appName: 'My Bitcoin App'
 * })
 *
 * // Load wallets you want to support
 * loadUnisatWalletAdapter() // This announces if wallet exists
 *
 * // Initialize to listen for announcements
 * await core.initialize()
 *
 * // Connect to a wallet
 * await core.connect('io.unisat.wallet')
 * ```
 */
export class LaserEyesCore {
  // ============================================================================
  // Public State Atoms (nanostores)
  // ============================================================================

  /** Connection status */
  readonly $status: WritableAtom<ConnectionStatus>

  /** Current connected accounts */
  readonly $account: WritableAtom<AddressInfo[] | undefined>

  /** Current network ID */
  readonly $networkId: WritableAtom<NetworkId>

  /** Currently connected connector */
  readonly $connector: WritableAtom<Connector | undefined>

  /** Map of available connectors (connectorId → Connector) */
  readonly $connectors: MapStore<Record<string, Connector>>

  // ============================================================================
  // Private State
  // ============================================================================

  private config: LaserEyesCoreConfig
  private announcementCleanup?: () => void
  private detectedWallets = new Map<string, WalletAnnouncement>()
  private eventCleanups = new Map<Connector, () => void>()
  private clients = new Map<NetworkId, Client<any, BtcActions>>()

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(config: LaserEyesCoreConfig = {}) {
    this.config = config

    // Initialize state atoms
    this.$status = atom<ConnectionStatus>('disconnected')
    this.$account = atom<AddressInfo[] | undefined>(undefined)
    this.$networkId = atom<NetworkId>(config.network || 'mainnet')
    this.$connector = atom<Connector | undefined>(undefined)
    this.$connectors = map<Record<string, Connector>>({})

    // Register user-provided connectors
    if (config.connectors) {
      const connectorsMap: Record<string, Connector> = {}
      for (const connector of config.connectors) {
        connectorsMap[connector.id] = connector
      }
      this.$connectors.set(connectorsMap)
    }
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Initialize core: start listening for wallet announcements and auto-reconnect.
   *
   * @remarks
   * Does NOT auto-import adapters. Users should call adapter loaders separately:
   *
   * @example
   * ```ts
   * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
   * import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
   *
   * const core = createLaserEyesCore()
   *
   * // Explicitly load wallets you want to support
   * loadUnisatWalletAdapter() // This announces if wallet exists
   *
   * // Now initialize to listen for announcements
   * await core.initialize()
   * ```
   */
  async initialize(): Promise<void> {
    // Start listening for announcements
    this.startWalletDetection()

    // Auto-reconnect if enabled
    if (this.config.autoReconnect !== false) {
      await this.autoReconnect()
    }
  }

  /**
   * Cleanup: stop listening and disconnect.
   *
   * @remarks
   * Does not automatically disconnect the wallet.
   * Call `disconnect()` explicitly if needed.
   */
  dispose(): void {
    this.announcementCleanup?.()

    // Cleanup all event listeners
    this.eventCleanups.forEach((cleanup) => {
      cleanup()
    })
    this.eventCleanups.clear()
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  /**
   * Connect to a wallet by connector ID.
   *
   * @param connectorId - The connector ID (usually rdns or wallet name)
   *
   * @throws {Error} If connector not found or connection fails
   *
   * @example
   * ```ts
   * await core.connect('io.unisat.wallet')
   * ```
   */
  async connect(connectorId: string): Promise<void> {
    const connector = this.$connectors.get()[connectorId]
    if (!connector) {
      const available = Object.keys(this.$connectors.get())
      throw new Error(
        `Connector "${connectorId}" not found. Available connectors: ${available.length > 0 ? available.join(', ') : 'none'}`
      )
    }

    this.$status.set('connecting')

    try {
      const result = await connector.connect()

      this.$connector.set(connector)
      this.$account.set(result.accounts)
      this.$networkId.set(result.networkId)
      this.$status.set('connected')

      // Setup event handlers
      this.setupConnectorHandlers(connector)

      // Save for auto-reconnect
      this.saveLastConnected(connectorId)
    } catch (error) {
      this.$status.set('disconnected')
      throw error
    }
  }

  /**
   * Disconnect from current wallet.
   */
  async disconnect(): Promise<void> {
    const connector = this.$connector.get()
    if (!connector) return

    // Cleanup event listeners for this connector
    const cleanup = this.eventCleanups.get(connector)
    if (cleanup) {
      cleanup()
      this.eventCleanups.delete(connector)
    }

    await connector.disconnect()

    this.$connector.set(undefined)
    this.$account.set(undefined)
    this.$status.set('disconnected')

    this.clearLastConnected()
  }

  /**
   * Switch to different network.
   *
   * @param networkId - Target network ID
   *
   * @throws {Error} If no wallet connected or wallet doesn't support network switching
   */
  async switchNetwork(networkId: NetworkId): Promise<void> {
    const connector = this.$connector.get()
    if (!connector) {
      throw new Error('No wallet connected')
    }

    if (!connector.switchNetwork) {
      throw new Error('Current wallet does not support network switching')
    }

    await connector.switchNetwork(networkId)
    this.$networkId.set(networkId)
  }

  // ============================================================================
  // Data Client
  // ============================================================================

  /**
   * Get (or lazily create) a data client for the given network.
   *
   * @remarks
   * Folds data sources left-to-right: the first source in the configured array
   * has the highest precedence (primary); later sources act as fallbacks.
   *
   * The resulting client is extended with {@link btcActions} so all standard
   * Bitcoin data operations (`btcGetBalance`, `btcGetAddressUtxos`, etc.) are
   * available on the returned object.
   *
   * @param networkId - Network to get a client for. Defaults to the current network.
   * @returns A client extended with BTC actions.
   *
   * @throws {Error} If no data sources are configured for the requested network.
   *
   * @example
   * ```ts
   * const balance = await core.getClient().btcGetBalance('bc1q...')
   * ```
   */
  getClient(networkId?: NetworkId): Client<any, BtcActions> {
    const net = networkId ?? this.$networkId.get()
    const cached = this.clients.get(net)
    if (cached) return cached

    const sources = this.config.networks?.[net]?.dataSources ?? []
    if (sources.length === 0) {
      throw new Error(`No data sources configured for network "${net}"`)
    }

    // Fold right-to-left so that index 0 (primary) wins on capability overlap.
    const superSource = sources.reduceRight(
      (secondary, primary) => mergeDataSources(primary, secondary)
    )

    const client = createClient({ network: net, dataSource: superSource }).extend(btcActions())
    this.clients.set(net, client)
    return client
  }

  // ============================================================================
  // Wallet Detection (Announcements)
  // ============================================================================

  /**
   * Start listening for wallet announcements.
   */
  private startWalletDetection(): void {
    this.announcementCleanup = listenForWalletAnnouncements((announcement) => {
      this.handleWalletAnnouncement(announcement)
    })
  }

  /**
   * Handle a wallet announcement.
   */
  private handleWalletAnnouncement(announcement: WalletAnnouncement): void {
    // Avoid duplicates
    if (this.detectedWallets.has(announcement.uuid)) return

    this.detectedWallets.set(announcement.uuid, announcement)

    // Create connector from adapter
    const connector = this.createConnectorFromAnnouncement(announcement)

    // Add to registry
    const current = this.$connectors.get()
    this.$connectors.set({
      ...current,
      [connector.id]: connector,
    })
  }

  /**
   * Create a connector from a wallet announcement.
   *
   * @remarks
   * This creates a generic connector wrapper around the adapter.
   * The connector delegates all operations to the adapter.
   */
  private createConnectorFromAnnouncement(announcement: WalletAnnouncement): Connector {
    const adapter = announcement.provider

    const connector: Connector = {
      id: announcement.rdns || announcement.name.toLowerCase().replace(/\s+/g, '-'),
      name: announcement.name,
      icon: announcement.icon,
      rdns: announcement.rdns,

      connect: async () => {
        const accounts = (await adapter.request({
          method: 'bitcoin_requestAccounts',
        })) as AddressInfo[]
        const networkId = (await adapter.request({ method: 'bitcoin_getNetwork' })) as NetworkId
        return { accounts, networkId }
      },

      disconnect: async () => {
        // Adapters don't have explicit disconnect, just cleanup
      },

      isReady: () => true, // Already announced, so ready

      isAuthorized: async () => {
        try {
          const accounts = (await adapter.request({
            method: 'bitcoin_getAccounts',
          })) as AddressInfo[]
          return accounts.length > 0
        } catch {
          return false
        }
      },

      getAccounts: () =>
        adapter.request({ method: 'bitcoin_getAccounts' }) as Promise<AddressInfo[]>,

      getNetwork: () => adapter.request({ method: 'bitcoin_getNetwork' }) as Promise<NetworkId>,

      getCapabilities: () =>
        adapter.request({ method: 'bitcoin_getCapabilities' }) as Promise<any>,

      switchNetwork: async (networkId: NetworkId) => {
        await adapter.request({ method: 'bitcoin_switchNetwork', params: { networkId } })
      },

      sendBitcoin: (to: string, amount: number) => {
        return adapter.request({
          method: 'bitcoin_sendBitcoin',
          params: { to, amount },
        }) as Promise<string>
      },

      signPsbt: (psbt: string, options?: any) => {
        return adapter.request({
          method: 'bitcoin_signPsbt',
          params: { psbt, ...options },
        }) as Promise<any>
      },

      signMessage: (message: string, options?: any) => {
        return adapter.request({
          method: 'bitcoin_signMessage',
          params: { message, ...options },
        }) as Promise<string>
      },

      getProvider: () => adapter,

      onAccountsChanged: () => {},
      onNetworkChanged: () => {},
      onConnect: () => {},
      onDisconnect: () => {},
    }

    return connector
  }

  // ============================================================================
  // Event Handling
  // ============================================================================

  /**
   * Setup event listeners on connector.
   */
  private setupConnectorHandlers(connector: Connector): void {
    const adapter = connector.getProvider()

    // Create event handlers
    const accountsChangedHandler = (accounts: AddressInfo[]) => {
      this.$account.set(accounts)
      connector.onAccountsChanged(accounts)
    }

    const networkChangedHandler = (networkId: NetworkId) => {
      this.$networkId.set(networkId)
      connector.onNetworkChanged(networkId)
    }

    const disconnectHandler = () => {
      this.$connector.set(undefined)
      this.$account.set(undefined)
      this.$status.set('disconnected')
      this.clearLastConnected()
      connector.onDisconnect()
    }

    // Attach event listeners
    adapter.on('accountsChanged', accountsChangedHandler)
    adapter.on('networkChanged', networkChangedHandler)
    adapter.on('disconnect', disconnectHandler)

    // Store cleanup function
    const cleanup = () => {
      adapter.removeListener('accountsChanged', accountsChangedHandler)
      adapter.removeListener('networkChanged', networkChangedHandler)
      adapter.removeListener('disconnect', disconnectHandler)
    }

    this.eventCleanups.set(connector, cleanup)
  }

  // ============================================================================
  // Auto-Reconnect
  // ============================================================================

  /**
   * Attempt to reconnect to last connected wallet.
   */
  private async autoReconnect(): Promise<void> {
    const lastConnectorId = this.getLastConnected()
    if (!lastConnectorId) return

    // Wait for connectors to be detected (announcements are async)
    // This gives time for wallet loaders to announce
    await new Promise((resolve) => setTimeout(resolve, 150))

    const connector = this.$connectors.get()[lastConnectorId]
    if (!connector) return

    try {
      const isAuthorized = await connector.isAuthorized()
      if (isAuthorized) {
        this.$status.set('reconnecting')
        await this.connect(lastConnectorId)
      }
    } catch {
      this.$status.set('disconnected')
    }
  }

  // ============================================================================
  // LocalStorage Helpers
  // ============================================================================

  private saveLastConnected(connectorId: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lasereyes.lastConnector', connectorId)
    }
  }

  private getLastConnected(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('lasereyes.lastConnector')
    }
    return null
  }

  private clearLastConnected(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('lasereyes.lastConnector')
    }
  }
}

/**
 * Create a new LaserEyesCore instance.
 *
 * @param config - Core configuration
 * @returns LaserEyesCore instance
 *
 * @example
 * ```ts
 * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
 *
 * const core = createLaserEyesCore({
 *   network: 'mainnet',
 *   appName: 'My Bitcoin App',
 *   autoReconnect: true
 * })
 *
 * await core.initialize()
 * ```
 */
export function createLaserEyesCore(config?: LaserEyesCoreConfig): LaserEyesCore {
  return new LaserEyesCore(config)
}
