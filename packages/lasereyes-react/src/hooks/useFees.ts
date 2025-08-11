import { type UseQueryOptions, useQuery } from "@tanstack/react-query"
import { useLaserEyes } from "../providers/hooks"

type FeesResult = {
  fastFee: number
  minFee: number
}
type useBitcoinFeesParams = {
  queryOptions?: Omit<UseQueryOptions<FeesResult>, "queryKey" | "queryFn">
}

export default function useBitcoinFees(options?: useBitcoinFeesParams) {
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
    queryKey: ["mempool-fees", network],
    queryFn: fetchFees,
  })

  return { data, isPending, error }
}
