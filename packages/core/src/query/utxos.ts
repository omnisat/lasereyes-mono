/**
 * Cached `getAddressUtxos` read. One file, one action.
 *
 * Mirrors wagmi's per-action query module layout. See {@link getAddressUtxosQuery}.
 *
 * @module query/utxos
 */

import type { FetcherStore } from '@nanostores/query'
import type { PaginatedResult, UTXO } from '@omnisat/lasereyes-client'
import { atom } from 'nanostores'
import { getAddressUtxos } from '../actions'
import type { LaserEyesConfig } from '../config'
import { defaultQueryContext, networkIdAtom, type QueryContext, SEP } from './context'
import { withSharedData } from './structural-sharing'

/**
 * Serialized cache key for an address-utxos read. MUST stay in sync with the
 * key parts in {@link getAddressUtxosQuery}.
 */
export function getAddressUtxosQueryKey(networkId: string, address: string): string {
  return `utxos${SEP}${networkId}${SEP}${address}`
}

/**
 * Reactive, cached, deduped UTXO-set store for `address`. Idle (no fetch) until
 * `address` is a non-empty string. Refetches on network switch.
 *
 * @param config - The LaserEyes config.
 * @param address - Address to query; `null`/`undefined`/`''` keeps the store idle.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $utxos = getAddressUtxosQuery(config, 'bc1q…')
 * $utxos.subscribe(({ data }) => render(data?.data ?? []))
 * ```
 */
export function getAddressUtxosQuery(
  config: LaserEyesConfig,
  address: string | null | undefined,
  ctx: QueryContext = defaultQueryContext
): FetcherStore<PaginatedResult<UTXO>> {
  const [createFetcherStore] = ctx
  const $networkId = networkIdAtom(config)
  const $addr = atom<string | null>(address || null)
  // Structural sharing matters here: a polled UTXO set is usually identical
  // between fetches, so reusing the old array/object references avoids spurious
  // recomputation in consumers that derive from `data`.
  let $store: FetcherStore<PaginatedResult<UTXO>>
  $store = createFetcherStore<PaginatedResult<UTXO>>(['utxos', SEP, $networkId, SEP, $addr], {
    fetcher: withSharedData(
      () => $store,
      () => getAddressUtxos(config, $addr.get() as string)
    ),
  })
  return $store
}
