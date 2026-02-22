import type { LaserEyesClient } from '@omnisat/lasereyes-core'
import { useLaserEyes } from '../providers/hooks'

/**
 * Returns the underlying {@link LaserEyesClient} instance.
 *
 * @remarks
 * Provides direct access to the core LaserEyes client for advanced use cases
 * such as accessing the data source manager, module APIs (alkanes, runes, etc.),
 * or the internal nanostore. Returns `null` before the client has been
 * initialized by the {@link LaserEyesProvider}.
 *
 * @returns The LaserEyes client instance, or `null` if not yet initialized
 *
 * @example
 * ```tsx
 * const client = useClient()
 * if (client) {
 *   const utxos = await client.dataSourceManager.getAddressUtxos(address)
 * }
 * ```
 */
export function useClient(): LaserEyesClient | null {
  return useLaserEyes(x => x.client)
}
