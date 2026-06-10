/**
 * Cached `getRecommendedFees` read. One file, one action.
 *
 * @remarks
 * Demonstrates the pattern scaling to a **network-only** read (no address): the
 * key is just `fees:${networkId}`, the store is always enabled, and there's no
 * conditional `$addr` atom. Fees are polled often, so dedup + stale-while-
 * revalidate caching pays off heavily here — the nanoquery analogue of a
 * fee-history query-options builder / `useFeeData` hook.
 *
 * @module query/fees
 */

import type { FetcherStore } from '@nanostores/query'
import type { FeeEstimate } from '@omnisat/lasereyes-client'
import { getRecommendedFees } from '../actions'
import type { LaserEyesConfig } from '../config'
import {
  defaultQueryContext,
  effectiveNetworkIdAtom,
  type QueryBuilderOptions,
  type QueryContext,
  SEP,
} from './context'
import { withSharedData } from './structural-sharing'

/**
 * Serialized cache key for a recommended-fees read. MUST stay in sync with the
 * key parts in {@link getRecommendedFeesQuery}.
 */
export function getRecommendedFeesQueryKey(networkId: string): string {
  return `fees${SEP}${networkId}`
}

/**
 * Reactive, cached, deduped recommended-fees store for the active network.
 * Always enabled (no address gate); refetches on network switch.
 *
 * @param config - The LaserEyes config.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $fees = getRecommendedFeesQuery(config)
 * $fees.subscribe(({ data }) => render(data?.fastFee))
 * ```
 */
export function getRecommendedFeesQuery(
  config: LaserEyesConfig,
  ctx: QueryContext = defaultQueryContext,
  options?: QueryBuilderOptions
): FetcherStore<FeeEstimate> {
  const [createFetcherStore] = ctx
  // No address gate here, so `enabled: false` rides on the networkId key-part
  // (effectiveNetworkIdAtom → null → NoKey → idle).
  const $networkId = effectiveNetworkIdAtom(config, options)
  const chainOpts = options?.chainId !== undefined ? { chainId: options.chainId } : undefined
  let $store: FetcherStore<FeeEstimate>
  $store = createFetcherStore<FeeEstimate>(['fees', SEP, $networkId], {
    fetcher: withSharedData(
      () => $store,
      () => (chainOpts ? getRecommendedFees(config, chainOpts) : getRecommendedFees(config))
    ),
  })
  return $store
}
