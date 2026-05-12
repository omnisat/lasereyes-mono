/**
 * Lifecycle: connect a wallet by connector ID.
 *
 * @remarks
 * After a successful connect, subscribes to the connector's
 * provider-level events (`accountsChanged`, `networkChanged`,
 * `disconnect`) and propagates them into `config.state`. Subscriptions
 * persist for the lifetime of the connection and are torn down by
 * {@link disconnect}.
 *
 * @module actions/connect
 */

import type { NetworkId } from '@omnisat/lasereyes-client'
import type { Account } from '@omnisat/lasereyes-client/wallet'
import type { LaserEyesConfig } from '../config'
import type { Connector, ConnectResult } from '../types/connector'
import type { BitcoinProvider } from '../types/provider'

/**
 * Args for {@link connect}.
 */
export interface ConnectArgs {
  /**
   * Connector ID — the `id` field of the registered `Connector`.
   *
   * @remarks
   * Connectors are registered in `state.$connectors` under their `id`. The
   * registry includes both factories from `config.connectorFns` and any
   * announced wallets discovered after {@link initialize}.
   */
  connectorId: string
}

/**
 * Module-private map of `config → cleanup`. {@link disconnect} reads this
 * to tear down event subscriptions installed here.
 *
 * @internal
 */
const eventCleanups = new WeakMap<object, () => void>()

/**
 * Internal: read the event-subscription cleanup callback for a config.
 *
 * @internal
 */
export function _getConnectCleanup(config: object): (() => void) | undefined {
  return eventCleanups.get(config)
}

/**
 * Internal: clear the event-subscription cleanup callback for a config.
 *
 * @internal
 */
export function _clearConnectCleanup(config: object): void {
  eventCleanups.delete(config)
}

/**
 * Subscribe to provider events on a freshly-connected connector and
 * propagate them into config state.
 *
 * @internal
 */
function subscribeToConnectorEvents(
  config: LaserEyesConfig<any, any, any>,
  connector: Connector,
  provider: BitcoinProvider
): () => void {
  // Refresh the account from the connector; the event payload is
  // wallet-specific (sometimes just an address[]), so we re-derive from
  // the source of truth rather than trusting the payload shape.
  const onAccountsChanged = async (_payload?: Account) => {
    try {
      const account = await connector.getAccount()
      config.state.$account.set(account)
    } catch {
      // Wallet may have just disconnected; the disconnect listener will
      // tidy state up.
    }
  }

  const onNetworkChanged = async (payload?: NetworkId) => {
    // Some adapters forward the new network id in the payload; others
    // only signal "the network changed" and we re-query. Try the payload
    // first, fall back to a fresh call.
    let next: NetworkId | undefined =
      typeof payload === 'string' ? (payload as NetworkId) : undefined
    if (!next) {
      try {
        next = await connector.getNetworkId()
      } catch {
        return
      }
    }
    config.state.$networkId.set(next)
  }

  const onDisconnect = () => {
    config.state.$status.set('disconnected')
    config.state.$account.set(undefined)
    config.state.$connector.set(undefined)
    // Network id stays on the last-known value; the next connect
    // will overwrite it.
  }

  provider.on('accountsChanged', onAccountsChanged as (...args: any[]) => void)
  provider.on('networkChanged', onNetworkChanged as (...args: any[]) => void)
  provider.on('disconnect', onDisconnect)

  return () => {
    provider.removeListener('accountsChanged', onAccountsChanged as (...args: any[]) => void)
    provider.removeListener('networkChanged', onNetworkChanged as (...args: any[]) => void)
    provider.removeListener('disconnect', onDisconnect)
  }
}

/**
 * Connect to a wallet.
 *
 * @remarks
 * Looks up the connector from `state.$connectors` by `connectorId`, sets
 * `state.$status` to `'connecting'`, and calls `connector.connect()`. On
 * success, populates `$account`, `$networkId`, `$connector`, sets
 * `$status` to `'connected'`, and (if `autoReconnect` is enabled)
 * persists the ID to storage. On failure, restores `$status` to
 * `'disconnected'` and re-throws.
 *
 * Subscribes to the connector's provider-level events
 * (`accountsChanged`, `networkChanged`, `disconnect`) so state stays in
 * sync with the wallet UI. Cleanup is invoked by {@link disconnect}.
 *
 * @returns The connection result `{ account, networkId }`.
 *
 * @throws {Error} If `connectorId` is not registered in `state.$connectors`,
 *   or if `connector.connect()` rejects.
 */
export async function connect<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  args: ConnectArgs
): Promise<ConnectResult> {
  const connector = config.state.$connectors.get()[args.connectorId]
  if (!connector) {
    throw new Error(`Connector '${args.connectorId}' is not registered`)
  }

  // Tear down any stale subscription from a previous connection.
  eventCleanups.get(config)?.()
  eventCleanups.delete(config)

  config.state.$status.set('connecting')
  try {
    const result = await connector.connect()
    config.state.$account.set(result.account)
    config.state.$networkId.set(result.networkId)
    config.state.$connector.set(connector)
    config.state.$status.set('connected')

    if (config.autoReconnect) {
      config.storage.setItem('lasereyes.connectorId', connector.id)
    }

    // Subscribe to provider events so subsequent wallet-side changes
    // (user switches network or account in the wallet UI) propagate
    // into state automatically.
    const provider = connector.getProvider()
    if (provider) {
      eventCleanups.set(config, subscribeToConnectorEvents(config, connector, provider))
    }

    connector.onConnect?.(result)
    return result
  } catch (error) {
    config.state.$status.set('disconnected')
    throw error
  }
}
