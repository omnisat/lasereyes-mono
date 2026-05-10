/**
 * Lifecycle: connect a wallet by connector ID.
 *
 * @module actions/connect
 */

import type { LaserEyesConfig } from '../config'
import type { ConnectResult } from '../types/connector'

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
 * Connect to a wallet.
 *
 * @remarks
 * Looks up the connector from `state.$connectors` by `connectorId`, sets
 * `state.$status` to `'connecting'`, and calls `connector.connect()`. On
 * success, populates `$account`, `$networkId`, `$connector`, sets `$status`
 * to `'connected'`, and (if `autoReconnect` is enabled) persists the ID
 * to storage. On failure, restores `$status` to `'disconnected'` and
 * re-throws.
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

    connector.onConnect?.(result)
    return result
  } catch (error) {
    config.state.$status.set('disconnected')
    throw error
  }
}
