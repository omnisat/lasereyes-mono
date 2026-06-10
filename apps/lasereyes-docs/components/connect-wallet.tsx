'use client'

import { useLaserEyes } from '@omnisat/lasereyes-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

interface ConnectWalletProps extends ComponentProps<typeof Button> {
  walletId: string
}

export function ConnectWallet({ walletId, ...props }: ConnectWalletProps) {
  const { connect, isConnecting, isConnected, connectedWallet } = useLaserEyes()

  const isThisWalletConnected = isConnected && connectedWallet?.id === walletId

  return (
    <Button
      onClick={() => connect(walletId)}
      disabled={isConnecting || isThisWalletConnected}
      {...props}
    >
      {isThisWalletConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect'}
    </Button>
  )
}
