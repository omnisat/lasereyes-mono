/**
 * Lifecycle: disconnect the active wallet.
 *
 * @module actions/disconnect
 */

import type { LaserEyesConfig } from '../config'
import { tryResolveConnector } from '../internal'

/**
 * Disconnect the active wallet.
 *
 * @remarks
 * - If a connector is active, calls `connector.disconnect()`.
 * - Clears `$account`, `$connector`, sets `$status` to `'disconnected'`.
 * - Removes the persisted connector ID from storage.
 * - Idempotent — calling on an already-disconnected config is a no-op.
 */
export async function disconnect<const config extends LaserEyesConfig<any, any, any>>(
  config: config
): Promise<void> {
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

  config.state.$account.set(undefined)
  config.state.$connector.set(undefined)
  config.state.$status.set('disconnected')
  config.storage.removeItem('lasereyes.connectorId')
}
