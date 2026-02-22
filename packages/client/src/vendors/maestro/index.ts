import { createChainDataSource } from '../../data-source'
import type {
  BaseCapability,
  Brc20Capability,
  ChainDataSource,
  InscriptionCapability,
  NetworkType,
  RuneCapability,
} from '../../types'
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

/**
 * Creates a Maestro-backed data source with base, inscription, BRC-20, and partial rune capabilities.
 *
 * @remarks
 * Maestro provides base operations, inscriptions, BRC-20 tokens, and partial rune support
 * (only `runesGetById` and `runesGetByName`). For full rune support or alkane/ord capabilities,
 * use sandshrew or merge with another data source via {@link mergeDataSources}.
 *
 * @param config - Configuration including the network and API key
 * @param config.network - The Bitcoin network to connect to
 * @param config.apiKey - The Maestro API key for mainnet
 * @param config.testnetApiKey - Optional separate API key for testnet
 * @param config.networks - Optional mapping of network names to custom API URLs and keys
 * @returns A chain data source with base, inscription, BRC-20, and partial rune capabilities
 *
 * @example
 * ```ts
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/maestro'
 *
 * const ds = createDataSource({
 *   network: 'mainnet',
 *   apiKey: 'your-maestro-api-key',
 * })
 *
 * const brc20 = await ds.brc20GetAddressBalances('bc1q...')
 * const inscriptions = await ds.inscriptionsGetByAddress('bc1q...')
 * ```
 */
export function createDataSource(
  config: {
    network: NetworkType
  } & MaestroConfig
): ChainDataSource<
  BaseCapability &
    InscriptionCapability &
    Brc20Capability &
    Pick<RuneCapability, 'runesGetById' | 'runesGetByName'>
> {
  return createChainDataSource({ network: config.network })
    .extend(baseCapabilities(config))
    .extend(inscriptionCapabilities(config))
    .extend(brc20Capabilities(config))
    .extend(runeCapabilities(config))
}
