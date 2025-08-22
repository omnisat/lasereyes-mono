"use client"

import type { AlkaneToken } from "@kevinoyl/lasereyes-core"
import {
  type DefaultError,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from "@tanstack/react-query"
import { useMemo } from "react"
import { useLaserEyes } from "../../providers/hooks"

type useAlkanesListParams = {
  batchSize?: number
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      AlkaneToken[],
      DefaultError,
      InfiniteData<AlkaneToken[]>,
      QueryKey,
      number
    >,
    "queryKey" | "queryFn" | "getNextPageParam"
  >
}

export function useAlkanesList(
  options?: useAlkanesListParams,
): Omit<UseInfiniteQueryResult, "data"> & { data: AlkaneToken[] | undefined } {
  const { client } = useLaserEyes(({ client }) => ({ client }))
  const queryOptions = options?.queryOptions

  const fetchAlkanes = async ({
    pageParam = client?.$network.get() === "mainnet" ? 16 : 0,
  }) => {
    if (!client) throw new Error("Client not found")
    const response = await client.modules.alkanes.getAlkanes({
      limit: options?.batchSize ?? 10,
      offset: pageParam,
    })
    return response
  }
  const { data, ...rest } = useInfiniteQuery({
    ...queryOptions,
    queryKey: ["fetch-alkanes", client?.$network.get(), options?.batchSize],
    initialPageParam:
      (queryOptions?.initialPageParam ?? client?.$network.get() === "mainnet")
        ? 16
        : 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0 && pages.flat().length) return undefined

      return (
        lastPage.reduce(
          (acc, curr) => {
            return Math.max(acc, Number(curr.id.tx))
          },
          client?.$network.get() === "mainnet" ? 15 : 0,
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
