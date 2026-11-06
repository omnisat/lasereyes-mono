/**
 * Lifecycle: disconnect the active wallet.
 *
 * @module actions/disconnect
 */

import type { LaserEyesConfig } from '../config'
import { invalidateClientCache, tryResolveConnector } from '../internal'
import { mutateConnection } from '../state'
import { _clearConnectCleanup, _getConnectCleanup } from './connect'

/**
 * Disconnect the active wallet.
 *
 * @remarks
 * - Tears down the provider-level event subscriptions installed by
 *   `connect` (accountsChanged, networkChanged, disconnect).
 * - If a connector is active, calls `connector.disconnect()`.
 * - Atomically clears the connection state — one {@link mutateConnection}
 *   call, subscribers fire once.
 * - Removes the persisted connector ID from storage.
 * - Idempotent — calling on an already-disconnected config is a no-op.
 */
export async function disconnect<const config extends LaserEyesConfig>(
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
  mutateConnection(config.state, {
    status: 'disconnected',
    account: undefined,
    connector: undefined,
  })
  config.storage.removeItem('lasereyes.connectorId')

  // Drop every cached client. Wallet-backed ones reference the now-gone
  // connection; read-only ones can be rebuilt cheaply on the next call.
  invalidateClientCache(config)
}
