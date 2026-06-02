/**
 * Sandshrew vendor — base + ord + protocol capabilities for Bitcoin data.
 *
 * @remarks
 * Sandshrew exposes the most comprehensive set of capabilities: base BTC
 * operations, runes, alkanes, inscriptions, and the ord indexer.
 * Authentication via API key.
 *
 * @module backends/sandshrew
 */

import type { ChainNetwork, NetworkId } from '../../chains'
import type { ChainBackend } from '../../types/backend'
import type {
  AlkaneCapability,
  BaseCapability,
  InscriptionCapability,
  OrdCapability,
  RuneCapability,
} from '../capabilities'
import { createChainBackend } from '../create'
import type { ChainBackendFactory } from '../factory'
import { alkaneCapabilities } from './alkanes'
import { baseCapabilities } from './base'
import type { SandshrewConfig } from './config'
import { inscriptionCapabilities } from './inscriptions'
import { ordCapabilities } from './ord'
import { runeCapabilities } from './runes'

export { alkaneCapabilities } from './alkanes'
export { baseCapabilities } from './base'
export type { SandshrewConfig } from './config'
export { inscriptionCapabilities } from './inscriptions'
export { ordCapabilities } from './ord'
export { runeCapabilities } from './runes'

/**
 * Creates a Sandshrew-backed backend with full protocol capabilities.
 *
 * @remarks
 * Sandshrew provides the most comprehensive set of capabilities, including
 * base operations, runes, alkanes, inscriptions, and ord indexer access.
 * Requires an API key for authentication.
 *
 * @param config - Configuration including the network, API key, and optional per-network overrides
 * @param config.network - The Bitcoin chain to connect to
 * @param config.apiKey - The Sandshrew API key (can also be set per-network)
 * @param config.networks - Optional mapping of network names to custom API URLs and keys
 * @returns A chain backend with base, rune, alkane, inscription, and ord capabilities
 *
 * @example
 * ```ts
 * import { createBackend } from '@omnisat/lasereyes-client/backends/sandshrew'
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * const ds = createBackend({
 *   network: MAINNET,
 *   apiKey: 'your-sandshrew-api-key',
 * })
 *
 * const runes = await ds.runesGetAddressBalances('bc1q...')
 * const utxos = await ds.ordGetFormattedUtxos('bc1q...')
 * ```
 */
export function createBackend(
  config: {
    /**
     * The Bitcoin network. Either a {@link NetworkId} string
     * (e.g. `'mainnet'`) or a {@link ChainNetwork} value (e.g. `MAINNET`).
     */
    network: NetworkId | ChainNetwork
  } & SandshrewConfig
): ChainBackend<
  BaseCapability & RuneCapability & AlkaneCapability & InscriptionCapability & OrdCapability
> {
  return createChainBackend({ network: config.network })
    .extend(baseCapabilities(config))
    .extend(runeCapabilities(config))
    .extend(alkaneCapabilities(config))
    .extend(inscriptionCapabilities(config))
    .extend(ordCapabilities(config))
}

/**
 * Sandshrew chain backend — a lazy {@link ChainBackendFactory} for use in
 * `createLaserEyesConfig({ backends })`.
 *
 * @remarks
 * The network is injected from the `backends` map key at config-build time,
 * so a single `sandshrew()` declaration is reused across every chain it's
 * listed under. Exposes the full capability set (base, runes, alkanes,
 * inscriptions, ord); pair it with {@link combineBackends} to add fallbacks
 * for the base BTC methods.
 *
 * @param config - Optional Sandshrew configuration (API key, per-network overrides).
 * @returns A {@link ChainBackendFactory} producing the full Sandshrew backend.
 *
 * @example
 * ```ts
 * import { sandshrew } from '@omnisat/lasereyes-client/backends/sandshrew'
 *
 * createLaserEyesConfig({
 *   chains: [MAINNET],
 *   backends: { mainnet: sandshrew({ apiKey: '…' }) },
 * })
 * ```
 */
export function sandshrew(
  config?: SandshrewConfig
): ChainBackendFactory<
  BaseCapability & RuneCapability & AlkaneCapability & InscriptionCapability & OrdCapability
> {
  return network => createBackend({ network, ...config })
}
