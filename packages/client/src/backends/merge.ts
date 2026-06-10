import { NetworkMismatchError } from '../errors'
import type { ChainBackend, ChainBackendContext } from '../types/backend'
import type { ActionGroup } from './capabilities'
import { guardBackend } from './guard'

/**
 * Merges two chain backends into a single backend that combines their capabilities.
 *
 * When both backends provide methods with the same name, the primary backend's
 * methods take precedence. Capability group registrations are merged, combining method
 * lists for overlapping groups.
 *
 * @param primary - The primary backend whose methods take precedence on overlap
 * @param secondary - The secondary backend providing fallback methods
 * @returns A merged backend combining capabilities from both sources
 *
 * @throws {@link NetworkMismatchError} If the two backends are configured for different networks
 *
 * @example
 * ```ts
 * import { mergeChainBackends } from '@omnisat/lasereyes-client'
 * import { createBackend as createMempool } from '@omnisat/lasereyes-client/backends/mempool'
 * import { createBackend as createSandshrew } from '@omnisat/lasereyes-client/backends/sandshrew'
 *
 * const mempool = createMempool({ network: MAINNET })
 * const sandshrew = createSandshrew({ network: MAINNET, apiKey: '...' })
 * const merged = mergeChainBackends(sandshrew, mempool)
 * ```
 */
export function mergeChainBackends<A extends ActionGroup = {}, B extends ActionGroup = {}>(
  primary: ChainBackend<A>,
  secondary: ChainBackend<B>
): ChainBackend<A & B> {
  if (primary.network !== secondary.network) {
    throw new NetworkMismatchError(primary.network.name, secondary.network.name)
  }

  const primaryMethods = primary.getCapabilities()
  const secondaryMethods = secondary.getCapabilities()

  // Collect all method names from both backends (excluding built-in props)
  const builtins = new Set(['network', 'getCapabilities', 'extend'])

  // Secondary methods first, then primary wins on overlap
  const mergedMethods: Record<string, unknown> = {}

  for (const key of Object.keys(secondary as object)) {
    if (!builtins.has(key)) {
      mergedMethods[key] = (secondary as Record<string, unknown>)[key]
    }
  }
  for (const key of Object.keys(primary as object)) {
    if (!builtins.has(key)) {
      mergedMethods[key] = (primary as Record<string, unknown>)[key]
    }
  }

  const context: ChainBackendContext = {
    network: primary.network,
    config: {},
  }

  const ds = {
    network: primary.network,
    getCapabilities() {
      return [...new Set([...secondaryMethods, ...primaryMethods])]
    },
    extend<TNew>(factory: (ctx: ChainBackendContext) => TNew): ChainBackend<A & B & TNew> {
      const group = factory(context)
      Object.assign(mergedMethods, group)
      return guardBackend(ds) as unknown as ChainBackend<A & B & TNew>
    },
    ...mergedMethods,
  } as ChainBackend<A & B>

  return guardBackend(ds)
}
