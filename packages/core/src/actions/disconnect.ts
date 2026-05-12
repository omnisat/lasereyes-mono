/**
 * Lifecycle: disconnect the active wallet.
 *
 * @module actions/disconnect
 */

import type { LaserEyesConfig } from '../config'
import { tryResolveConnector } from '../internal'
import { _clearConnectCleanup, _getConnectCleanup } from './connect'

/**
 * Disconnect the active wallet.
 *
 * @remarks
 * - Tears down the provider-level event subscriptions installed by
 *   `connect` (accountsChanged, networkChanged, disconnect).
 * - If a connector is active, calls `connector.disconnect()`.
 * - Atomically clears the connection state — one `$connection.set({...})`,
 *   subscribers fire once.
 * - Removes the persisted connector ID from storage.
 * - Idempotent — calling on an already-disconnected config is a no-op.
 */
export async function disconnect<const config extends LaserEyesConfig<any, any, any>>(
  config: config
): Promise<void> {
  // Tear down event subscriptions first — once we clear the connector,
  // we lose the provider reference the cleanup needs.
  _getConnectCleanup(config)?.()
  _clearConnectCleanup(config)

  const connector = tryResolveConnector(config)
  if (connector) {
    try {
      await connector.disconnect()
    } catch {
      // Some wallets throw on disconnect; that's fine — proceed with
      // local cleanup either way.
    }
    connector.onDisconnect?.()
  }

  // Atomic clear. Networks ID stays at the last-known value (the next
  // connect will overwrite it); status/account/connector flip together.
  config.state.$connection.set({
    ...config.state.$connection.get(),
    status: 'disconnected',
    account: undefined,
    connector: undefined,
  })
  config.storage.removeItem('lasereyes.connectorId')
}
