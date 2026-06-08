/**
 * Cached `getTransaction` read. One file, one action.
 *
 * @remarks
 * Mirrors the other per-action read modules. A keyed-by-txid read: a confirmed
 * transaction is immutable, so it caches indefinitely well — the nanoquery
 * analogue of wagmi's `getTransactionQueryOptions` / `useTransaction`.
 *
 * @module query/transaction
 */

import type { FetcherStore } from '@nanostores/query'
import type { Transaction } from '@omnisat/lasereyes-client'
import { atom } from 'nanostores'
import { getTransaction } from '../actions'
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
 * Serialized cache key for a transaction read. MUST stay in sync with the key
 * parts in {@link getTransactionQuery}.
 */
export function getTransactionQueryKey(networkId: string, txId: string): string {
  return `transaction${SEP}${networkId}${SEP}${txId}`
}

/**
 * Reactive, cached, deduped transaction-details store for `txId`. Idle (no fetch)
 * until `txId` is a non-empty string. Refetches on network switch.
 *
 * @param config - The LaserEyes config.
 * @param txId - Transaction ID to fetch; `null`/`undefined`/`''` keeps the store idle.
 * @param ctx - Cache context. Defaults to {@link defaultQueryContext}.
 *
 * @example
 * ```ts
 * const $tx = getTransactionQuery(config, 'abcd…')
 * $tx.subscribe(({ data }) => render(data?.status))
 * ```
 */
export function getTransactionQuery(
  config: LaserEyesConfig,
  txId: string | null | undefined,
  ctx: QueryContext = defaultQueryContext,
  options?: QueryBuilderOptions
): FetcherStore<Transaction> {
  const [createFetcherStore] = ctx
  const $networkId = effectiveNetworkIdAtom(config, options)
  const $txId = atom<string | null>(txId || null)
  const chainOpts = options?.chainId !== undefined ? { chainId: options.chainId } : undefined
  let $store: FetcherStore<Transaction>
  $store = createFetcherStore<Transaction>(['transaction', SEP, $networkId, SEP, $txId], {
    fetcher: withSharedData(
      () => $store,
      () =>
        chainOpts
          ? getTransaction(config, $txId.get() as string, chainOpts)
          : getTransaction(config, $txId.get() as string)
    ),
  })
  return $store
}
