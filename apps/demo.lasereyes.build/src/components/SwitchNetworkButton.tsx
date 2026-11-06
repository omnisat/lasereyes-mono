import { useAccount, useNetwork } from '@omnisat/lasereyes-react'
import { Recycle } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

export default function SwitchNetworkButton() {
  const account = useAccount()
  const isConnected = account.status === 'connected'
  const { network, switchNetwork } = useNetwork()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSwitch = () => {
    setError(null)
    setIsPending(true)
    const desired = network === 'testnet' ? 'mainnet' : 'testnet'
    void switchNetwork(desired)
      .catch(err => {
        if (err instanceof Error) setError(err.message)
        else setError('Failed to switch network')
      })
      .finally(() => {
        setIsPending(false)
      })
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Button
        className="w-full gap-2 bg-[#232225]"
        disabled={!isConnected || isPending}
        variant={!isConnected ? 'secondary' : 'default'}
        onClick={handleSwitch}
        size="lg"
      >
        <Recycle size={14} className={isPending ? 'animate-spin' : ''} />
        {isPending ? 'switching...' : 'switch network'}
      </Button>
      {error && (
        <span className="text-red-500 text-xs mt-1 text-center font-normal">{error}</span>
      )}
    </div>
  )
}
