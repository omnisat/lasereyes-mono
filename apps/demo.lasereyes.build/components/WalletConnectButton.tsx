
'use client'

import {
  MAGIC_EDEN,
  OKX,
  OYL,
  PHANTOM,
  UNISAT,
  WIZZ,
  XVERSE,
  LEATHER,
  ORANGE,
  useLaserEyes,
  OP_NET,
  ProviderType,
  SPARROW,
  WalletIcon,
} from '@omnisat/lasereyes'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ImNewTab } from 'react-icons/im'
import Link from 'next/link'
import clsx from 'clsx'

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
    hasOpNet,
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
  }

  const isConnected = provider === walletName
  const isMissingWallet = !hasWallet[walletName]
  const isSparrow = wallet.name === SPARROW

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
  ) => {
    try {
      // @ts-ignore
      await connect(walletName)
    } catch (error) {
      console.log('error!', error)
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  type WalletProvders = typeof UNISAT
    | typeof XVERSE
    | typeof OYL
    | typeof MAGIC_EDEN
    | typeof OKX
    | typeof OP_NET
    | typeof LEATHER
    | typeof PHANTOM
    | typeof WIZZ
    | typeof ORANGE

  const buttonClass = "text-xl bg-primary flex flex-row gap-2 border border-[#3c393f] bg-[#1e1d1f] hover:bg-[#3c393f] hover:text-white hover:border-black"

  if (isMissingWallet) {
    return (
      <Link href={wallet.url} target='_blank'>
        <Button
          onClick={() => connectWallet(walletName as WalletProvders)}
          className={
            clsx(
              buttonClass,
              "text-md opacity-50 hover:opacity-100",
            )
          }

          variant="outline"
          size="lg"
        >
          {provider && <WalletIcon walletName={wallet.name} size={24} />}{' '}
          Download {wallet.name}
          <ImNewTab />
        </Button>
      </Link>
    )
  }

  const disconnectWallet = () => {
    // @ts-ignore
    disconnect()
  }

  if (isConnected) {
    return (
      <Button
        onClick={disconnectWallet}
        className={
          clsx(
            buttonClass,
            "text-md text-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600",
          )
        }
        variant="outline"
        size="lg"
      >
        {provider && <WalletIcon walletName={wallet.name} size={24} />}{' '}
        Disconnect {wallet.name}
      </Button>
    )
  }


  return (
    <Button
      onClick={() => connectWallet(walletName as WalletProvders)}
      className={
        buttonClass
      }
      variant="outline"
      size="lg"
    >
      <WalletIcon walletName={wallet.name} size={24} />
      {wallet.name}
    </Button>
  )
}

export default WalletConnectButton
