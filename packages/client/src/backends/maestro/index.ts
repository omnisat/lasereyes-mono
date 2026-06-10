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
 * {@link mergeChainBackends}.
 *
 * @module backends/maestro
 */

import type { ChainNetwork, NetworkId } from '../../chains'
import type { ChainBackend } from '../../types/backend'
import type {
  BaseCapability,
  Brc20Capability,
  InscriptionCapability,
  RuneCapability,
} from '../capabilities'
import { createChainBackend } from '../create'
import type { ChainBackendFactory } from '../factory'
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
 * Creates a Maestro-backed backend with base, inscription, BRC-20, and partial rune capabilities.
 *
 * @remarks
 * For full rune support or alkane/ord capabilities, use sandshrew or merge
 * with another backend via {@link mergeChainBackends}.
 *
 * @param config - Configuration including the network and API key
 * @param config.network - The Bitcoin chain to connect to
 * @param config.apiKey - The Maestro API key for mainnet
 * @param config.testnetApiKey - Optional separate API key for testnet
 * @param config.networks - Optional mapping of network names to custom API URLs and keys
 * @returns A chain backend with base, inscription, BRC-20, and partial rune capabilities
 *
 * @example
 * ```ts
 * import { createBackend } from '@omnisat/lasereyes-client/backends/maestro'
 * import { MAINNET } from '@omnisat/lasereyes-client'
 *
 * const ds = createBackend({
 *   network: MAINNET,
 *   apiKey: 'your-maestro-api-key',
 * })
 *
 * const brc20 = await ds.brc20GetAddressBalances('bc1q...')
 * const inscriptions = await ds.inscriptionsGetByAddress('bc1q...')
 * ```
 */
export function createBackend(
  config: {
    /**
     * The Bitcoin network. Either a {@link NetworkId} string
     * (e.g. `'mainnet'`) or a {@link ChainNetwork} value (e.g. `MAINNET`).
     */
    network: NetworkId | ChainNetwork
  } & MaestroConfig
): ChainBackend<MaestroCapabilities> {
  return createChainBackend({ network: config.network })
    .extend(baseCapabilities(config))
    .extend(inscriptionCapabilities(config))
    .extend(brc20Capabilities(config))
    .extend(runeCapabilities(config))
}

/**
 * Maestro chain backend — a lazy {@link ChainBackendFactory} for use in
 * `createLaserEyesConfig({ backends })`.
 *
 * @remarks
 * The network is injected from the `backends` map key at config-build time,
 * so a single `maestro()` declaration is reused across every chain it's
 * listed under. Provides base, BRC-20, inscription, and partial rune
 * capabilities; pair it with {@link combineBackends} (e.g. with sandshrew)
 * for comprehensive coverage. An API key is required.
 *
 * @param config - Maestro configuration (API key, optional per-network overrides).
 * @returns A {@link ChainBackendFactory} producing the Maestro backend.
 *
 * @example
 * ```ts
 * import { maestro } from '@omnisat/lasereyes-client/backends/maestro'
 *
 * createLaserEyesConfig({
 *   chains: [MAINNET],
 *   backends: { mainnet: maestro({ apiKey: '…' }) },
 * })
 * ```
 */
export function maestro(config: MaestroConfig): ChainBackendFactory<MaestroCapabilities> {
  return network => createBackend({ network, ...config })
}
