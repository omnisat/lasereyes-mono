'use client'
import {
  LaserEyesLogo,
  useAccount,
  useBalance,
  useBroadcastPsbt,
  useConnectors,
  useNetwork,
  useSendBitcoin,
  useSignMessage,
  useSignPsbt,
} from '@omnisat/lasereyes-react'
import { clsx } from 'clsx'
import { Pencil, Recycle, SendIcon, Upload } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FaBroadcastTower, FaExternalLinkAlt } from 'react-icons/fa'
import { FaSignature } from 'react-icons/fa6'
import { ImNewTab } from 'react-icons/im'
import { RxReload } from 'react-icons/rx'
import { toast } from 'sonner'
import ClickToCopy from '@/components/ClickToCopy'
import { ClickToCopyNpmInstallPill } from '@/components/ClickToCopyNpmInstallPill'
import { badgeVariants } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { satoshisToBTC } from '@/lib/btc'
import { getPackageVersion } from '@/lib/github'
import { getMempoolSpaceUrl } from '@/lib/urls'
import { cn, truncateString } from '@/lib/utils'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import WalletConnectButton from './WalletConnectButton'

type colorsType = 'orange' | 'pink' | 'blue' | 'darkBlue' | 'yellow' | 'green'

const App = () => {
  const [pkgVersion, setPkgVersion] = useState<string | undefined>()
  const [signature, setSignature] = useState<string>('')
  const [unsignedPsbt, setUnsignedPsbt] = useState<string>('')
  const [signedPsbt, setSignedPsbt] = useState<string>('')

  const account = useAccount()
  const connectors = useConnectors()
  const { network, chains, switchNetwork } = useNetwork()
  const { data: balance, refetch: refetchBalance } = useBalance()
  const { sendBitcoinAsync } = useSendBitcoin()
  const { signMessageAsync } = useSignMessage()
  const { signPsbtAsync } = useSignPsbt()
  const { broadcastPsbtAsync } = useBroadcastPsbt()

  const isConnected = account.status === 'connected'
  const address = account.address
  const paymentAddress = account.paymentAddress
  const publicKey = account.publicKey
  const paymentPublicKey = account.paymentPublicKey
  const providerName = account.connector?.name
  const providerIcon = account.connector?.icon

  const [finalize, setFinalize] = useState(false)
  const [broadcast, setBroadcast] = useState(false)

  useEffect(() => {
    getPackageVersion().then(setPkgVersion)
  }, [])

  // Reset transient state when the connected address changes.
  useEffect(() => {
    setSignature('')
    setUnsignedPsbt('')
    setSignedPsbt('')
  }, [])

  const totalBtc = balance !== undefined ? satoshisToBTC(Number(balance)) : '--'

  const switchNet = async (desired: string) => {
    try {
      await switchNetwork(desired)
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const sendBtc = async () => {
    try {
      if (!paymentAddress) throw new Error('Connect a wallet first')
      if (!balance || Number(balance) < 1500) throw new Error('Insufficient funds')
      const txid = await sendBitcoinAsync({ to: paymentAddress, amount: 1500 })
      toast.success(
        <a
          rel="noreferrer"
          target="_blank"
          href={`${getMempoolSpaceUrl(network)}/tx/${txid}`}
          className="underline text-blue-600 text-xs"
        >
          {txid}
        </a>
      )
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const sign = async (message: string) => {
    setSignature('')
    try {
      if (!address) throw new Error('Connect a wallet first')
      const sig = await signMessageAsync({ message, options: { address } })
      setSignature(sig)
      toast.success(
        <div className="flex flex-col gap-2 items-center">
          <span className="font-black">signed message</span>
          <div className="text-xs">{sig}</div>
        </div>
      )
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const signUnsignedPsbt = async () => {
    try {
      if (!unsignedPsbt) throw new Error('No unsigned PSBT')
      const result = await signPsbtAsync({
        psbt: unsignedPsbt,
        options: { finalize, broadcast },
      })
      if (!result) throw new Error('Failed to sign PSBT')

      setSignedPsbt(result.psbtHex)

      if (result.txId) {
        toast.success(
          <a
            rel="noreferrer"
            target="_blank"
            href={`${getMempoolSpaceUrl(network)}/tx/${result.txId}`}
            className="underline text-blue-600 text-xs"
          >
            {result.txId}
          </a>
        )
        return
      }

      toast.success(
        <div className="flex flex-col gap-2 items-center">
          <span className="font-black">signed {finalize ? '& finalized' : ''} PSBT</span>
          <div className="text-xs">{truncateString(result.psbtHex, 32)}</div>
        </div>
      )
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  const push = async () => {
    try {
      if (!signedPsbt) throw new Error('No signed PSBT')
      const txid = await broadcastPsbtAsync({ psbt: signedPsbt })
      setSignedPsbt('')
      toast.success(
        <a
          target="_blank"
          rel="noreferrer"
          href={`${getMempoolSpaceUrl(network)}/tx/${txid}`}
          className="underline text-blue-600 text-xs"
        >
          {txid}
        </a>
      )
    } catch (error) {
      if (error instanceof Error) toast.error(error.message)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full mt-12 mb-24 max-w-[1200px] px-4 md:px-12 font-windows">
      {/* Header */}
      <div className="w-full flex gap-2 flex-col md:flex-row justify-center items-center">
        <Image
          src={address ? '/lasereyes_connected.svg' : '/lasereyes_disconnected.svg'}
          className="w-auto h-auto"
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
          href="https://github.com/omnisat/lasereyes-mono"
          target="_blank"
        >
          {pkgVersion ? `v ${pkgVersion}` : '--'}
        </Link>

        <div className="grow" />
        <ClickToCopyNpmInstallPill className="mr-6" />
        <Link
          href="https://www.lasereyes.build/docs"
          target="_blank"
          className="self-end font-windows text-white flex flex-row gap-2 items-center hover:text-orange-400 transition-all"
        >
          docs
          <ImNewTab />
        </Link>
      </div>

      {/* Supported wallets */}
      <div className="flex items-center justify-center flex-col gap-4">
        <div className="text-orange-400 text-xl">supported wallets:</div>
        <div className="flex flex-wrap justify-center gap-3">
          {connectors.map(connector => (
            <WalletConnectButton key={connector.id} connector={connector} />
          ))}
        </div>
      </div>

      {/* Main container */}
      <div className="border border-[#3c393f] w-full text-xl">
        <div className="flex justify-end">
          <Select onValueChange={switchNet} value={network}>
            <SelectTrigger>
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent>
              {chains.map(chain => (
                <SelectItem key={chain.id} value={chain.id} className="h-8">
                  {chain.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 text-center items-center break-all p-2">
          {/* Provider */}
          <div className="flex flex-col items-center">
            <span className="font-black text-orange-400">Provider</span>
            <span
              className={clsx(
                'text-lg flex flex-row gap-2 items-center justify-center',
                providerName ? 'text-white' : 'text-gray-500'
              )}
            >
              {providerIcon && (
                // biome-ignore lint/a11y/useAltText: decorative wallet icon
                <img src={providerIcon} alt="" className="h-6 w-6" />
              )}
              {providerName ?? '--'}
            </span>
          </div>

          {/* Addresses */}
          <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
            <Field label="address (taproot)" value={address} />
            <Field label="payment address" value={paymentAddress} />
          </div>

          {/* Public keys */}
          <div className="flex flex-col md:flex-row gap-6">
            <Field label="public key" value={publicKey} />
            <Field label="payment public key" value={paymentPublicKey} />
          </div>

          {/* Balance */}
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
                className="cursor-pointer text-gray-600"
                onClick={() => refetchBalance()}
              />
            </span>
          </div>

          {/* Signature */}
          <div className="flex flex-col items-center">
            <span className="font-black text-orange-400">signature</span>
            <span
              className={clsx(
                'text-md flex flex-row gap-2 items-center justify-center',
                signature ? 'text-white' : 'text-gray-500'
              )}
            >
              {signature ? truncateString(signature, 24) : '--'}
              {signature && <ClickToCopy value={signature} />}
            </span>
          </div>

          {/* PSBT input */}
          <div className="flex flex-col items-center w-full max-w-xl">
            <span className="font-black text-orange-400">unsigned Psbt</span>
            <Input
              type="text"
              className="bg-transparent text-lg text-center border-[#3c393f]"
              placeholder="Paste a PSBT hex to sign"
              value={unsignedPsbt}
              onChange={e => setUnsignedPsbt(e.target.value)}
            />
            {signedPsbt && (
              <span className="text-xs text-gray-400 mt-1">
                signed: {truncateString(signedPsbt, 32)} <ClickToCopy value={signedPsbt} />
              </span>
            )}
          </div>

          <br />

          {/* Bitcoin actions */}
          <div className="text-md text-orange-400">bitcoin</div>
          <div className="flex flex-col md:flex-row text-xl gap-2">
            <Button
              className="w-full gap-2 bg-[#232225]"
              disabled={!isConnected}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={() => switchNet(network === 'testnet' ? 'mainnet' : 'testnet')}
              size="lg"
            >
              <Recycle size={14} />
              switch network
            </Button>
            <Button
              className="w-full gap-2 bg-[#232225]"
              disabled={!isConnected}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={sendBtc}
              size="lg"
            >
              <SendIcon size={14} />
              send Btc
            </Button>
            <Button
              className="w-full gap-2 bg-[#232225]"
              disabled={!isConnected}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={() => sign('Laser Eyes - Test Message')}
              size="lg"
            >
              <Pencil size={14} />
              sign message
            </Button>
          </div>

          {/* PSBT actions */}
          <div className="flex flex-col gap-2 w-full">
            <span className="w-full flex flex-col md:flex-row px-2 py-1 items-center justify-center gap-2">
              <Button
                className="w-full gap-2 bg-[#232225] disabled:text-[#737275]"
                disabled={!isConnected || !unsignedPsbt}
                variant={!isConnected ? 'secondary' : 'default'}
                size="lg"
                onClick={signUnsignedPsbt}
              >
                <FaSignature size={18} />
                sign{broadcast ? ' & Send' : ''} Psbt
              </Button>
              <Button
                className={clsx(
                  'shrink bg-[#232225] gap-2 disabled:text-gray-500',
                  finalize ? 'text-white border-gray-500' : 'bg-[#232225]'
                )}
                disabled={!isConnected || !unsignedPsbt}
                variant={finalize ? 'outline' : 'default'}
                size="lg"
                onClick={() => {
                  setFinalize(!finalize)
                  setBroadcast(false)
                }}
              >
                finalize
              </Button>
              <Button
                className={clsx(
                  'gap-2 shrink disabled:text-gray-500',
                  broadcast ? 'text-orange-400' : 'bg-[#232225]'
                )}
                size="lg"
                disabled={!isConnected || !finalize || !unsignedPsbt}
                variant="ghost"
                onClick={() => setBroadcast(!broadcast)}
              >
                <FaBroadcastTower size={16} />
                broadcast
              </Button>
            </span>

            <Button
              className="w-full gap-2 bg-[#232225] disabled:text-[#737275]"
              disabled={!isConnected || !signedPsbt}
              variant={!isConnected ? 'secondary' : 'default'}
              onClick={push}
            >
              <Upload size={16} />
              push Psbt
            </Button>
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          <LaserEyesLogo
            className="m-4"
            width={48}
            color={address ? ('green' as colorsType) : ('orange' as colorsType)}
          />
          <div className="grow" />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-black text-orange-400">{label}</span>
      <span
        className={clsx(
          'text-lg flex flex-row gap-2 items-center justify-center',
          value ? 'text-white' : 'text-gray-500'
        )}
      >
        {value && (
          <Link
            href={`https://mempool.space/address/${value}`}
            target="_blank"
            className="flex flex-row items-center gap-1"
          >
            <FaExternalLinkAlt className="h-3 w-3 text-gray-500" />
          </Link>
        )}
        {value ? truncateString(value, 24) : '--'}
        {value && <ClickToCopy value={value} />}
      </span>
    </div>
  )
}

export default App
