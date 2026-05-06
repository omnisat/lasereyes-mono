/**
 * Sandshrew vendor — base + ord + protocol capabilities for Bitcoin data.
 *
 * @remarks
 * Sandshrew exposes the most comprehensive set of capabilities: base BTC
 * operations, runes, alkanes, inscriptions, and the ord indexer.
 * Authentication via API key.
 *
 * @module vendors/sandshrew
 */

import type { ChainNetwork } from '../../chains'
import type {
  AlkaneCapability,
  BaseCapability,
  InscriptionCapability,
  OrdCapability,
  RuneCapability,
} from '../../data-source/capabilities'
import { createChainDataSource } from '../../data-source/create'
import type { ChainDataSource } from '../../types/data-source'
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
 * Creates a Sandshrew-backed data source with full protocol capabilities.
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
 * @returns A chain data source with base, rune, alkane, inscription, and ord capabilities
 *
 * @example
 * ```ts
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/sandshrew'
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * const ds = createDataSource({
 *   network: MAINNET,
 *   apiKey: 'your-sandshrew-api-key',
 * })
 *
 * const runes = await ds.runesGetAddressBalances('bc1q...')
 * const utxos = await ds.ordGetFormattedUtxos('bc1q...')
 * ```
 */
export function createDataSource(
  config: { network: ChainNetwork } & SandshrewConfig
): ChainDataSource<
  BaseCapability & RuneCapability & AlkaneCapability & InscriptionCapability & OrdCapability
> {
  return createChainDataSource({ network: config.network })
    .extend(baseCapabilities(config))
    .extend(runeCapabilities(config))
    .extend(alkaneCapabilities(config))
    .extend(inscriptionCapabilities(config))
    .extend(ordCapabilities(config))
}
