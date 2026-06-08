/**
 * Cached `getAddressBalance` read. One file, one action.
 *
 * Mirrors wagmi's per-action `query/getBalance.ts` (`getBalanceQueryKey` +
 * `getBalanceQueryOptions`). Here the builder returns a nanostores fetcher
 * store instead of a TanStack options descriptor.
 *
 * @module query/balance
 */

import type { FetcherStore } from '@nanostores/query'
import { atom } from 'nanostores'
import { getAddressBalance } from '../actions'
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
 * Serialized cache key for an address-balance read. Use with
 * `ctx[2].invalidateKeys(getAddressBalanceQueryKey(networkId, address))` for
 * precise invalidation (wagmi's `getBalanceQueryKey` analogue). MUST stay in
 * sync with the key parts in {@link getAddressBalanceQuery}.
 */
export function getAddressBalanceQueryKey(networkId: string, address: string): string {
  return `balance${SEP}${networkId}${SEP}${address}`
}

/**
 * Reactive, cached, deduped BTC balance store (sats, as a string) for `address`.
 * Idle (no fetch) until `address` is a non-empty string. Refetches on network
 * switch via the reactive networkId key-part.
 *
 * @param config - The LaserEyes config.
 * @param address - Address to query; `null`/`undefined`/`''` keeps the store idle.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $balance = getAddressBalanceQuery(config, 'bc1q…')
 * $balance.subscribe(({ data, loading, error }) => render(data))
 * ```
 */
export function getAddressBalanceQuery(
  config: LaserEyesConfig,
  address: string | null | undefined,
  ctx: QueryContext = defaultQueryContext,
  options?: QueryBuilderOptions
): FetcherStore<string> {
  const [createFetcherStore] = ctx
  // Folds `chainId` (own cache slot) and `enabled: false` (NoKey) into the key.
  const $networkId = effectiveNetworkIdAtom(config, options)
  // Only an atom may resolve to a NoKey (`null`) to disable the fetch; a bare
  // empty string would be a *valid* key and would fetch.
  const $addr = atom<string | null>(address || null)
  // Forward `{ chainId }` to the action only when set, so the default call stays
  // 2-arg (`getAddressBalance(config, addr)`) — the action's own contract.
  const chainOpts = options?.chainId !== undefined ? { chainId: options.chainId } : undefined
  // Structural sharing is a no-op for a primitive string result, but keeping the
  // wrap uniform across every action file makes this a clean copy-paste template.
  let $store: FetcherStore<string>
  $store = createFetcherStore<string>(['balance', SEP, $networkId, SEP, $addr], {
    fetcher: withSharedData(
      () => $store,
      () =>
        chainOpts
          ? getAddressBalance(config, $addr.get() as string, chainOpts)
          : getAddressBalance(config, $addr.get() as string)
    ),
  })
  return $store
}
