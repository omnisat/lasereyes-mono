import { useAccount, useSignMessage } from '@omnisat/lasereyes-react'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import ClickToCopy from '@/components/ClickToCopy'
import { Button } from './ui/button'
import { truncateString } from '@/lib/utils'

export default function SignMessage() {
  const account = useAccount()
  const isConnected = account.status === 'connected'
  const address = account.address
  const {
    signMessage,
    data: signature,
    error: signError,
    isLoading,
  } = useSignMessage()

  const [localError, setLocalError] = useState<string | null>(null)

  const handleSign = () => {
    setLocalError(null)
    if (!address) {
      setLocalError('Connect a wallet first')
      return
    }
    signMessage({
      message: 'Laser Eyes - Test Message',
      options: { address },
    })
  }

  const errorMessage = localError || signError?.message

  return (
    <div className="flex flex-col items-center w-full">
      <Button
        className="w-full gap-2 bg-[#232225]"
        disabled={!isConnected || isLoading}
        variant={!isConnected ? 'secondary' : 'default'}
        onClick={handleSign}
        size="lg"
      >
        <Pencil size={14} />
        {isLoading ? 'signing...' : 'sign message'}
      </Button>

      {errorMessage && (
        <span className="text-red-500 text-xs mt-1 text-center font-normal">{errorMessage}</span>
      )}

      {signature && (
        <div className="flex flex-col items-center mt-1">
          <span className="text-xs text-white flex items-center gap-1">
            signed: {truncateString(signature, 16)}
            <ClickToCopy value={signature} />
          </span>
        </div>
      )}
    </div>
  )
}
