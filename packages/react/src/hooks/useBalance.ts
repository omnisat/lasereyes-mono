import { BTC, type Protocol } from '@omnisat/lasereyes-core'
import { type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query'
import { useLaserEyes } from '../providers/hooks'

/**
 * Parameters for the {@link useBalance} hook when using the object form.
 *
 * @typeParam T - The protocol type (e.g., BTC, Runes, BRC-20)
 */
type useBalanceParams<T extends Protocol> = {
  /** The protocol to fetch the balance for */
  protocol: T
  /** Token identifier, required for non-BTC protocols (e.g., Runes or BRC-20 token ID) */
  tokenId?: T extends typeof BTC ? never : string
  /** Additional React Query options (queryKey and queryFn are managed internally) */
  queryOptions?: Omit<UseQueryOptions<bigint>, 'queryKey' | 'queryFn'>
}
/**
 * Fetches the balance for a given protocol and optional token.
 *
 * @remarks
 * Uses React Query internally with a 5-minute stale time and 10-minute refetch
 * interval. The query is keyed by network, address, protocol, and tokenId,
 * so it automatically refetches when any of these change.
 *
 * @param params - Object containing the protocol, optional tokenId, and query options
 * @returns A React Query result containing the balance as a `bigint` (in satoshis for BTC)
 *
 * @example
 * ```tsx
 * const { data: balance, isPending } = useBalance({ protocol: BTC })
 * ```
 */
export function useBalance<T extends Protocol>({
  protocol,
  tokenId,
  queryOptions,
}: useBalanceParams<T>): UseQueryResult<bigint>
/**
 * Fetches the BTC balance for the connected wallet.
 *
 * @param protocol - Must be the `BTC` constant
 * @returns A React Query result containing the balance as a `bigint` in satoshis
 *
 * @example
 * ```tsx
 * import { BTC } from '@omnisat/lasereyes-core'
 *
 * const { data: balance } = useBalance(BTC)
 * ```
 */
export function useBalance(protocol: typeof BTC): UseQueryResult<bigint>
export function useBalance<T extends Protocol>(
  arg: useBalanceParams<T> | typeof BTC
): UseQueryResult<bigint> {
  const { client, address, network } = useLaserEyes(({ client, address, network }) => ({
    client,
    address,
    network,
  }))

  if (typeof arg === 'string' && arg !== BTC) {
    throw Error(`Invalid parameters. Expected \`${BTC}\`, got: \`${arg}\``)
  }
  const { protocol, tokenId, queryOptions }: useBalanceParams<T> = (
    arg === BTC ? { protocol: BTC } : arg
  ) as useBalanceParams<T>

  const fetchBalance = async () => {
    if (address) {
      if (protocol === 'btc') {
        const balance = await client?.getBalance()
        if (!balance) {
          throw new Error('Balance not found')
        }
        return BigInt(balance)
      } else {
        if (!tokenId) {
          throw new Error('Token ID is required')
        }
        // TODO: Implement balance fetching for other protocols
      }
    }
    return BigInt(0)
  }

  const result = useQuery({
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 1 minute
    ...queryOptions,
    queryKey: ['user-balance', network, address, protocol, tokenId],
    queryFn: fetchBalance,
  })

  return result
}
