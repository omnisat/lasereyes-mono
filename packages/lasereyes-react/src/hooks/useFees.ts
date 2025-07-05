import { useQuery } from "@tanstack/react-query";
import { useLaserEyes } from "../providers/hooks";

export default function useBitcoinFees() {
  const { client } = useLaserEyes(({ client }) => ({ client }));

  const fetchFees = async () => {
    const fees = await client?.dataSourceManager.getRecommendedFees();
    return fees ?? { minFee: 0, fastFee: 1 };
  };

  const { data, isPending, error } = useQuery({
    queryKey: ["mempool-fees"],
    queryFn: fetchFees,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // 1 minute
  });

  return { data, isPending, error };
}