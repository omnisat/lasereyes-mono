import type { BTC, Protocol } from '@omnisat/lasereyes-core'
import { useQuery } from '@tanstack/react-query'
import { useLaserEyes } from '../providers/hooks'

export default function useBalance(protocol: typeof BTC): {
  data: string
  isPending: boolean
  error: Error | null
}
export default function useBalance(
  protocol: Exclude<Protocol, typeof BTC>,
  _tokenId: string
): {
  data: string
  isPending: boolean
  error: Error | null
}
export default function useBalance(
  protocol: Protocol,
  _tokenId?: string
): {
  data: string
  isPending: boolean
  error: Error | null
} {
  const { client } = useLaserEyes(({ client }) => ({ client }))

  const fetchBalance = async () => {
    if (protocol === 'btc') {
      const balance = await client?.getBalance()
      if (!balance) {
        throw new Error('Balance not found')
      }
      if (typeof balance === 'number') {
        return balance.toFixed(8)
      } else {
        return balance.toString()
      }
    } else {
      if (!_tokenId) {
        throw new Error('Token ID is required')
      }
      // TODO: Implement balance fetching for other protocols
    }
  }

  const { data, isPending, error } = useQuery({
    queryKey: ['user-balance', protocol, _tokenId],
    queryFn: fetchBalance,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // 1 minute
  })

  return {
    data: data || '0',
    isPending,
    error,
  }
}
