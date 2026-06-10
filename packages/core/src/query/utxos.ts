/**
 * Cached `getAddressUtxos` read. One file, one action.
 *
 * Follows the per-action query-module layout. See {@link getAddressUtxosQuery}.
 *
 * @module query/utxos
 */

import type { FetcherStore } from '@nanostores/query'
import type { PaginatedResult, UTXO } from '@omnisat/lasereyes-client'
import { atom } from 'nanostores'
import { getAddressUtxos } from '../actions'
import type { LaserEyesConfig } from '../config'
import {
  defaultQueryContext,
  effectiveNetworkIdAtom,
  type PaginatedQueryBuilderOptions,
  type QueryContext,
  SEP,
} from './context'
import { withSharedData } from './structural-sharing'

/**
 * Serialized cache key for an address-utxos read. MUST stay in sync with the
 * key parts in {@link getAddressUtxosQuery}.
 *
 * @remarks
 * `cursor` and `limit` are part of the key so each page caches under its own
 * slot; they serialize to empty for the default (first, unbounded) page. The
 * address stays delimiter-bounded (`${SEP}${address}${SEP}`), so the
 * address-substring revalidation selectors still match every page.
 */
export function getAddressUtxosQueryKey(
  networkId: string,
  address: string,
  cursor?: string | number,
  limit?: number
): string {
  return `utxos${SEP}${networkId}${SEP}${address}${SEP}${cursor ?? ''}${SEP}${limit ?? ''}`
}

/**
 * Reactive, cached, deduped UTXO-set store for `address`. Idle (no fetch) until
 * `address` is a non-empty string. Refetches on network switch.
 *
 * @param config - The LaserEyes config.
 * @param address - Address to query; `null`/`undefined`/`''` keeps the store idle.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 * @param options - Per-call overrides: `chainId`, `enabled`, and pagination
 *   (`cursor`, `limit`). Pagination folds into the key, so each page is its own
 *   cache slot; the React `useUtxos` hook drives the cursor to accumulate pages.
 *
 * @example
 * ```ts
 * const $utxos = getAddressUtxosQuery(config, 'bc1q…', ctx, { limit: 50 })
 * $utxos.subscribe(({ data }) => render(data?.data ?? []))
 * // next page: getAddressUtxosQuery(config, 'bc1q…', ctx, { cursor: data.nextCursor, limit: 50 })
 * ```
 */
export function getAddressUtxosQuery(
  config: LaserEyesConfig,
  address: string | null | undefined,
  ctx: QueryContext = defaultQueryContext,
  options?: PaginatedQueryBuilderOptions
): FetcherStore<PaginatedResult<UTXO>> {
  const [createFetcherStore] = ctx
  const $networkId = effectiveNetworkIdAtom(config, options)
  const $addr = atom<string | null>(address || null)
  const { chainId, cursor, limit } = options ?? {}
  // Forward only the fields that are set, so the default call stays minimal.
  const readOpts = {
    ...(chainId !== undefined ? { chainId } : {}),
    ...(cursor !== undefined ? { cursor } : {}),
    ...(limit !== undefined ? { limit } : {}),
  }
  const hasOpts = Object.keys(readOpts).length > 0
  // Structural sharing matters here: a polled UTXO set is usually identical
  // between fetches, so reusing the old array/object references avoids spurious
  // recomputation in consumers that derive from `data`.
  let $store: FetcherStore<PaginatedResult<UTXO>>
  $store = createFetcherStore<PaginatedResult<UTXO>>(
    // cursor/limit are key parts → each page caches separately. They sit AFTER
    // the address so the `${SEP}${address}` revalidation match still holds.
    ['utxos', SEP, $networkId, SEP, $addr, SEP, String(cursor ?? ''), SEP, String(limit ?? '')],
    {
      fetcher: withSharedData(
        () => $store,
        () =>
          hasOpts
            ? getAddressUtxos(config, $addr.get() as string, readOpts)
            : getAddressUtxos(config, $addr.get() as string)
      ),
    }
  )
  return $store
}
