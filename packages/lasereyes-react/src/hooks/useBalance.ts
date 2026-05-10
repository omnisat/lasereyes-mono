import type { BTC, Protocol } from "@omnisat/lasereyes-core";
import {
	type UseQueryOptions,
	type UseQueryResult,
	useQuery,
} from "@tanstack/react-query";
import { useLaserEyes } from "../providers/hooks";

type useBalanceParams<T extends Protocol> = {
	protocol: T;
	tokenId?: T extends typeof BTC ? never : string;
	queryOptions?: Omit<UseQueryOptions<bigint>, "queryKey" | "queryFn">;
};

export default function useBalance<T extends Protocol>({
	protocol,
	tokenId,
	queryOptions = {
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchInterval: 1000 * 60 * 10, // 1 minute
	},
}: useBalanceParams<T>): UseQueryResult<bigint> {
	const { client, address } = useLaserEyes(({ client, address }) => ({ client, address }));

	const fetchBalance = async () => {
		if (protocol === "btc") {
			const balance = await client?.getBalance();
			if (!balance) {
				throw new Error("Balance not found");
			}
			return BigInt(balance);
		} else {
			if (!tokenId) {
				throw new Error("Token ID is required");
			}
			// TODO: Implement balance fetching for other protocols
			return BigInt(0);
		}
	};

	const result = useQuery({
		...queryOptions,
		queryKey: ["user-balance", address, protocol, tokenId],
		queryFn: fetchBalance,
	});

	return result;
}
