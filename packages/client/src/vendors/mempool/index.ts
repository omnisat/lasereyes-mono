import { createChainDataSource } from '../../data-source'
import type { BaseCapability, ChainDataSource, NetworkType } from '../../types'
import { baseCapabilities } from './base'
import type { MempoolConfig } from './config'

export { baseCapabilities } from './base'
export type { MempoolConfig } from './config'

/**
 * Creates a Mempool.space-backed data source with base capabilities.
 *
 * @remarks
 * Uses the Mempool.space / Esplora REST API. Provides only {@link BaseCapability} methods
 * (balance, UTXOs, transactions, fees, broadcast). For inscription or rune data,
 * use sandshrew or maestro instead, or merge this source with another via
 * {@link mergeDataSources}.
 *
 * @param config - Configuration including the network and optional per-network API URLs
 * @param config.network - The Bitcoin network to connect to
 * @param config.networks - Optional mapping of network names to custom API URLs
 * @returns A chain data source with {@link BaseCapability} methods
 *
 * @example
 * ```ts
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * const ds = createDataSource({ network: 'mainnet' })
 * const balance = await ds.btcGetBalance('bc1q...')
 * ```
 */
export function createDataSource(
  config: {
    network: NetworkType
  } & MempoolConfig
): ChainDataSource<BaseCapability> {
  return createChainDataSource({ network: config.network }).extend(baseCapabilities(config))
}
