import type { ChainNetwork, NetworkId } from '../chains'
import { resolveNetwork } from '../chains'
import type { ChainBackend, ChainBackendContext } from '../types/backend'
import type { Extension, Prettify } from '../types/utils'
import type { ActionGroup } from './capabilities'
import { guardBackend } from './guard'

/**
 * Creates a new chain backend with the specified network configuration.
 *
 * A chain backend is a composable object that provides blockchain data access.
 * Start with a bare backend, then use {@link ChainBackend.extend | .extend()} to
 * add capability groups (base, runes, inscriptions, etc.) from vendor implementations.
 *
 * @param config - The backend configuration
 * @param config.network - The Bitcoin network. Pass either a {@link NetworkId}
 *   string (e.g. `'mainnet'`) or a {@link ChainNetwork} value (e.g. `MAINNET`).
 *   Strings are looked up via the built-in `NETWORKS` registry; custom chains
 *   must be passed as `ChainNetwork` values produced by `defineChain()`.
 * @returns A chain backend that can be extended with capabilities
 *
 * @example
 * ```ts
 * import { createChainBackend } from '@omnisat/lasereyes-client'
 * import { baseCapabilities } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * // Both of these work:
 * const ds1 = createChainBackend({ network: 'mainnet' })
 * const ds2 = createChainBackend({ network: MAINNET })
 * ```
 */
export function createChainBackend(config: {
  network: NetworkId | ChainNetwork
}): ChainBackend<{}> {
  const network = resolveNetwork(config.network)
  const context: ChainBackendContext = {
    network,
    config: {},
  }

  function buildChainBackend<T extends ActionGroup>(methods: T): ChainBackend<T> {
    const ds = {
      network,
      getCapabilities() {
        return Object.keys(methods)
      },
      extend<TNew extends Extension<'network' | 'getCapabilities' | 'extend'>>(
        factory: (ctx: ChainBackendContext) => TNew
      ): ChainBackend<Prettify<T & TNew>> {
        const newMethods = factory(context)
        const merged = { ...methods, ...newMethods } as Prettify<T & TNew>
        return buildChainBackend(merged)
      },
      ...methods,
    }
    return guardBackend(ds) as ChainBackend<T>
  }

  return buildChainBackend({})
}
