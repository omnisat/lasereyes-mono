import { useQuery } from "@tanstack/react-query";
import { useLaserEyes } from "../providers/hooks";

export default function useAddressAlkanes(address: string) {
  const { client } = useLaserEyes(({ client }) => ({ client }))

  const fetchAlkanes = async () => {
    if (!client) throw new Error('Client not found')
    const response = await client.dataSourceManager.getAlkanesByAddress(address)
    return response
  }

  const { data, isPending, error } = useQuery({
    queryKey: ['address-alkanes', client?.$network.get(), address],
    queryFn: fetchAlkanes,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  })

  return { data, isPending, error }
}