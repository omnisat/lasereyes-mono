import type { AlkaneToken } from "@kevinoyl/lasereyes-core"
import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query"
import { useLaserEyes } from "../../providers/hooks"

type useAlkanesTokenParam = {
  id: AlkaneToken["id"]
  queryOptions?: Omit<
    UseQueryOptions<AlkaneToken | null>,
    "queryFn" | "queryKey"
  >
}

type HookReturnType = UseQueryResult<AlkaneToken | null>
type IDType = AlkaneToken["id"]

export function useAlkanesToken(id: AlkaneToken["id"]): HookReturnType
export function useAlkanesToken(params: useAlkanesTokenParam): HookReturnType
export function useAlkanesToken(
  arg: AlkaneToken["id"] | useAlkanesTokenParam,
): HookReturnType {
  const { id, queryOptions } = (
    (arg as IDType).block ? { id: arg } : arg
  ) as useAlkanesTokenParam
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
    queryKey: ["use-alkane-token", network, id],
    queryFn,
  })

  return result
}
