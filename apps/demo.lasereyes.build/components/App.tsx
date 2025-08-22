'use client'
import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  OYLNET,
  type NetworkType,
  type ProviderType,
  SIGNET,
  SUPPORTED_WALLETS,
  TESTNET,
  TESTNET4,
  LaserEyesLogo,
  useLaserEyes,
  WalletIcon,
  MAGIC_EDEN,
  XVERSE,
  UNISAT,
  BaseNetwork,
} from '@kevinoyl/lasereyes'
import { createPsbt, satoshisToBTC } from '@/lib/btc'
import { cn, truncateString } from '@/lib/utils'
import ClickToCopy from '@/components/ClickToCopy'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { getPackageVersion } from '@/lib/github'
import { badgeVariants } from '@/components/ui/badge'
import { FaBroadcastTower, FaExternalLinkAlt } from 'react-icons/fa'
import { RxReload } from 'react-icons/rx'
import { ClickToCopyNpmInstallPill } from '@/components/ClickToCopyNpmInstallPill'
import { ImCheckmark, ImNewTab } from 'react-icons/im'
import { toast } from 'sonner'
import { useUtxos } from '@/hooks/useUtxos'
import WalletConnectButton from './WalletConnectButton'
import { Button } from './ui/button'
import { getMempoolSpaceUrl } from '@/lib/urls'
import axios from 'axios'
import { Pencil, Recycle, SendIcon, Upload } from 'lucide-react'
import { FaSignature } from 'react-icons/fa6'
import InscriptionsSection from './InscriptionsSection'
import RunesSection from './RunesSection'
import BRC20Section from './Brc20Section'

import AlkanesSection from './AlkanesSection'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type colorsType =
  | 'orange'
  | 'pink'
  | 'blue'
  | 'darkBlue'
  | 'yellow'
  | 'green'
  | 'purple'
  | 'red'
const colors = ['orange', 'pink', 'blue', 'darkBlue', 'yellow'] as colorsType[]

