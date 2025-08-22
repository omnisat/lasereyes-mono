import { BTC, type Protocol } from "@kevinoyl/lasereyes-core"
import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query"
import { useLaserEyes } from "../providers/hooks"

type useBalanceParams<T extends Protocol> = {
  protocol: T
  tokenId?: T extends typeof BTC ? never : string
  queryOptions?: Omit<UseQueryOptions<bigint>, "queryKey" | "queryFn">
}
export function useBalance<T extends Protocol>({
  protocol,
  tokenId,
  queryOptions,
}: useBalanceParams<T>): UseQueryResult<bigint>
export function useBalance(protocol: typeof BTC): UseQueryResult<bigint>
export function useBalance<T extends Protocol>(
  arg: useBalanceParams<T> | typeof BTC,
): UseQueryResult<bigint> {
  const { client, address, network } = useLaserEyes(
    ({ client, address, network }) => ({
      client,
      address,
      network,
    }),
  )

  if (typeof arg === "string" && arg !== BTC) {
    throw Error(`Invalid parameters. Expected \`${BTC}\`, got: \`${arg}\``)
  }
  const { protocol, tokenId, queryOptions }: useBalanceParams<T> = (
    arg === BTC ? { protocol: BTC } : arg
  ) as useBalanceParams<T>

  const fetchBalance = async () => {
    if (address) {
      if (protocol === "btc") {
        const balance = await client?.getBalance()
        if (!balance) {
          throw new Error("Balance not found")
        }
        return BigInt(balance)
      } else {
        if (!tokenId) {
          throw new Error("Token ID is required")
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
    queryKey: ["user-balance", network, address, protocol, tokenId],
    queryFn: fetchBalance,
  })

  return result
}
