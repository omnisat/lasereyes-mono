import { useAccount, useBalance, useNetwork, useSendBitcoin } from '@omnisat/lasereyes-react'
import { SendIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import { getMempoolSpaceUrl } from '@/lib/urls'
import { truncateString } from '@/lib/utils'

export default function SendBitcoin() {
  const account = useAccount()
  const isConnected = account.status === 'connected'
  const paymentAddress = account.paymentAddress
  const { network } = useNetwork()
  const { data: balance } = useBalance()
  const {
    sendBitcoin,
    error: sendBtcError,
    isLoading: isSending,
    txId,
  } = useSendBitcoin()

  const [localError, setLocalError] = useState<string | null>(null)

  const handleSendBtc = () => {
    setLocalError(null)
    if (!paymentAddress) {
      setLocalError('Connect a wallet first')
      return
    }
    if (!balance || Number(balance) < 1500) {
      setLocalError('Insufficient funds')
      return
    }
    sendBitcoin({ to: paymentAddress, amount: 1500 })
  }

  const errorMessage = localError || sendBtcError?.message

  return (
    <div className="flex flex-col items-center w-full">
      <Button
        className="w-full gap-2 bg-[#232225]"
        disabled={!isConnected || isSending}
        variant={!isConnected ? 'secondary' : 'default'}
        onClick={handleSendBtc}
        size="lg"
      >
        <SendIcon size={14} />
        {isSending ? 'sending...' : 'send Btc'}
      </Button>

      {errorMessage && (
        <span className="text-red-500 text-xs mt-1 text-center font-normal">{errorMessage}</span>
      )}

      {txId && (
        <div className="flex flex-col items-center mt-1">
          <a
            rel="noreferrer"
            target="_blank"
            href={`${getMempoolSpaceUrl(network)}/tx/${txId}`}
            className="underline text-blue-600 text-xs"
          >
            tx: {truncateString(txId, 16)}
          </a>
        </div>
      )}
    </div>
  )
}
