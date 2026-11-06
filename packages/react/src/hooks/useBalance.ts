'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { getAddressBalanceQuery } from '@omnisat/lasereyes-core/query'
import { type QueryResult, useFetcherStore } from '../internal/use-fetcher-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { ReadHookOptions, ResolvedRegister } from '../types'
import { useAccount } from './useAccount'

/**
 * Reactive, cached BTC balance (in sats, as a string) for an address.
 *
 * @remarks
 * Defaults to the connected account's payment address when `address` is omitted.
 * Backed by the shared query cache, so multiple components reading the same
 * address dedupe to one fetch; revalidates automatically after a send.
 *
 * @param address - Address to query; defaults to the connected payment address.
 * @param options - Per-call overrides: `chainId` (read a non-active chain,
 *   narrowed to configured chains), `enabled` (gate the fetch), `config`, and
 *   `queryContext`.
 *
 * `chainId` (cross-chain read) requires an **explicit `address`** — the default
 * (active account's payment address) can't be paired with a foreign chain, since
 * that address belongs to the active network and would error against another
 * chain's backend. `enabled` / `config` / `queryContext` are fine without an
 * address.
 *
 * @example
 * ```tsx
 * const balance = useBalance()
 * if (balance.status === 'success') console.log(balance.data) // string
 *
 * useBalance(addr, { chainId: 'testnet4' }) // read another chain (explicit address)
 * useBalance(undefined, { enabled: false }) // default address, paused
 * ```
 */
export function useBalance<config extends LaserEyesConfig = ResolvedRegister['config']>(
  address?: undefined,
  options?: Omit<ReadHookOptions<config>, 'chainId'>
): QueryResult<string>
export function useBalance<config extends LaserEyesConfig = ResolvedRegister['config']>(
  address: string,
  options?: ReadHookOptions<config>
): QueryResult<string>
export function useBalance<config extends LaserEyesConfig = ResolvedRegister['config']>(
  address?: string,
  options?: ReadHookOptions<config>
): QueryResult<string> {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const { paymentAddress } = useAccount({ config })
  const addr = address ?? paymentAddress
  const chainId = options?.chainId
  const enabled = options?.enabled
  return useFetcherStore(
    () => getAddressBalanceQuery(config, addr, ctx, { chainId, enabled }),
    [config, ctx, addr, chainId, enabled]
  )
}
