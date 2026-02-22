import { ALKANES, type AlkanesOutpoint, type MetaProtocol } from '@omnisat/lasereyes-core'
import { type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query'
import { useLaserEyes } from '../providers/hooks'

/** The resolved token list type based on the meta-protocol. */
type MetaProtocolResult<T extends MetaProtocol> = T extends typeof ALKANES
  ? AlkanesOutpoint[]
  : unknown[]
/** React Query result wrapper for the token list. */
type HookReturnType<T extends MetaProtocol> = UseQueryResult<MetaProtocolResult<T>>

/**
 * Parameters for the {@link useAddressTokens} hook when using the object form.
 *
 * @typeParam T - The meta-protocol type (e.g., ALKANES)
 */
type useAddressTokensParams<T extends MetaProtocol> = {
  /** The Bitcoin address to query tokens for */
  address: string
  /** The meta-protocol to query (e.g., ALKANES) */
  protocol: T
  /** Additional React Query options (queryKey and queryFn are managed internally) */
  queryOptions?: Omit<UseQueryOptions<MetaProtocolResult<T>>, 'queryKey' | 'queryFn'>
}

/**
 * Fetches meta-protocol tokens held by a given Bitcoin address.
 *
 * @remarks
 * Queries the configured data source for tokens associated with the address
 * under the specified meta-protocol. Currently supports Alkanes; other
 * protocols will return an empty result.
 *
 * Uses React Query with a 10-minute refetch interval.
 *
 * @param protocol - The meta-protocol to query
 * @param address - The Bitcoin address to look up
 * @returns A React Query result containing the token list
 *
 * @example
 * ```tsx
 * import { ALKANES } from '@omnisat/lasereyes-core'
 *
 * const { data: tokens } = useAddressTokens(ALKANES, 'bc1q...')
 * ```
 */
export function useAddressTokens<T extends MetaProtocol>(
  protocol: MetaProtocol,
  address: string
): HookReturnType<T>
/**
 * Fetches meta-protocol tokens held by a given Bitcoin address.
 *
 * @param params - Object containing the address, protocol, and optional query options
 * @returns A React Query result containing the token list
 *
 * @example
 * ```tsx
 * const { data: tokens } = useAddressTokens({
 *   protocol: ALKANES,
 *   address: 'bc1q...',
 *   queryOptions: { staleTime: 60_000 },
 * })
 * ```
 */
export function useAddressTokens<T extends MetaProtocol>({
  address,
  protocol,
  queryOptions,
}: useAddressTokensParams<T>): HookReturnType<T>

export function useAddressTokens<T extends MetaProtocol>(
  arg: useAddressTokensParams<T> | MetaProtocol,
  arg2?: string
): HookReturnType<T> {
  type Params = useAddressTokensParams<T>
  if (typeof arg === 'string' && arg2 === undefined)
    throw Error(`Invalid argument received, 'address' cannot be undefined`)

  const { client, network } = useLaserEyes(({ client, network }) => ({
    client,
    network,
  }))

  const { address, queryOptions, protocol }: Params = (
    typeof arg === 'string' ? { address: arg2, protocol: arg } : arg
  ) as Params

  const fetchTokens = async () => {
    if (!client) throw new Error('Client not found')
    if (protocol === ALKANES) {
      const response = await client.dataSourceManager.getAlkanesByAddress(address)
      return response
    }
    return {} as MetaProtocolResult<T>
  }

  const result = useQuery({
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    ...queryOptions,
    queryKey: ['address-tokens', network, protocol, address],
    queryFn: fetchTokens,
  })
  return result
}
