'use client'

import type { LaserEyesConfig, UTXO } from '@omnisat/lasereyes-core'
import { getAddressUtxosQuery } from '@omnisat/lasereyes-core/query'
import { type InfiniteResult, useInfiniteFetcher } from '../internal/use-infinite-fetcher'
import { useConfig, useQueryContext } from '../providers/context'
import type { PaginatedReadHookOptions, ResolvedRegister } from '../types'
import { useAccount } from './useAccount'

/**
 * Reactive, cached, **paginating** UTXO set for an address.
 *
 * @remarks
 * Defaults to the connected account's payment address when `address` is omitted.
 * Accumulates pages: `items` holds every UTXO loaded so far, `fetchNextPage()`
 * loads the next page (cursor managed internally), and `hasNextPage` /
 * `isFetchingNextPage` drive a "load more" UI. Each page caches under its own key.
 *
 * Every loaded page stays subscribed, so the list **auto-revalidates** after a
 * send (the spent + change addresses) exactly like {@link useBalance} — no
 * manual `refetch()` needed to avoid building coin selection on spent UTXOs.
 *
 * Like {@link useBalance}, `chainId` (cross-chain read) requires an **explicit
 * `address`** — the active-account default can't be paired with a foreign chain.
 * `limit` / `enabled` / `config` / `queryContext` are fine without an address.
 *
 * @param address - Address to query; defaults to the connected payment address.
 * @param options - `limit` (page size), plus `chainId` / `enabled` / `config` /
 *   `queryContext` overrides. `cursor` is owned by the hook, not passed.
 *
 * @example
 * ```tsx
 * const utxos = useUtxos(undefined, { limit: 50 })
 * utxos.items                         // UTXO[] across all loaded pages
 * {utxos.hasNextPage && <button onClick={() => utxos.fetchNextPage()}>Load more</button>}
 * ```
 */
export function useUtxos<config extends LaserEyesConfig = ResolvedRegister['config']>(
  address?: undefined,
  options?: Omit<PaginatedReadHookOptions<config>, 'chainId'>
): InfiniteResult<UTXO>
export function useUtxos<config extends LaserEyesConfig = ResolvedRegister['config']>(
  address: string,
  options?: PaginatedReadHookOptions<config>
): InfiniteResult<UTXO>
export function useUtxos<config extends LaserEyesConfig = ResolvedRegister['config']>(
  address?: string,
  options?: PaginatedReadHookOptions<config>
): InfiniteResult<UTXO> {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const { paymentAddress } = useAccount({ config })
  const addr = address ?? paymentAddress
  const chainId = options?.chainId
  const limit = options?.limit
  return useInfiniteFetcher(
    ({ cursor, enabled }) =>
      getAddressUtxosQuery(config, addr, ctx, { chainId, enabled, cursor, limit }),
    [config, ctx, addr, chainId, limit],
    { enabled: options?.enabled }
  )
}
