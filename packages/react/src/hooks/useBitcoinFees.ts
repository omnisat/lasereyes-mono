import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useLaserEyes } from '../providers/hooks'

/** The fee rate data returned by {@link useBitcoinFees}. */
type FeesResult = {
  /** Recommended fee rate (sat/vB) for fast confirmation */
  fastFee: number
  /** Minimum fee rate (sat/vB) for eventual confirmation */
  minFee: number
}
/** Parameters for the {@link useBitcoinFees} hook. */
type useBitcoinFeesParams = {
  /** Additional React Query options (queryKey and queryFn are managed internally) */
  queryOptions?: Omit<UseQueryOptions<FeesResult>, 'queryKey' | 'queryFn'>
}

/**
 * Fetches recommended Bitcoin network fee rates.
 *
 * @remarks
 * Queries the configured data source for current mempool fee estimates.
 * Uses React Query with a 5-minute stale time and 1-minute refetch interval.
 * Defaults to `{ minFee: 0, fastFee: 1 }` if the client is unavailable.
 *
 * @param options - Optional configuration including React Query options
 * @returns An object containing `data` (the fee rates), `isPending`, and `error`
 *
 * @example
 * ```tsx
 * const { data: fees, isPending } = useBitcoinFees()
 * if (fees) {
 *   console.log(`Fast fee: ${fees.fastFee} sat/vB`)
 * }
 * ```
 */
export function useBitcoinFees(options?: useBitcoinFeesParams) {
  const { client, network } = useLaserEyes(({ client, network }) => ({
    client,
    network,
  }))

  const fetchFees = async () => {
    const fees = await client?.dataSourceManager.getRecommendedFees()
    return fees ?? { minFee: 0, fastFee: 1 }
  }

  const { data, isPending, error } = useQuery({
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // 1 minute
    ...options?.queryOptions,
    queryKey: ['mempool-fees', network],
    queryFn: fetchFees,
  })

  return { data, isPending, error }
}
