/**
 * Lifecycle: initialize a LaserEyes config.
 *
 * @remarks
 * Sets up the EIP-6963-style announcement listener so wallets that announce
 * themselves at runtime are merged into `state.$connectors`. Optionally
 * runs auto-reconnect from `config.storage` if the user previously
 * connected.
 *
 * Use {@link dispose} to cancel the listener and reset state.
 *
 * @module actions/initialize
 */

import { discoverConnectors } from '../detection/discovery'
import type { LaserEyesConfig } from '../config'
import { connect } from './connect'

/**
 * Module-private map of `config → cleanup`. {@link dispose} reads this to
 * cancel the announcement listener set up here.
 *
 * @internal
 */
const cleanups = new WeakMap<object, () => void>()

/**
 * Initialize a LaserEyes config.
 *
 * @remarks
 * - Starts the announcement listener via {@link discoverConnectors}.
 * - If `config.autoReconnect`, reads the persisted connector ID from
 *   storage and silently calls `connect(config, { connectorId })` if a
 *   matching connector is registered.
 *
 * @returns A promise that resolves when initialization completes
 *   (auto-reconnect either succeeded, failed silently, or was skipped).
 */
export async function initialize<const config extends LaserEyesConfig<any, any, any>>(
  config: config
): Promise<void> {
  const explicit = [...config.connectors]
  const cleanup = discoverConnectors({
    explicit,
    onChange: registry => {
      const next: Record<string, (typeof explicit)[number]> = {}
      for (const [id, connector] of registry) next[id] = connector
      config.state.$connectors.set(next)
    },
  })
  cleanups.set(config, cleanup)

  if (config.autoReconnect) {
    const persistedId = config.storage.getItem('lasereyes.connectorId')
    if (persistedId) {
      const known = config.state.$connectors.get()[persistedId]
      if (known) {
        try {
          await connect(config, { connectorId: persistedId })
        } catch {
          // Swallow auto-reconnect failures — the user can connect manually.
          config.storage.removeItem('lasereyes.connectorId')
        }
      }
    }
  }
}

/**
 * Internal: read the cleanup callback registered for a config by
 * {@link initialize}.
 *
 * @internal
 */
export function _getInitializeCleanup(config: object): (() => void) | undefined {
  return cleanups.get(config)
}

/**
 * Internal: clear the cleanup callback for a config.
 *
 * @internal
 */
export function _clearInitializeCleanup(config: object): void {
  cleanups.delete(config)
}
