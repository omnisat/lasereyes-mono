'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { getRecommendedFeesQuery } from '@omnisat/lasereyes-core/query'
import { useFetcherStore } from '../internal/use-fetcher-store'
import { useConfig, useQueryContext } from '../providers/context'
import type { ReadHookOptions, ResolvedRegister } from '../types'

/**
 * Reactive, cached recommended fee rates for the active network.
 *
 * @remarks
 * Network-scoped (no address); refetches on network switch. Fees are polled
 * often, so the shared cache + dedup pays off.
 *
 * @param options - Per-call overrides (`chainId`, `enabled`, `config`,
 *   `queryContext`).
 *
 * @example
 * ```tsx
 * const fees = useFeeRates()
 * if (fees.status === 'success') console.log(fees.data.fastFee)
 * ```
 */
export function useFeeRates<config extends LaserEyesConfig = ResolvedRegister['config']>(
  options?: ReadHookOptions<config>
) {
  const config = useConfig(options)
  const ctx = useQueryContext(options?.queryContext)
  const chainId = options?.chainId
  const enabled = options?.enabled
  return useFetcherStore(
    () => getRecommendedFeesQuery(config, ctx, { chainId, enabled }),
    [config, ctx, chainId, enabled]
  )
}
