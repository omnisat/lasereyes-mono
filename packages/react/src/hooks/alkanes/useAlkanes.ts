'use client'

import type { AlkaneToken } from '@omnisat/lasereyes-core'
import {
  type DefaultError,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLaserEyes } from '../../providers/hooks'

/** Parameters for the {@link useAlkanesList} hook. */
type useAlkanesListParams = {
  /** Number of tokens to fetch per page. Defaults to 10. */
  batchSize?: number
  /** Additional React Query infinite query options (queryKey, queryFn, and getNextPageParam are managed internally) */
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      AlkaneToken[],
      DefaultError,
      InfiniteData<AlkaneToken[]>,
      QueryKey,
      number
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam'
  >
}

/**
 * Fetches a paginated list of all Alkane tokens using infinite scrolling.
 *
 * @remarks
 * Uses React Query's `useInfiniteQuery` to progressively load Alkane tokens.
 * Pages are automatically keyed by the highest token ID in the previous page.
 * On mainnet, pagination starts at offset 16 to skip reserved system tokens.
 *
 * The returned `data` is a flattened array of all loaded pages. Use
 * `fetchNextPage` from the spread result to load additional pages.
 *
 * Refetches every 10 minutes by default.
 *
 * @param options - Optional configuration for batch size and React Query options
 * @returns An object with `data` (flattened `AlkaneToken[]`) and all other React Query infinite query fields
 *
 * @throws Error if the LaserEyes client is not available
 *
 * @example
 * ```tsx
 * const { data: alkanes, fetchNextPage, hasNextPage } = useAlkanesList({
 *   batchSize: 20,
 * })
 * ```
 */
export function useAlkanesList(
  options?: useAlkanesListParams
): Omit<UseInfiniteQueryResult, 'data'> & { data: AlkaneToken[] | undefined } {
  const { client } = useLaserEyes(({ client }) => ({ client }))
  const queryOptions = options?.queryOptions

  const fetchAlkanes = async ({ pageParam = client?.$network.get() === 'mainnet' ? 16 : 0 }) => {
    if (!client) throw new Error('Client not found')
    const response = await client.modules.alkanes.getAlkanes({
      limit: options?.batchSize ?? 10,
      offset: pageParam,
    })
    return response
  }
  const { data, ...rest } = useInfiniteQuery({
    ...queryOptions,
    queryKey: ['fetch-alkanes', client?.$network.get(), options?.batchSize],
    initialPageParam:
      (queryOptions?.initialPageParam ?? client?.$network.get() === 'mainnet') ? 16 : 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0 && pages.flat().length) return undefined

      return (
        lastPage.reduce(
          (acc, curr) => {
            return Math.max(acc, Number(curr.id.tx))
          },
          client?.$network.get() === 'mainnet' ? 15 : 0
        ) + 1
      )
    },
    queryFn: fetchAlkanes,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  })

  const alkanes = useMemo(() => data?.pages.flat(), [data])

  return {
    data: alkanes,
    ...rest,
  }
}
