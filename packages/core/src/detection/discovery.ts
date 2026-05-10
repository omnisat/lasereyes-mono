/**
 * Connector discovery — merge explicit + announced connectors.
 *
 * @remarks
 * The LaserEyes config accepts a list of explicit connectors (e.g.
 * `[unisat(), xverse(), ...]`). Wallets that announce themselves via
 * the EIP-6963-style `bitcoin:announceProvider` event also surface as
 * connectors. Both sources need to flow into the same registry without
 * duplicates.
 *
 * Dedup rule: explicit connectors win on `rdns` collision. Announced
 * connectors that match an explicit connector's `rdns` are dropped;
 * the explicit version (with its richer adapter wiring) is kept.
 *
 * @module detection/discovery
 */

import type { Account } from '@omnisat/lasereyes-client/wallet'
import type { ChainNetwork, NetworkId } from '@omnisat/lasereyes-client'
import type { Connector } from '../types/connector'
import type { ProviderCapabilities } from '../types/provider'
import { listenForWalletAnnouncements, type WalletAnnouncement } from './announcements'

/**
 * Build a {@link Connector} from a {@link WalletAnnouncement}.
 *
 * @remarks
 * Used when a wallet announces itself but isn't in the explicit
 * connector list. The synthesized connector delegates everything to
 * the announced provider via its `request()` method.
 */
export function connectorFromAnnouncement(announcement: WalletAnnouncement): Connector {
  const provider = announcement.provider

  return {
    id: announcement.rdns ?? announcement.name.toLowerCase().replace(/\s+/g, '-'),
    name: announcement.name,
    icon: announcement.icon,
    rdns: announcement.rdns,

    isReady: () => true,

    async isAuthorized() {
      try {
        const account = (await provider.request('bitcoin_getAccounts')) as Account | undefined
        return !!(account?.addresses?.length)
      } catch {
        return false
      }
    },

    async connect() {
      const account = (await provider.request('bitcoin_requestAccounts')) as Account
      const networkId = (await provider.request('bitcoin_getNetwork')) as NetworkId
      return { account, networkId }
    },

    async disconnect() {
      // Announced providers don't have an explicit disconnect.
    },

    async getAccount() {
      return (await provider.request('bitcoin_getAccounts')) as Account
    },

    async getNetworkId() {
      return (await provider.request('bitcoin_getNetwork')) as NetworkId
    },

    async getCapabilities() {
      return (await provider.request('bitcoin_getCapabilities')) as ProviderCapabilities
    },

    async switchNetwork(networkId: NetworkId): Promise<ChainNetwork> {
      return (await provider.request('bitcoin_switchNetwork', { networkId })) as ChainNetwork
    },

    getProvider: () => provider,

    onAccountChanged: () => {},
    onNetworkChanged: () => {},
    onConnect: () => {},
    onDisconnect: () => {},
  }
}

/**
 * Configuration for {@link discoverConnectors}.
 */
export interface DiscoverConnectorsOptions {
  /** The explicit connectors registered in the config. */
  explicit: Connector[]
  /**
   * Called whenever the connector registry changes (initial population
   * + each subsequent announcement).
   */
  onChange: (connectors: Map<string, Connector>) => void
}

/**
 * Start listening for announced connectors and merge them with the
 * explicit list. Returns a cleanup function that stops the listener.
 *
 * @remarks
 * - Explicit connectors are seeded synchronously before listening starts.
 * - Each announcement either adds a new connector or is dropped (if its
 *   `rdns` matches an explicit one).
 * - `onChange` receives the full registry on every update.
 *
 * @returns Cleanup function. Call it to stop listening for announcements.
 */
export function discoverConnectors(opts: DiscoverConnectorsOptions): () => void {
  const registry = new Map<string, Connector>()
  const explicitRdns = new Set<string>()

  // Seed explicit connectors first.
  for (const c of opts.explicit) {
    registry.set(c.id, c)
    if (c.rdns) explicitRdns.add(c.rdns)
  }
  opts.onChange(new Map(registry))

  // Listen for announced wallets.
  const seen = new Set<string>()
  const cleanup = listenForWalletAnnouncements((announcement) => {
    if (seen.has(announcement.uuid)) return
    seen.add(announcement.uuid)

    // Skip if an explicit connector already claims this rdns.
    if (announcement.rdns && explicitRdns.has(announcement.rdns)) return

    const connector = connectorFromAnnouncement(announcement)
    registry.set(connector.id, connector)
    opts.onChange(new Map(registry))
  })

  return cleanup
}
