'use client'

import {
  MAGIC_EDEN,
  MAINNET,
  OKX,
  OYL,
  PHANTOM,
  TESTNET,
  UNISAT,
  WIZZ,
  XVERSE,
  LEATHER,
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  SIGNET,
  TESTNET4,
  ORANGE,
  useLaserEyes,
  WalletIcon,
  OP_NET,
  ProviderType,
} from '@omnisat/lasereyes'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPsbt } from '@/lib/btc'
import { getMempoolSpaceUrl } from '@/lib/urls'
import { clsx } from 'clsx'
import axios from 'axios'
import Link from 'next/link'
import { ImNewTab } from 'react-icons/im'
import { cn } from '@/lib/utils'
import { useUtxos } from '@/hooks/useUtxos'
import { Input } from '@/components/ui/input'

const WalletCard = ({
  wallet,
  setSignature,
  unsignedPsbt,
  setUnsignedPsbt,
  setSignedPsbt,
}: {
  wallet: {
    name: ProviderType
    url: string
  }
  setSignature: (signature: string) => void
  unsignedPsbt: string | undefined
  setUnsignedPsbt: (psbt: string) => void
  setSignedPsbt: (
    psbt:
      | {
          signedPsbtHex: string
          signedPsbtBase64: string
          txId?: string
        }
      | undefined
  ) => void
}) => {
  const walletName = wallet.name
  const {
    isInitializing,
    connect,
    disconnect,
    address,
    connected,
    provider,
    network,
    paymentAddress,
    paymentPublicKey,
    balance,
    hasUnisat,
    hasXverse,
    hasOyl,
    hasMagicEden,
    hasOkx,
    hasLeather,
    hasPhantom,
    hasWizz,
    hasOrange,
    hasOpNet,
    sendBTC,
    signMessage,
    signPsbt,
    inscribe,
    pushPsbt,
    switchNetwork,
  } = useLaserEyes()

  const [hasError, setHasError] = useState(false)
  const hasRun = useRef(false)

  const [finalize, setFinalize] = useState<boolean>(false)
  const [broadcast, setBroadcast] = useState<boolean>(false)
  const [unsigned, setUnsigned] = useState<string | undefined>()
  const [signed, setSigned] = useState<string | undefined>()

  const [inscriptionText, setInscriptionText] = useState<string>(
    'Inscribed 100% clientside with Laser Eyes'
  )

  const hasWallet = {
    unisat: hasUnisat,
    xverse: hasXverse,
    oyl: hasOyl,
    [MAGIC_EDEN]: hasMagicEden,
    okx: hasOkx,
    op_net: hasOpNet,
    leather: hasLeather,
    phantom: hasPhantom,
    wizz: hasWizz,
    orange: hasOrange,
  }

  const isConnected = provider === walletName
  const isMissingWallet = !hasWallet[walletName]

  const { utxos } = useUtxos()

  useEffect(() => {
    if (
      utxos.length > 0 &&
      connected &&
      isConnected &&
      !hasRun.current &&
      !hasError
    ) {
      hasRun.current = true
      createPsbt(
        utxos,
        paymentAddress,
        paymentPublicKey,
        network as
          | typeof MAINNET
          | typeof TESTNET
          | typeof TESTNET4
          | typeof SIGNET
          | typeof FRACTAL_MAINNET
          | typeof FRACTAL_TESTNET
      )
        .then((psbt) => {
          if (psbt && psbt.toHex() !== unsigned) {
            setUnsignedPsbt(psbt.toHex())
            setUnsigned(psbt.toHex())
            setSigned(undefined)
            setSignedPsbt(undefined)
          }
        })
        .catch((e) => {
          setHasError(true)
          toast.error(e.message)
        })
    }
  }, [
    utxos,
    balance,
    network,
    connected,
    isConnected,
    hasError,
    paymentAddress,
    paymentPublicKey,
    unsigned,
    setUnsignedPsbt,
    setSignedPsbt,
  ])

  useEffect(() => {
    setUnsigned(undefined)
  }, [network])

  const send = async () => {
    try {
      if (balance! < 1500) {
        throw new Error('Insufficient funds')
      }

      const txid = await sendBTC(paymentAddress, 1500)
      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target={'_blank'}
            href={`${getMempoolSpaceUrl(network as typeof MAINNET | typeof TESTNET)}/tx/${txid}`}
            className={'underline text-blue-600 text-xs'}
          >
            {txid}
          </a>
        </span>
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

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

  const sign = async (message: string) => {
    setSignature('')
    try {
      const signature = await signMessage(message, address)
      setSignature(signature)
      const response = await axios
        .post('/api/authorize', { message, signature, address })
        .then((res) => res.data)
      if (typeof signature === 'string') {
        toast.success(
          <div className={'flex flex-col gap-2 items-center'}>
            <span className={'font-black'}>signed message</span>{' '}
            <div className={'text-xs'}>{signature}</div>
            {response?.token && (
              <div className={'flex flex-col gap-2 items-center'}>
                <span className={'font-black'}>issued token from api</span>{' '}
                <div className={'text-xs'}>{response?.token}</div>
                <Link
                  href={
                    'https://github.com/omnisat/lasereyes/blob/main/example/app/api/authorize/route.ts#L20'
                  }
                  target={'_blank'}
                  className={
                    'flex flex-row gap-2 text-gray-600 text-center font-black hover:text-orange-400 items-center justify-center'
                  }
                >
                  How does this work? <br /> Click here to view the source{' '}
                  <ImNewTab size={20} />
                </Link>
              </div>
            )}
          </div>
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const signUnsignedPsbt = async () => {
    try {
      if (!unsigned) {
        throw new Error('No unsigned PSBT')
      }

      if (broadcast && balance! < 1500) {
        throw new Error('Insufficient funds')
      }

      const signPsbtResponse = await signPsbt(
        unsignedPsbt!,
        finalize,
        broadcast
      )

      // @ts-ignore
      setSigned(signPsbtResponse?.signedPsbtHex)
      if (!signPsbtResponse) {
        throw new Error('Failed to sign PSBT')
      }

      //@ts-ignore
      setSignedPsbt(signPsbtResponse)

      console.log(signPsbtResponse)

      if (
        typeof signPsbtResponse.signedPsbtHex === 'string' &&
        !signPsbtResponse.txId
      ) {
        toast.success(
          <div className={'flex flex-col gap-2 items-center'}>
            <span className={'font-black'}>
              signed {finalize ? '& finalized' : ''} PSBT
            </span>{' '}
            <div className={'text-xs'}>{signPsbtResponse.signedPsbtHex}</div>
          </div>
        )
        return
      }

      // @ts-ignore
      if (typeof signPsbtResponse.txId === 'string') {
        setUnsigned(undefined)
        setSignedPsbt(undefined)
        toast.success(
          <span className={'flex flex-col gap-1 items-center justify-center'}>
            <span className={'font-black'}>View on mempool.space</span>
            <a
              target={'_blank'}
              // @ts-ignore
              href={`${getMempoolSpaceUrl(network as typeof MAINNET | typeof TESTNET)}/tx/${signPsbtResponse?.txId}`}
              className={'underline text-blue-600 text-xs'}
            >
              {/*@ts-ignore*/}
              {signPsbtResponse?.txId}
            </a>
          </span>
        )
        return
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const push = async () => {
    try {
      if (!signed) {
        throw new Error('No signed PSBT')
      }
      const txid = await pushPsbt(signed)
      setUnsigned(undefined)
      setSignedPsbt(undefined)
      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target={'_blank'}
            href={`${getMempoolSpaceUrl(network as typeof MAINNET | typeof TESTNET)}/tx/${txid}`}
            className={'underline text-blue-600 text-xs'}
          >
            {txid}
          </a>
        </span>
      )
    } catch (error) {
      setSignedPsbt(undefined)
      // @ts-ignore
      if (error?.message!) {
        // @ts-ignore
        toast.error(error.message!)
      }
    }
  }

  const switchNet = async (desiredNetwork: typeof MAINNET | typeof TESTNET) => {
    try {
      await switchNetwork(desiredNetwork)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const inscribeWithWallet = useCallback(async () => {
    try {
      const inscriptionTxId = await inscribe(
        Buffer.from(inscriptionText).toString('base64'),
        'text/plain'
      )
      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target={'_blank'}
            href={`${getMempoolSpaceUrl(network as typeof MAINNET | typeof TESTNET)}/tx/${inscriptionTxId}`}
            className={'underline text-blue-600 text-xs'}
          >
            {inscriptionTxId}
          </a>
        </span>
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }, [inscribe, inscriptionText, network])

  return (
    <Card
      className={
        'grow max-w-[346px] w-[346px] shadow-xl bg-[#323035] text-[#a7a7a8] border-[#3c393f]'
      }
    >
      <CardHeader>
        <CardTitle
          className={
            'uppercase text-white text-center flex flex-row items-center justify-center gap-2'
          }
        >
          <WalletIcon walletName={walletName} size={42} />
          {walletName.replace('-', ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={'flex flex-col gap-4'}>
          <div className={'flex flex-row space-between items-center gap-6'}>
            <Badge
              variant={isConnected ? 'success' : 'outline'}
              className={cn(
                'text-gray-500 border-gray-500',
                isConnected ? 'text-white ' : ''
              )}
            >
              {isConnected ? 'connected' : 'disconnected'}
            </Badge>
            {isMissingWallet ? (
              <Link
                href={wallet.url}
                target={'_blank'}
                className={
                  'flex flex-row gap-2 items-center w-full justify-center'
                }
              >
                <Button
                  className={
                    'w-full bg-[#232225] flex flex-row gap-2 items-center'
                  }
                  variant={'default'}
                >
                  Download <ImNewTab />
                </Button>
              </Link>
            ) : (
              <Button
                className={'w-full bg-[#232225] '}
                disabled={isMissingWallet}
                variant={'default'}
                onClick={() =>
                  isConnected ? disconnect() : connectWallet(walletName)
                }
              >
                {isInitializing
                  ? 'initializing..'
                  : isMissingWallet
                    ? 'missing wallet'
                    : isConnected
                      ? 'disconnect'
                      : 'connect'}
              </Button>
            )}
          </div>

          <div className={'flex flex-col space-between items-center gap-2'}>
            <Button
              className={'w-full bg-[#232225]'}
              disabled={isMissingWallet || !isConnected}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={() =>
                !isConnected
                  ? null
                  : switchNet(network === TESTNET ? MAINNET : TESTNET)
              }
            >
              switch network
            </Button>
            <Button
              className={'w-full bg-[#232225]'}
              disabled={isMissingWallet || !isConnected}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={() => (!isConnected ? null : send())}
            >
              send BTC
            </Button>
            <Button
              className={'w-full bg-[#232225]'}
              disabled={isMissingWallet || !isConnected}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={() =>
                !isConnected
                  ? null
                  : sign('Laser Eyes - Test Message').then(console.log)
              }
            >
              sign message
            </Button>
            <span
              className={
                'w-full flex flex-row items-center justify-center gap-4'
              }
            >
              <Button
                className={'w-full bg-[#232225] disabled:text-[#737275]'}
                disabled={isMissingWallet || !isConnected || !unsigned}
                variant={!isConnected ? 'secondary' : 'default'}
                onClick={() => (!isConnected ? null : signUnsignedPsbt())}
              >
                sign{broadcast ? ' & Send' : ''} PSBT
              </Button>
              <Button
                className={clsx(
                  'shrink bg-[#232225] disabled:text-gray-500',
                  finalize ? 'text-white' : 'bg-[#232225]'
                )}
                disabled={isMissingWallet || !isConnected || !unsigned}
                variant={finalize ? 'outline' : 'default'}
                onClick={() => {
                  setFinalize(!finalize)
                  setBroadcast(false)
                }}
              >
                finalize
              </Button>
              <Button
                className={clsx(
                  finalize || provider !== UNISAT ? 'text-white' : '',
                  'shrink disabled:text-gray-500 disabled ',
                  broadcast ? 'text-orange-500' : 'bg-[#232225]'
                )}
                disabled={
                  isMissingWallet ||
                  !isConnected ||
                  (!finalize && provider !== XVERSE) ||
                  !unsigned
                }
                variant={broadcast ? 'ghost' : 'ghost'}
                onClick={() => setBroadcast(!broadcast)}
              >
                broadcast
              </Button>
            </span>

            <Button
              className={'w-full bg-[#232225] disabled:text-[#737275]'}
              disabled={isMissingWallet || !isConnected || !signed || !unsigned}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={() => (!isConnected ? null : push())}
            >
              push PSBT
            </Button>
            <div className={'border-b border-2 border-[#232225] w-full my-2'} />
            <Input
              className={cn(
                'w-full bg-[#232225] border-none disabled:text-[#737275] text-center',
                ''
              )}
              placeholder={'Inscribe some text...'}
              value={inscriptionText}
              disabled={isMissingWallet || !isConnected}
              onChange={(e) => setInscriptionText(e.target.value)}
            />
            <Button
              className={'w-full bg-[#232225] disabled:text-[#737275]'}
              disabled={isMissingWallet || !isConnected}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={() => (!isConnected ? null : inscribeWithWallet())}
            >
              inscribe
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default WalletCard
