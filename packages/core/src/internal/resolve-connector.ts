/**
 * Internal: resolve the active connector from config state.
 *
 * @remarks
 * Used by every wallet (write) action and by the provider-first fallback
 * path in read actions. Throws when no connector is active so the caller
 * surface stays clean (no `Connector | undefined` propagation).
 *
 * @internal
 */

import type { LaserEyesConfig } from '../config'
import type { Connector } from '../types/connector'

/**
 * Resolve the currently-active connector from `config.state.$connection`.
 *
 * @param config - The LaserEyes config.
 * @returns The active connector.
 *
 * @throws {Error} If no wallet is connected.
 */
export function resolveConnector(config: LaserEyesConfig<any, any, any>): Connector {
  const connector = config.state.$connection.get().connector
  if (!connector) {
    throw new Error('No wallet connected')
  }
  return connector
}

/**
 * Resolve the currently-active connector, returning `undefined` when none.
 *
 * @remarks
 * For read actions that try the provider first and fall back gracefully —
 * "no connector" should not throw on the read-fallback path.
 *
 * @internal
 */
export function tryResolveConnector(config: LaserEyesConfig<any, any, any>): Connector | undefined {
  return config.state.$connection.get().connector
}
