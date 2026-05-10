/**
 * Lifecycle: dispose a LaserEyes config.
 *
 * @module actions/dispose
 */

import type { LaserEyesConfig } from '../config'
import { _clearInitializeCleanup, _getInitializeCleanup } from './initialize'

/**
 * Dispose a LaserEyes config.
 *
 * @remarks
 * - Cancels the announcement listener installed by {@link initialize}.
 * - Resets state atoms to disconnected defaults.
 * - Sync (no I/O) — callers waiting on an in-flight `connect()` should
 *   await that themselves before calling `dispose`.
 *
 * Safe to call without a prior `initialize` (no-op for the listener).
 */
export function dispose<const config extends LaserEyesConfig<any, any, any>>(
  config: config
): void {
  const cleanup = _getInitializeCleanup(config)
  if (cleanup) {
    cleanup()
    _clearInitializeCleanup(config)
  }

  config.state.$account.set(undefined)
  config.state.$connector.set(undefined)
  config.state.$status.set('disconnected')
}