const App = ({ setNetwork }: { setNetwork: (n: NetworkType) => void }) => {
  const [pkgVersion, setPkgVersion] = useState<string | undefined>()
  const [signature, setSignature] = useState<string>('')
  const [unsignedPsbt, setUnsignedPsbt] = useState<string | undefined>()
  const [signedPsbt, setSignedPsbt] = useState<
    | string
    | {
      signedPsbtHex: string
      signedPsbtBase64: string
    }
    | undefined
  >()
  const [selectedColor,] = useState<colorsType>(
    colors[Math.floor(Math.random() * 5)]
  )

  const [hasError, setHasError] = useState(false)
  const hasRun = useRef(false)

  const [finalize, setFinalize] = useState<boolean>(false)
  const [broadcast, setBroadcast] = useState<boolean>(false)
  const [unsigned, setUnsigned] = useState<string | undefined>()
  const [signed, setSigned] = useState<string | undefined>()

  const { utxos } = useUtxos()

  const {
    address,
    provider,
    network,
    paymentAddress,
    paymentPublicKey,
    getBalance,
    pushPsbt,
    publicKey,
    signPsbt,
    balance,
    switchNetwork,
    hasUnisat,
    signMessage,
    hasXverse,
    sendBTC,
    hasOyl,
    hasMagicEden,
    hasOkx,
    hasLeather,
    hasPhantom,
    hasWizz,
    hasSparrow,
    hasOrange,
    hasOpNet,
    hasTokeo,
    hasKeplr,
  } = useLaserEyes()

  useEffect(() => {
    getPackageVersion().then((version) => {
      setPkgVersion(version)
    })
  }, [])

  useEffect(() => {
    address
    setSignature('')
    setUnsignedPsbt(undefined)
    setSignedPsbt(undefined)
  }, [address])

  useEffect(() => {
    if (provider && utxos.length > 0 && !hasRun.current && !hasError) {
      hasRun.current = true
      createPsbt(utxos, paymentAddress, paymentPublicKey, network)
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
    provider,
    network,
    hasError,
    paymentAddress,
    paymentPublicKey,
    unsigned,
  ])

  useEffect(() => {
    setUnsigned(undefined)
  }, [network])

  // Removed effects for fetching runes, brc20s, and inscriptions
  // as they are now handled in their respective components

  const hasWallet = {
    unisat: hasUnisat,
    xverse: hasXverse,
    oyl: hasOyl,
    [MAGIC_EDEN]: hasMagicEden,
    okx: hasOkx,
    sparrow: hasSparrow,
    op_net: hasOpNet,
    leather: hasLeather,
    tokeo: hasTokeo,
    phantom: hasPhantom,
    wizz: hasWizz,
    orange: hasOrange,
    keplr: hasKeplr,
  }

  // @ts-ignore
  const total = satoshisToBTC(balance)

  const switchNet = async (desiredNetwork: NetworkType) => {
    try {
      await switchNetwork(desiredNetwork)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const sendBtc = async () => {
    try {
      if (!balance || balance < 1500) {
        throw new Error('Insufficient funds')
      }

      const txid = await sendBTC(paymentAddress, 1500)
      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            rel="noreferrer"
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
      if (!unsigned || !unsignedPsbt) {
        throw new Error('No unsigned PSBT')
      }

      if (broadcast && (!balance || balance < 1500)) {
        throw new Error('Insufficient funds')
      }

      const signPsbtResponse = await signPsbt({
        tx: unsignedPsbt,
        finalize,
        broadcast,
      })

      // @ts-ignore
      setSigned(signPsbtResponse?.signedPsbtHex)
      if (!signPsbtResponse) {
        throw new Error('Failed to sign PSBT')
      }

      //@ts-ignore
      setSignedPsbt(signPsbtResponse)

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
              rel="noreferrer"
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
            rel="noreferrer"
            href={`${getMempoolSpaceUrl(network as typeof MAINNET | typeof TESTNET)}/tx/${txid}`}
            className={'underline text-blue-600 text-xs'}
          >
            {txid}
          </a>
        </span>
      )
    } catch (error) {
      setSignedPsbt(undefined)
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  // Render the updated UI with our modular components
  return (
    <div
      className={
        'flex flex-col gap-4 w-full mt-12 mb-24 max-w-[1200px] px-4 md:px-12 font-windows'
      }
    >
      {/* Header section with logo and links */}
      <div
        className={
          'w-full flex gap-2 flex-col md:flex-row justify-center items-center'
        }
      >
        <Image
          src={
            address ? '/lasereyes_connected.svg' : '/lasereyes_disconnected.svg'
          }
          className={'w-auto h-auto'}
          priority
          alt={address ? 'Laser Eyes Connected' : 'Laser Eyes Disconnected'}
          width={300}
          height={47}
        />
        <Link
          className={cn(
            badgeVariants({ variant: 'outline' }),
            'self-end mb-1.5 text-orange-400 border-orange-500 hover:border-white hover:bg-white hover:text-black transition-all text-md'
          )}
          href={'https://github.com/omnisat/lasereyes-mono'}
          target={'_blank'}
        >
          {pkgVersion ? `v ${pkgVersion}` : '--'}
        </Link>

        <div className={'grow'} />
        <ClickToCopyNpmInstallPill className={'mr-6'} />
        <Link
          href={'https://www.lasereyes.build/docs/getting-started'}
          target={'_blank'}
          className={
            'self-end font-windows text-white flex flex-row gap-2 items-center hover:text-orange-400 transition-all'
          }
        >
          docs
          <ImNewTab />
        </Link>
        <Link
          href={'https://github.com/omnisat/lasereyes/tree/main/example'}
          target={'_blank'}
          className={
            'self-end font-windows text-white flex flex-row gap-2 items-center hover:text-orange-400 transition-all'
          }
        >
          view source
          <ImNewTab />
        </Link>
      </div>

      {/* Wallet connection section */}
      <div className={'flex items-center justify-center flex-col gap-4'}>
        <div className="text-orange-400 text-xl">supported wallets:</div>
        <div className={'flex flex-wrap justify-center gap-3'}>
          {Object.values(SUPPORTED_WALLETS)
            .sort(
              (a, b) => Number(hasWallet[b.name]) - Number(hasWallet[a.name])
            )
            .map((walletInfo: { name: ProviderType; url: string }) => (
              <WalletConnectButton wallet={walletInfo} key={walletInfo.name} />
            ))}
        </div>
        {/* <ConnectWalletButton /> */}
      </div>

      {/* Main container */}
      <div className={'border border-[#3c393f] w-full text-xl'}>
        <div className="flex justify-end">
          {/* Network selector */}
          <Select onValueChange={switchNet} value={network}>
            <SelectTrigger>
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent className="h-[268px]">
              {Object.entries(BaseNetwork).map(([key, value]) => (
                <SelectItem key={key} value={value} className="h-8">
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Wallet information */}
        <div
          className={'flex flex-col gap-2 text-center items-center break-all'}
        >
          {/* Provider info */}
          <div
            className={
              'flex flex-col md:flex-row items-center gap-4 justify-center space-around'
            }
          >
            <div className={'flex flex-col items-center'}>
              <span className={clsx('font-black text-orange-400')}>
                Provider
              </span>
              <span
                className={clsx(
                  'text-lg flex flex-row gap-2 items-center justify-center',
                  provider ? 'text-white' : 'text-gray-500'
                )}
              >
                {provider && <WalletIcon walletName={provider} size={24} />}{' '}
                {provider ? provider : '--'}
              </span>
            </div>
          </div>

          {/* Address section */}
          <div
            className={
              'flex flex-col md:flex-row items-center gap-6 justify-center space-around'
            }
          >
            <div className={'flex flex-row gap-2'}>
              <div className={'flex flex-col items-center'}>
                <span
                  className={clsx('font-black text-orange-400 justify-center')}
                >
                  address (taproot)
                </span>
                <span
                  className={clsx(
                    'text-lg flex flex-row gap-2 items-center justify-center',
                    address?.length > 0 ? 'text-white' : 'text-gray-500'
                  )}
                >
                  {address?.length > 0 && (
                    <span className={'flex flex-row gap-4'}>
                      <Link
                        href={`https://mempool.space/address/${address}`}
                        target={'_blank'}
                        className={'flex flex-row items-center gap-1'}
                      >
                        <FaExternalLinkAlt className="h-3 w-3 text-gray-500" />
                      </Link>
                      <ClickToCopy value={address as string} />
                    </span>
                  )}
                  {address?.length > 0 ? truncateString(address, 24) : '--'}
                </span>
              </div>
            </div>

            {/* Payment address section */}
            <div
              className={
                'flex flex-col md:flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-400')}>
                  payment address
                </span>
                <span
                  className={clsx(
                    'text-lg flex flex-row gap-2 items-center justify-center',
                    paymentAddress?.length > 0 ? 'text-white' : 'text-gray-500'
                  )}
                >
                  {paymentAddress?.length > 0
                    ? truncateString(paymentAddress, 24)
                    : '--'}
                  {paymentAddress?.length > 0 && (
                    <span className={'flex flex-row gap-4'}>
                      <ClickToCopy value={paymentAddress as string} />
                      <Link
                        href={`https://mempool.space/address/${paymentAddress}`}
                        target={'_blank'}
                        className={'flex flex-row items-center gap-1'}
                      >
                        <FaExternalLinkAlt className="h-3 w-3 text-gray-500" />
                      </Link>
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Public keys section */}
          <div className={'flex flex-col md:flex-row gap-6'}>
            <div
              className={
                'flex flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-400')}>
                  public key
                </span>
                <span
                  className={clsx(
                    'text-lg flex flex-row gap-2 items-center justify-center',
                    publicKey?.length > 0 ? 'text-white' : 'text-gray-500'
                  )}
                >
                  {publicKey?.length > 0 && (
                    <ClickToCopy value={publicKey as string} />
                  )}
                  {publicKey?.length > 0 ? truncateString(publicKey, 24) : '--'}
                </span>
              </div>
            </div>
            <div
              className={
                'flex flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-400')}>
                  payment public key
                </span>
                <span
                  className={clsx(
                    'text-lg flex flex-row gap-2 items-center justify-center',
                    paymentPublicKey?.length > 0
                      ? 'text-white'
                      : 'text-gray-500'
                  )}
                >
                  {paymentPublicKey?.length > 0
                    ? truncateString(paymentPublicKey, 24)
                    : '--'}
                  {paymentPublicKey?.length > 0 && (
                    <ClickToCopy value={paymentPublicKey as string} />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div
            className={
              'flex flex-col md:flex-row items-center gap-4 justify-center space-around'
            }
          >
            <div className={'flex flex-col items-center'}>
              <span className={clsx('font-black text-orange-400')}>
                balance
              </span>
              <span
                className={clsx(
                  'text-lg flex flex-row gap-2 items-center justify-center',
                  publicKey?.length > 0 ? 'text-white' : 'text-gray-500'
                )}
              >
                {balance !== undefined ? total : '--'} BTC{' '}
                <RxReload
                  className={'cursor-pointer text-gray-600'}
                  onClick={getBalance}
                />
              </span>
            </div>
          </div>

          {/* Signature */}
          <div className={'flex flex-col items-center'}>
            <span className={clsx('font-black text-orange-400')}>
              signature
            </span>{' '}
            <span
              className={clsx(
                'text-md flex flex-row gap-2 items-center justify-center',
                signature?.length > 0 ? 'text-white' : 'text-gray-500'
              )}
            >
              {signature?.length > 0 ? truncateString(signature, 24) : '--'}{' '}
              {signature?.length > 0 && (
                <ClickToCopy value={signature as string} />
              )}
            </span>
          </div>

          {/* PSBT section */}
          <div
            className={
              'flex flex-col md:flex-row items-center gap-6 justify-center space-around'
            }
          >
            <div
              className={
                'flex flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-400')}>
                  unsigned Psbt
                </span>
                <span
                  className={clsx(
                    'text-lg flex flex-row gap-2 items-center justify-center',
                    unsignedPsbt ? 'text-white' : 'text-gray-500'
                  )}
                >
                  {unsignedPsbt && (
                    <ClickToCopy value={unsignedPsbt as string} />
                  )}
                  <Input
                    type="text"
                    className={'bg-transparent text-lg text-center border-none'}
                    placeholder="Tx Hex"
                    value={unsignedPsbt ? unsignedPsbt : '--'}
                    onChange={(e) => {
                      setUnsigned(e.target.value)
                      setUnsignedPsbt(e.target.value)
                    }}
                  />
                </span>
              </div>
            </div>

            <div
              className={
                'flex flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-400')}>
                  signed Psbt
                </span>
                <span
                  className={clsx(
                    'text-lg flex flex-row gap-2 items-center justify-center',
                    // @ts-ignore
                    signedPsbt?.signedPsbtHex ? 'text-white' : 'text-gray-500'
                  )}
                >
                  {truncateString(
                    // @ts-ignore
                    signedPsbt?.signedPsbtHex ? signedPsbt.signedPsbtHex : '--',
                    24
                  )}
                  {/*@ts-ignore*/}
                  {signedPsbt?.signedPsbtHex && (
                    //@ts-ignore
                    <ClickToCopy value={signedPsbt?.signedPsbtHex as string} />
                  )}
                </span>
              </div>
            </div>
          </div>

          <br />

          {/* Bitcoin section */}
          <div className="text-md text-orange-400">bitcoin</div>
          <div className={'flex flex-col md:flex-row text-xl gap-2'}>
            <Button
              className={'w-full gap-2 bg-[#232225]'}
              disabled={!provider}
              variant={!provider ? 'secondary' : 'default'}
              onClick={() =>
                !provider
                  ? null
                  : switchNet(network === TESTNET ? MAINNET : TESTNET)
              }
              size={'lg'}
            >
              <Recycle size={14} />
              switch network
            </Button>
            <Button
              className={'w-full gap-2 bg-[#232225]'}
              disabled={!provider}
              variant={!provider ? 'secondary' : 'default'}
              onClick={() => (!provider ? null : sendBtc())}
              size={'lg'}
            >
              <SendIcon size={14} />
              send Btc
            </Button>
            <Button
              className={'w-full gap-2 bg-[#232225]'}
              disabled={!provider}
              variant={!provider ? 'secondary' : 'default'}
              onClick={() =>
                !provider
                  ? null
                  : sign('Laser Eyes - Test Message').then(console.log)
              }
              size={'lg'}
            >
              <Pencil size={14} />
              sign message
            </Button>
          </div>

          {/* PSBT Buttons */}
          <div className={'flex flex-col gap-2'}>
            <span
              className={
                'w-full flex flex-col md:flex-row px-2 py-1 items-center justify-center gap-2'
              }
            >
              <Button
                className={'w-full gap-2 bg-[#232225] disabled:text-[#737275]'}
                disabled={!provider || !unsigned}
                variant={!provider ? 'secondary' : 'default'}
                size={'lg'}
                onClick={() => (!provider ? null : signUnsignedPsbt())}
              >
                <FaSignature size={18} />
                sign{broadcast ? ' & Send' : ''} Psbt
              </Button>
              <Button
                className={clsx(
                  'shrink bg-[#232225] gap-2 disabled:text-gray-500',
                  finalize ? 'text-white border-gray-500' : 'bg-[#232225]'
                )}
                disabled={!provider || !unsigned}
                variant={finalize ? 'outline' : 'default'}
                size={'lg'}
                onClick={() => {
                  setFinalize(!finalize)
                  setBroadcast(false)
                }}
              >
                <ImCheckmark size={14} />
                finalize
              </Button>
              <Button
                className={clsx(
                  'gap-2',
                  finalize || provider !== UNISAT ? 'text-white' : '',
                  'shrink disabled:text-gray-500 disabled ',
                  broadcast ? 'text-orange-400' : 'bg-[#232225]'
                )}
                size={'lg'}
                disabled={
                  !provider || (!finalize && provider !== XVERSE) || !unsigned
                }
                variant={broadcast ? 'ghost' : 'ghost'}
                onClick={() => setBroadcast(!broadcast)}
              >
                <FaBroadcastTower size={16} />
                broadcast
              </Button>
            </span>

            <Button
              className={'w-full gap-2 bg-[#232225] disabled:text-[#737275]'}
              disabled={!provider || !unsigned || !signed}
              variant={!provider ? 'secondary' : 'default'}
              onClick={() => (!provider ? null : push())}
            >
              <Upload size={16} />
              push Psbt
            </Button>
          </div>

          <div className={'border-b border-2 border-[#232225] my-2'} />

          {/* Inscriptions Component */}
          <InscriptionsSection />

          <div className="flex md:flex-row flex-col gap-8">
            {/* Runes Component */}
            <RunesSection />
            <div className={'border-b border-2 border-[#232225] my-2'} />
            {/* BRC20 Component */}
            <BRC20Section />
            <div className={'border-b border-2 border-[#232225] my-2'} />
            {/* Alkanes Component */}
            <AlkanesSection />
          </div>
        </div>

        <div className={'flex flex-row items-center gap-4 '}>
          <LaserEyesLogo
            className={'m-4'}
            width={48}
            color={
              address ? ('green' as colorsType) : (selectedColor as colorsType)
            }
          />
          <div className={'grow'} />
        </div>
      </div>
    </div>
  )
}

export default App
