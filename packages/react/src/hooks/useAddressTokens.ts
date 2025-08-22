import {
  ALKANES,
  type AlkanesOutpoint,
  type MetaProtocol,
} from "@kevinoyl/lasereyes-core"
import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query"
import { useLaserEyes } from "../providers/hooks"

type MetaProtocolResult<T extends MetaProtocol> = T extends typeof ALKANES
  ? AlkanesOutpoint[]
  : unknown[]
type HookReturnType<T extends MetaProtocol> = UseQueryResult<MetaProtocolResult<T>>

type useAddressTokensParams<T extends MetaProtocol> = {
  address: string
  protocol: T
  queryOptions?: Omit<
    UseQueryOptions<MetaProtocolResult<T>>,
    "queryKey" | "queryFn"
  >
}

export function useAddressTokens<T extends MetaProtocol>(
  protocol: MetaProtocol,
  address: string,
): HookReturnType<T>
export function useAddressTokens<T extends MetaProtocol>({
  address,
  protocol,
  queryOptions,
}: useAddressTokensParams<T>): HookReturnType<T>

export function useAddressTokens<T extends MetaProtocol>(
  arg: useAddressTokensParams<T> | MetaProtocol,
  arg2?: string,
): HookReturnType<T> {
  type Params = useAddressTokensParams<T>
  if (typeof arg === "string" && arg2 === undefined)
    throw Error(`Invalid argument received, 'address' cannot be undefined`)

  const { client, network } = useLaserEyes(({ client, network }) => ({
    client,
    network,
  }))

  const { address, queryOptions, protocol }: Params = (
    typeof arg === "string" ? { address: arg2, protocol: arg } : arg
  ) as Params

  const fetchTokens = async () => {
    if (!client) throw new Error("Client not found")
    if (protocol === ALKANES) {
      const response =
        await client.dataSourceManager.getAlkanesByAddress(address)
      return response
    }
    return {} as MetaProtocolResult<T>
  }

  const result = useQuery({
    refetchInterval: 1000 * 60 * 10, // 10 minutes
    ...queryOptions,
    queryKey: ["address-tokens", network, protocol, address],
    queryFn: fetchTokens,
  })
  return result
}
