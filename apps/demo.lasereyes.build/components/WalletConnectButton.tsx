'use client'

import {
  type BINANCE,
  type LEATHER,
  MAGIC_EDEN,
  type OKX,
  type OP_NET,
  type ORANGE,
  type OYL,
  type PHANTOM,
  type ProviderType,
  type TOKEO,
  type UNISAT,
  useLaserEyes,
  // SPARROW,
  WalletIcon,
  type WIZZ,
  type XVERSE,
} from '@omnisat/lasereyes'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'
import { ImNewTab } from 'react-icons/im'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const WalletConnectButton = ({
  wallet,
}: {
  wallet: {
    name: ProviderType
    url: string
  }
}) => {
  const walletName = wallet.name
  const {
    connect,
    disconnect,
    provider,
    hasUnisat,
    hasXverse,
    hasOyl,
    hasMagicEden,
    hasOkx,
    hasLeather,
    hasPhantom,
    hasWizz,
    hasSparrow,
    hasOrange,
    hasTokeo,
    hasOpNet,
    hasKeplr,
    hasBinance,
  } = useLaserEyes()

  const hasWallet = {
    unisat: hasUnisat,
    xverse: hasXverse,
    oyl: hasOyl,
    [MAGIC_EDEN]: hasMagicEden,
    okx: hasOkx,
    sparrow: hasSparrow,
    op_net: hasOpNet,
    leather: hasLeather,
    phantom: hasPhantom,
    wizz: hasWizz,
    orange: hasOrange,
    tokeo: hasTokeo,
    keplr: hasKeplr,
    binance: hasBinance,
  }

  const [error, setError] = useState<string | null>(null)

  const isConnected = provider === walletName
  const isMissingWallet = !hasWallet[walletName]
  // const isSparrow = wallet.name === SPARROW

  const connectWallet = async (
    walletName:
      | typeof UNISAT
      | typeof XVERSE
      | typeof OYL
      | typeof MAGIC_EDEN
      | typeof OKX
      | typeof OP_NET
      | typeof LEATHER
      | typeof PHANTOM
      | typeof WIZZ
      | typeof ORANGE
      | typeof TOKEO
      | typeof BINANCE
  ) => {
    try {
      await connect(walletName)
    } catch (error) {
      console.log('error!', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  type WalletProvders =
    | typeof UNISAT
    | typeof XVERSE
    | typeof OYL
    | typeof MAGIC_EDEN
    | typeof OKX
    | typeof OP_NET
    | typeof LEATHER
    | typeof PHANTOM
    | typeof WIZZ
    | typeof ORANGE

  const buttonClass =
    'text-xl bg-primary flex flex-row gap-2 border border-[#3c393f] bg-[#1e1d1f] hover:bg-[#3c393f] hover:text-white hover:border-black'

  if (isMissingWallet) {
    return (
      <Link href={wallet.url} target="_blank">
        <Button
          onClick={() => connectWallet(walletName as WalletProvders)}
          className={clsx(buttonClass, 'text-md opacity-50 hover:opacity-100')}
          variant="outline"
          size="lg"
        >
          <WalletIcon walletName={wallet.name} size={24} /> Download {wallet.name}
          <ImNewTab />
        </Button>
      </Link>
    )
  }

  const disconnectWallet = () => {
    // @ts-expect-error
    disconnect()
  }

  if (isConnected) {
    return (
      <Button
        onClick={disconnectWallet}
        className={clsx(
          buttonClass,
          'text-md text-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600'
        )}
        variant="outline"
        size="lg"
      >
        {provider && <WalletIcon walletName={wallet.name} size={24} />} Disconnect {wallet.name}
      </Button>
    )
  }

  return (
    <Button
      onClick={() => connectWallet(walletName as WalletProvders)}
      className={buttonClass}
      variant="outline"
      size="lg"
    >
      {error && <div className="text-red-500">{error}</div>}
      <WalletIcon walletName={wallet.name} size={24} />
      {wallet.name}
    </Button>
  )
}

export default WalletConnectButton
