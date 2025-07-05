'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLaserEyes } from '../providers/hooks'

export default function useAlkanesList(
  options: { batchSize?: number } = { batchSize: 10 }
) {
  const { client } = useLaserEyes(({ client }) => ({ client }))

  const fetchAlkanes = async ({
    pageParam = client?.$network.get() === 'mainnet' ? 16 : 0,
  }) => {
    if (!client) throw new Error('Client not found')
    const response = await client.modules.alkanes.getAlkanes({
      limit: options.batchSize ?? 10,
      offset: pageParam,
    })
    return response
  }

  const {
    data,
    isPending,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['fetch-alkanes', client?.$network.get(), options.batchSize],
    initialPageParam: client?.$network.get() === 'mainnet' ? 16 : 0,
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
    isPending,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  }
}
