import type { AlkanesOutpoint } from "@omnisat/lasereyes-core"
import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query"
import { useLaserEyes } from "../providers/hooks"

type useAddressAlkanesParams = {
  address: string
  queryOptions?: Omit<
    UseQueryOptions<AlkanesOutpoint[]>,
    "queryKey" | "queryFn"
  >
}

export default function useAddressAlkanes(
  address: string,
): UseQueryResult<AlkanesOutpoint[]>
export default function useAddressAlkanes({
  address,
  queryOptions,
}: useAddressAlkanesParams): UseQueryResult<AlkanesOutpoint[]>
export default function useAddressAlkanes(
  arg: useAddressAlkanesParams | string,
): UseQueryResult<AlkanesOutpoint[]> {
  const { client } = useLaserEyes(({ client }) => ({ client }))

  const { address, queryOptions }: useAddressAlkanesParams = (
    typeof arg === "string" ? { address: arg } : arg
  ) as useAddressAlkanesParams

  const fetchAlkanes = async () => {
    if (!client) throw new Error("Client not found")
    const response = await client.dataSourceManager.getAlkanesByAddress(address)
    return response
  }

  const result = useQuery({
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    ...queryOptions,
    queryKey: ["address-alkanes", client?.$network.get(), address],
    queryFn: fetchAlkanes,
  })
  return result
}
