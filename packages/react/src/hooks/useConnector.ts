import { useStore } from '@nanostores/react'
import { useLaserEyesCore } from '../providers/lasereyes-provider'
import type { Connector } from '@omnisat/lasereyes-core'

/**
 * Returns the currently active (connected) wallet connector, or `undefined`.
 *
 * @remarks
 * Subscribes to `core.$connector` via nanostores. Re-renders only when
 * the active connector changes.
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @returns The active {@link Connector}, or `undefined` if no wallet is connected.
 *
 * @example
 * ```tsx
 * const connector = useConnector()
 * if (connector) {
 *   console.log('Connected to:', connector.name)
 * }
 * ```
 */
export function useConnector(): Connector | undefined {
  const core = useLaserEyesCore()
  return useStore(core.$connector)
}
