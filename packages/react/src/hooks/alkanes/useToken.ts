import type { AlkaneToken } from '@omnisat/lasereyes-core'
import { type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query'
import { useLaserEyes } from '../../providers/hooks'

/** Parameters for the {@link useAlkanesToken} hook when using the object form. */
type useAlkanesTokenParam = {
  /** The Alkane token ID (block and tx pair) to look up */
  id: AlkaneToken['id']
  /** Additional React Query options (queryKey and queryFn are managed internally) */
  queryOptions?: Omit<UseQueryOptions<AlkaneToken | null>, 'queryFn' | 'queryKey'>
}

type HookReturnType = UseQueryResult<AlkaneToken | null>
type IDType = AlkaneToken['id']

/**
 * Fetches a single Alkane token by its ID.
 *
 * @remarks
 * Queries the Alkanes module for token metadata by its block/tx identifier.
 * Returns `null` within the query result if the token is not found.
 *
 * Refetches every 10 minutes by default.
 *
 * @param id - The Alkane token ID object (with `block` and `tx` fields)
 * @returns A React Query result containing the `AlkaneToken` or `null`
 *
 * @example
 * ```tsx
 * const { data: token } = useAlkanesToken({ block: 2, tx: 1 })
 * if (token) {
 *   console.log(token.name, token.symbol)
 * }
 * ```
 */
export function useAlkanesToken(id: AlkaneToken['id']): HookReturnType
/**
 * Fetches a single Alkane token by its ID with additional query options.
 *
 * @param params - Object containing the token ID and optional React Query options
 * @returns A React Query result containing the `AlkaneToken` or `null`
 *
 * @example
 * ```tsx
 * const { data: token } = useAlkanesToken({
 *   id: { block: 2, tx: 1 },
 *   queryOptions: { staleTime: 30_000 },
 * })
 * ```
 */
export function useAlkanesToken(params: useAlkanesTokenParam): HookReturnType
export function useAlkanesToken(arg: AlkaneToken['id'] | useAlkanesTokenParam): HookReturnType {
  const { id, queryOptions } = ((arg as IDType).block ? { id: arg } : arg) as useAlkanesTokenParam
  const { client, network } = useLaserEyes(({ client, network }) => ({
    client,
    network,
  }))

  const queryFn = async () => {
    const result = await client?.modules.alkanes.getAlkaneById(id)

    return result ?? null
  }

  const result = useQuery({
    refetchInterval: 1000 * 60 * 10,
    ...queryOptions,
    queryKey: ['use-alkane-token', network, id],
    queryFn,
  })

  return result
}
