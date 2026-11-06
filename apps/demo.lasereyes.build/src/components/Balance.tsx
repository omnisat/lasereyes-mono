import { useAccount, useBalance } from '@omnisat/lasereyes-react'
import { clsx } from 'clsx'
import { RxReload } from 'react-icons/rx'
import { satoshisToBTC } from '@/lib/btc'

export default function Balance() {
  const account = useAccount()
  const isConnected = account.status === 'connected'
  const { data: balance, error, refetch, isFetching } = useBalance()

  const totalBtc = balance !== undefined ? satoshisToBTC(Number(balance)) : '--'

  return (
    <div className="flex flex-col items-center">
      <span className="font-black text-orange-400">balance</span>
      <span
        className={clsx(
          'text-lg flex flex-row gap-2 items-center justify-center',
          isConnected ? 'text-white' : 'text-gray-500'
        )}
      >
        {totalBtc} BTC{' '}
        <RxReload
          className={clsx('cursor-pointer text-gray-600', isFetching && 'animate-spin')}
          onClick={() => refetch()}
        />
      </span>
      {error && (
        <span className="text-red-500 text-xs mt-1 text-center font-normal">{error.message}</span>
      )}
    </div>
  )
}

