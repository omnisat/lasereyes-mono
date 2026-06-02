/**
 * Chain backends — lazy, network-parameterized backend factories.
 *
 * @remarks
 * A **chain backend** is the external service backing a chain's reads
 * (mempool, sandshrew, maestro, …). It's expressed as a {@link
 * ChainBackendFactory}: a factory that, given the resolved network for a
 * chain, produces a {@link ChainBackend}. Vendor entrypoints
 * (`mempool()`, `sandshrew()`, `maestro()`) return one of these; the core
 * package's `createLaserEyesConfig` invokes them with each chain's network.
 *
 * Deferring construction to "config build time" lets a single backend
 * declaration (`mempool()`) be reused across networks — the network is
 * injected from the `backends` map key rather than repeated at every call
 * site.
 *
 * {@link combineBackends} composes several backends into one, folding their
 * backends with the FIRST backend winning on method overlap (highest
 * priority) and later ones acting as fallbacks. This is the seam where
 * richer combination strategies (availability fallback, latency routing,
 * per-method routing) can later be layered in.
 *
 * @module backend/backend
 */

import type { ChainNetwork, NetworkId } from '../chains'
import type { ChainBackend } from '../types/backend'
import type { ActionGroup } from './capabilities'
import { mergeChainBackends } from './merge'

/**
 * A lazy, network-parameterized backend factory.
 *
 * @remarks
 * Mirrors the connector side's `CreateConnectorFn`: the function *is* the
 * backend; calling it with a network yields the concrete
 * {@link ChainBackend}. `mempool()`, `sandshrew()`, and `maestro()` all
 * return a `ChainBackendFactory`.
 *
 * @typeParam caps - The capability set the produced backend exposes.
 */
export type ChainBackendFactory<caps extends ActionGroup = ActionGroup> = (
  network: NetworkId | ChainNetwork
) => ChainBackend<caps>

/**
 * Fold a tuple of backend factories into the intersection of the
 * capability sets their backends expose.
 *
 * @internal
 */
type MergedBackendCaps<T extends readonly ChainBackendFactory<any>[]> = T extends readonly [
  infer H,
  ...infer R,
]
  ? H extends ChainBackendFactory<infer C>
    ? R extends readonly ChainBackendFactory<any>[]
      ? C & MergedBackendCaps<R>
      : C
    : ActionGroup
  : ActionGroup

/**
 * Combine multiple {@link ChainBackendFactory | chain backends} into one.
 *
 * @remarks
 * The returned backend, when invoked for a network, builds each underlying
 * backend and folds them via {@link mergeChainBackends}. The **first**
 * backend wins on method overlap (highest priority); later backends act as
 * fallbacks for methods the earlier ones don't provide. The combined data
 * source's type is the intersection of every backend's capabilities, so a
 * `combineBackends(sandshrew(), mempool())` is typed with sandshrew's full
 * capability set plus mempool's base methods.
 *
 * @param backends - Backends in priority order (index 0 = highest priority).
 * @returns A single backend exposing the union of all capabilities.
 *
 * @example
 * ```ts
 * import { combineBackends } from '@omnisat/lasereyes-client'
 * import { mempool } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { sandshrew } from '@omnisat/lasereyes-client/vendors/sandshrew'
 *
 * // sandshrew primary (runes/alkanes/inscriptions/ord + base),
 * // mempool fallback for base BTC methods.
 * const backend = combineBackends(sandshrew(), mempool())
 * ```
 */
export function combineBackends<const T extends readonly ChainBackendFactory<any>[]>(
  ...backends: T
): ChainBackendFactory<MergedBackendCaps<T>> {
  if (backends.length === 0) {
    throw new Error('combineBackends requires at least one backend')
  }
  return network => {
    const sources = backends.map(backend => backend(network))
    // reduceRight folds right-to-left so the leftmost backend ends as the
    // primary (it wins on method overlap in mergeChainBackends(primary, …)).
    return sources.reduceRight((acc, src) => mergeChainBackends(src, acc)) as ChainBackend<
      MergedBackendCaps<T>
    >
  }
}
