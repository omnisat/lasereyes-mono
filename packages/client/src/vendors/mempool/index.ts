import type { ChainBackendFactory } from '../../backend'
import { createChainBackend } from '../../backend'
import type { ChainNetwork, NetworkId } from '../../chains'
import type { BaseCapability, ChainBackend } from '../../types'
import { baseCapabilities } from './base'
import type { MempoolConfig } from './config'

export { baseCapabilities } from './base'
export type { MempoolConfig } from './config'

/**
 * Creates a Mempool.space-backed backend with base capabilities.
 *
 * @remarks
 * Uses the Mempool.space / Esplora REST API. Provides only {@link BaseCapability} methods
 * (balance, UTXOs, transactions, fees, broadcast). For inscription or rune data,
 * use sandshrew or maestro instead, or merge this source with another via
 * {@link mergeChainBackends}.
 *
 * @param config - Configuration including the network and optional per-network API URLs
 * @param config.network - The Bitcoin network to connect to
 * @param config.networks - Optional mapping of network names to custom API URLs
 * @returns A chain backend with {@link BaseCapability} methods
 *
 * @example
 * ```ts
 * import { createBackend } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * const ds = createBackend({ network: 'mainnet' })
 * const balance = await ds.btcGetBalance('bc1q...')
 * ```
 */
export function createBackend(
  config: {
    /**
     * The Bitcoin network. Either a {@link NetworkId} string
     * (e.g. `'mainnet'`) or a {@link ChainNetwork} value (e.g. `MAINNET`).
     */
    network: NetworkId | ChainNetwork
  } & MempoolConfig
): ChainBackend<BaseCapability> {
  return createChainBackend({ network: config.network }).extend(baseCapabilities(config))
}

/**
 * Mempool.space chain backend — a lazy {@link ChainBackendFactory} for use
 * in `createLaserEyesConfig({ backends })`.
 *
 * @remarks
 * The network is injected from the `backends` map key at config-build time,
 * so a single `mempool()` declaration is reused across every chain it's
 * listed under. Provides only {@link BaseCapability} methods; combine with
 * another backend via {@link combineBackends} for richer data.
 *
 * @param config - Optional Mempool.space configuration (custom API URLs).
 * @returns A {@link ChainBackendFactory} producing a {@link BaseCapability} backend.
 *
 * @example
 * ```ts
 * import { mempool } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * createLaserEyesConfig({
 *   chains: [MAINNET],
 *   backends: { mainnet: mempool() },
 * })
 * ```
 */
export function mempool(config?: MempoolConfig): ChainBackendFactory<BaseCapability> {
  return network => createBackend({ network, ...config })
}
