'use client'

import type { Connector } from '@omnisat/lasereyes-core'
import { useAccount, useConnect, useDisconnect } from '@omnisat/lasereyes-react'
import clsx from 'clsx'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const buttonClass =
  'text-xl bg-primary flex flex-row gap-2 border border-[#3c393f] bg-[#1e1d1f] hover:bg-[#3c393f] hover:text-white hover:border-black'

const WalletConnectButton = ({ connector }: { connector: Connector }) => {
  const account = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [, setError] = useState<string | null>(null)

  const isConnected =
    account.status === 'connected' && account.connector?.id === connector.id
  const isReady = connector.isReady()

  const handleClick = async () => {
    try {
      if (isConnected) {
        disconnect()
        return
      }
      await connect(connector.id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={(!isReady && !isConnected) || isPending}
      className={clsx(
        buttonClass,
        'text-md',
        isConnected ? 'border-orange-500 text-orange-400' : '',
        !isReady && !isConnected ? 'opacity-50' : ''
      )}
      variant="outline"
      size="lg"
    >
      {connector.icon && (
        // biome-ignore lint/a11y/useAltText: decorative wallet icon
        <img src={connector.icon} alt="" className="h-6 w-6" />
      )}
      {isConnected ? 'Disconnect' : connector.name}
    </Button>
  )
}

export default WalletConnectButton
