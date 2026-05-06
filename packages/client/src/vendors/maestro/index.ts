/**
 * Maestro vendor — base + brc20 + inscriptions + partial runes.
 *
 * @remarks
 * Maestro provides:
 * - Base BTC operations (balance, transaction, broadcast, fees) — but
 *   does NOT support address UTXO listing or output-value lookup.
 * - BRC-20 token data.
 * - Inscription data.
 * - Partial Rune capability (lookup by id and name only).
 *
 * For comprehensive coverage, merge with sandshrew via
 * {@link mergeDataSources}.
 *
 * @module vendors/maestro
 */

import type { ChainNetwork } from '../../chains'
import type {
  BaseCapability,
  Brc20Capability,
  InscriptionCapability,
  RuneCapability,
} from '../../data-source/capabilities'
import { createChainDataSource } from '../../data-source/create'
import type { ChainDataSource } from '../../types/data-source'
import { baseCapabilities } from './base'
import { brc20Capabilities } from './brc20'
import type { MaestroConfig } from './config'
import { inscriptionCapabilities } from './inscriptions'
import { runeCapabilities } from './runes'

export { baseCapabilities } from './base'
export { brc20Capabilities } from './brc20'
export type { MaestroConfig } from './config'
export { inscriptionCapabilities } from './inscriptions'
export { runeCapabilities } from './runes'

type Prettify<T> = { [K in keyof T]: T[K] } & {}

type MaestroCapabilities = Prettify<
  BaseCapability &
    InscriptionCapability &
    Brc20Capability &
    Pick<RuneCapability, 'runesGetById' | 'runesGetByName'>
>

/**
 * Creates a Maestro-backed data source with base, inscription, BRC-20, and partial rune capabilities.
 *
 * @remarks
 * For full rune support or alkane/ord capabilities, use sandshrew or merge
 * with another data source via {@link mergeDataSources}.
 *
 * @param config - Configuration including the network and API key
 * @param config.network - The Bitcoin chain to connect to
 * @param config.apiKey - The Maestro API key for mainnet
 * @param config.testnetApiKey - Optional separate API key for testnet
 * @param config.networks - Optional mapping of network names to custom API URLs and keys
 * @returns A chain data source with base, inscription, BRC-20, and partial rune capabilities
 *
 * @example
 * ```ts
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/maestro'
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * const ds = createDataSource({
 *   network: MAINNET,
 *   apiKey: 'your-maestro-api-key',
 * })
 *
 * const brc20 = await ds.brc20GetAddressBalances('bc1q...')
 * const inscriptions = await ds.inscriptionsGetByAddress('bc1q...')
 * ```
 */
export function createDataSource(
  config: { network: ChainNetwork } & MaestroConfig
): ChainDataSource<MaestroCapabilities> {
  return createChainDataSource({ network: config.network })
    .extend(baseCapabilities(config))
    .extend(inscriptionCapabilities(config))
    .extend(brc20Capabilities(config))
    .extend(runeCapabilities(config))
}
