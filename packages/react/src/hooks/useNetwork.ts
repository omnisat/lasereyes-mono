import { useStore } from '@nanostores/react'
import { useLaserEyesCore } from '../providers/lasereyes-provider'

/**
 * Returns the currently active network ID.
 *
 * @remarks
 * Subscribes to `core.$networkId` via nanostores. The component re-renders
 * only when the network changes.
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @returns The active network ID (e.g. `'mainnet'`, `'testnet4'`).
 *
 * @example
 * ```tsx
 * const networkId = useNetwork()
 * console.log(networkId) // 'mainnet'
 * ```
 */
export function useNetwork() {
  const core = useLaserEyesCore()
  return useStore(core.$networkId)
}
