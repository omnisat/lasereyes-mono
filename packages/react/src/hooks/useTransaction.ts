'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { getTransactionQuery } from '@omnisat/lasereyes-core/query'
import { useFetcherStore } from '../internal/use-fetcher-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { ReadHookOptions, ResolvedRegister } from '../types'

/**
 * Reactive, cached transaction details by txid.
 *
 * @remarks
 * Idle (no fetch) until `txId` is a non-empty string. A confirmed transaction is
 * immutable, so it caches well.
 *
 * @param txId - Transaction id to fetch.
 * @param options - Per-call overrides (`chainId`, `enabled`, `config`,
 *   `queryContext`).
 *
 * @example
 * ```tsx
 * const tx = useTransaction(txId)
 * if (tx.status === 'success') console.log(tx.data.status)
 * ```
 */
export function useTransaction<config extends LaserEyesConfig = ResolvedRegister['config']>(
  txId?: string,
  options?: ReadHookOptions<config>
) {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const chainId = options?.chainId
  const enabled = options?.enabled
  return useFetcherStore(
    () => getTransactionQuery(config, txId, ctx, { chainId, enabled }),
    [config, ctx, txId, chainId, enabled]
  )
}
