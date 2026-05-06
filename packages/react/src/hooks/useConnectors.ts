import { useStore } from '@nanostores/react'
import { useLaserEyesCore } from '../providers/lasereyes-provider'
import type { Connector } from '@omnisat/lasereyes-core'

/**
 * Returns the list of currently available wallet connectors.
 *
 * @remarks
 * Subscribes to `core.$connectors` via nanostores. The list updates whenever
 * a new wallet announces itself (EIP-6963-style detection) or when connectors
 * are added programmatically.
 *
 * Must be used within a {@link LaserEyesProvider}.
 *
 * @returns Array of available {@link Connector} instances.
 *
 * @example
 * ```tsx
 * const connectors = useConnectors()
 * return (
 *   <ul>
 *     {connectors.map(c => (
 *       <li key={c.id}>{c.name}</li>
 *     ))}
 *   </ul>
 * )
 * ```
 */
export function useConnectors(): Connector[] {
  const core = useLaserEyesCore()
  const connectorMap = useStore(core.$connectors)
  return Object.values(connectorMap)
}
