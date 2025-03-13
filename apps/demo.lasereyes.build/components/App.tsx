'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  NetworkType,
  ProviderType,
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
  SendArgs,
} from '@omnisat/lasereyes'
import { createPsbt, satoshisToBTC } from '@/lib/btc'
import { cn, truncateString } from '@/lib/utils'
import ClickToCopy from '@/components/ClickToCopy'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { getPackageVersion } from '@/lib/github'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { FaBroadcastTower, FaExternalLinkAlt, FaPushed } from 'react-icons/fa'
import { RxReload, RxSwitch } from 'react-icons/rx'
import { ClickToCopyNpmInstallPill } from '@/components/ClickToCopyNpmInstallPill'
import { ImCheckmark, ImNewTab, ImPushpin, ImSwitch } from 'react-icons/im'
import { toast } from 'sonner'
import { useUtxos } from '@/hooks/useUtxos'
import WalletConnectButton from './WalletConnectButton'
import { Button } from './ui/button'
import { getMempoolSpaceUrl } from '@/lib/urls'
import axios from 'axios'
import { Pencil, Recycle, SendHorizonal, SendIcon, Signal, Signature, TowerControlIcon, Upload } from 'lucide-react'
import { FaSignature } from 'react-icons/fa6'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

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
  type colorsType =
    | 'orange'
    | 'pink'
    | 'blue'
    | 'darkBlue'
    | 'yellow'
    | 'green'
    | 'purple'
    | 'red'
  const colors = [
    'orange',
    'pink',
    'blue',
    'darkBlue',
    'yellow',
  ] as colorsType[]
  const [selectedColor, setSelectedColor] = useState<colorsType>(
    colors[Math.floor(Math.random() * 5)]
  )

  const switchN = () => {
    try {
      if (network === MAINNET) {
        switchNetwork(TESTNET4)
        setNetwork(TESTNET4)
      } else if (network === TESTNET4) {
        switchNetwork(TESTNET)
        setNetwork(TESTNET)
      } else if (network === TESTNET) {
        switchNetwork(SIGNET)
        setNetwork(SIGNET)
      } else if (network === SIGNET) {
        switchNetwork(FRACTAL_MAINNET)
        setNetwork(FRACTAL_MAINNET)
      } else if (network === FRACTAL_MAINNET) {
        switchNetwork(FRACTAL_TESTNET)
        setNetwork(FRACTAL_TESTNET)
      } else {
        switchNetwork(MAINNET)
        setNetwork(MAINNET)
      }
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  useEffect(() => {
    getPackageVersion().then((version) => {
      setPkgVersion(version)
    })
  }, [])


  const {
    address,
    provider,
    inscribe,
    network,
    paymentAddress,
    send,
    paymentPublicKey,
    getBalance,
    getInscriptions,
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
    getMetaBalances,
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

  const [runes, setRunes] = useState<
    | {
      balance: string
      symbol: string
      name: string
    }[]
    | undefined
  >()
  const [selectedRune, setSelectedRune] = useState<
    | {
      balance: string
      symbol: string
      name: string
    }
    | undefined
  >(undefined)


  const [runeToAddress, setRuneToAddress] = useState<string>('')
  const [runeAmount, setRuneAmount] = useState<string>('')

  const [brc20s, setBrc20s] = useState<any>()

  const [selectedBrc20, setSelectedBrc20] = useState<any>()

  const [inscriptions, setInscriptions] = useState<any>()

  console.log({ inscriptions })
  console.log(JSON.stringify(inscriptions))
  console.log({ runes })
  console.log({ brc20s })


  useEffect(() => {
    setSignature('')
    setUnsignedPsbt(undefined)
    setSignedPsbt(undefined)
  }, [address])


  const { utxos } = useUtxos()

  useEffect(() => {
    if (
      provider &&
      utxos.length > 0 &&
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
    provider,
    network,
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

  useEffect(() => {
    if (address) {
      getMetaBalances('runes').then(setRunes)
      setRuneToAddress(address)
    }
  }, [address])


  useEffect(() => {
    if (address) {
      getMetaBalances('brc20').then(setBrc20s)
    }
  }, [address])

  useEffect(() => {
    if (address) {
      getInscriptions().then(setInscriptions)
    }
  }, [address])



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


  // @ts-ignore
  const total = satoshisToBTC(balance)


  const switchNet = async (desiredNetwork: typeof MAINNET | typeof TESTNET) => {
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


  const sendRune = async () => {
    try {
      if (!selectedRune) throw new Error('No rune selected')
      if (!address) throw new Error('No address available')
      if (!runeToAddress) throw new Error('No destination address provided')
      if (!runeAmount) throw new Error('No amount specified')

      const txid = await send('runes', {
        fromAddress: address,
        toAddress: runeToAddress,
        amount: Number(runeAmount),
        runeId: selectedRune.name,
      } as SendArgs)

      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target={'_blank'}
            href={`${getMempoolSpaceUrl(
              network as typeof MAINNET | typeof TESTNET
            )}/tx/${txid}`}
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


  return (
    <div
      className={
        'flex flex-col gap-4 w-full mt-12 mb-24 max-w-[1200px] px-12 font-windows'
      }
    >
      <div className={'w-full flex gap-2 flex-row justify-center items-center'}>
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
            'self-end mb-1.5 text-orange-500 border-orange-500 hover:border-white hover:bg-white hover:text-black transition-all text-md'
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
            'self-end font-windows text-white flex flex-row gap-2 items-center hover:text-orange-500 transition-all'
          }
        >
          docs
          <ImNewTab />
        </Link>
        <Link
          href={'https://github.com/omnisat/lasereyes/tree/main/example'}
          target={'_blank'}
          className={
            'self-end font-windows text-white flex flex-row gap-2 items-center hover:text-orange-500 transition-all'
          }
        >
          view source
          <ImNewTab />
        </Link>
      </div>

      <div className={'flex items-center justify-center flex-col gap-4'}>
        <div className="text-gray-500 text-xl">supported wallets:</div>
        <div className={'flex flex-wrap justify-center gap-3'}>
          {Object.values(SUPPORTED_WALLETS).sort((a, b) => Number(hasWallet[b.name]) - Number(hasWallet[a.name])).map(
            (walletInfo: { name: ProviderType; url: string }) => (
              <WalletConnectButton wallet={walletInfo} key={walletInfo.name} />
            )
          )}
        </div>
      </div>
      <div className={'border border-[#3c393f] w-full text-xl grow '}>
        <div className={'flex flex-row items-center gap-4 '}>
          <div className={'grow'} />
          <div
            className={
              'flex flex-col border border-[#3c393f] hover:underline cursor-pointer hover:text-orange-400 p-4 items-center'
            }
            onClick={() => switchN()}
          >
            {network}
          </div>
        </div>
        <div
          className={'flex flex-col gap-2 text-center items-center break-all'}
        >
          <div
            className={
              'flex flex-row items-center gap-4 justify-center space-around'
            }
          >
            <div className={'flex flex-col items-center'}>
              <span className={clsx('font-black text-orange-500')}>
                Provider
              </span>
              <span
                className={clsx(
                  'text-lg flex flex-row gap-2 items-center justify-center',
                  provider?.length > 0 ? 'text-white' : 'text-gray-500'
                )}
              >
                {provider && <WalletIcon walletName={provider} size={24} />}{' '}
                {provider?.length > 0 ? provider : '--'}
              </span>
            </div>
          </div>
          <div
            className={
              'flex flex-row items-center gap-6 justify-center space-around'
            }
          >
            <div className={'flex flex-row gap-2'}>
              <div className={'flex flex-col items-center'}>
                <span
                  className={clsx('font-black text-orange-500 justify-center')}
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

            <div
              className={
                'flex flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-500')}>
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

          <div className={'flex flex-row gap-6'}>
            <div
              className={
                'flex flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-500')}>
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
                <span className={clsx('font-black text-orange-500')}>
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

          <div
            className={
              'flex flex-row items-center gap-4 justify-center space-around'
            }
          >
            <div className={'flex flex-col items-center'}>
              <span className={clsx('font-black text-orange-500')}>
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

          <div className={'flex flex-col items-center'}>
            <span className={clsx('font-black text-orange-500')}>
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
          <div
            className={
              'flex flex-row items-center gap-6 justify-center space-around'
            }
          >
            <div
              className={
                'flex flex-row items-center gap-4 justify-center space-around'
              }
            >
              <div className={'flex flex-col items-center'}>
                <span className={clsx('font-black text-orange-500')}>
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
                    value={truncateString(
                      unsignedPsbt ? unsignedPsbt : '--',
                      24
                    )}
                    onChange={(e) => setUnsignedPsbt(e.target.value)}
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
                <span className={clsx('font-black text-orange-500')}>
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

          <div className="text-gray-500 text-sm">bitcoin</div>
          <div className={"flex flex-row text-xl gap-2"}>

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

          <div className={"flex flex-col gap-2"}>
            <span
              className={
                'w-full flex flex-row px-2 py-1 items-center justify-center gap-2'
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
                  "gap-2",
                  finalize || provider !== UNISAT ? 'text-white' : '',
                  'shrink disabled:text-gray-500 disabled ',
                  broadcast ? 'text-orange-500' : 'bg-[#232225]'
                )}
                size={'lg'}
                disabled={
                  !provider ||
                  (!finalize && provider !== XVERSE) ||
                  !unsigned
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
          <div className={'border-b border-2 border-[#232225]  my-2'} />
          <div className="flex md:flex-row flex-col gap-8">
            <div className={"flex flex-col gap-2"}>
              <div className="text-gray-500 text-sm">inscriptions</div>
              <div className="flex flex-col gap-2 items-center justify-center">
                <Input
                  className={cn(
                    'w-full h-full bg-[#232225] disabled:text-[#737275] min-w-[200px] border border-gray-500 text-center',
                    ''
                  )}
                  placeholder={'Inscribe some text...'}
                  value={inscriptionText}
                  disabled={!provider}
                  onChange={(e) => setInscriptionText(e.target.value)}
                />
                <Button
                  className={'w-full bg-[#232225] disabled:text-[#737275]'}
                  disabled={!provider}
                  variant={!provider ? 'secondary' : 'default'}
                  onClick={() => (!provider ? null : inscribeWithWallet())}
                >
                  inscribe
                </Button>
                <div className={'border-b border-2 border-gray-500  my-1'} />
                <Select
                  onValueChange={(value) => {
                    const rune = runes?.find((r) => r.symbol === value)
                    setSelectedRune(rune)
                  }}
                  disabled={!provider}
                >
                  <SelectTrigger

                    disabled={!provider}
                    className={cn(
                      'w-full bg-[#232225] border-none flex flex-row gap-4 items-center disabled:text-[#737275] text-sm text-center',
                      'min-w-[200px]'
                    )}
                  >
                    <SelectValue placeholder="Select an inscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {runes?.map((rune, index) => (
                      <SelectItem key={index} value={rune.symbol}>
                        {rune.name} ({rune.balance})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  disabled={
                    !provider ||
                    !selectedRune ||
                    !runeToAddress ||
                    !runeAmount
                  }
                  className={'w-full bg-[#232225] disabled:text-[#737275]'}
                  onClick={sendRune}
                >
                  Send Inscription
                </Button>
              </div>
            </div>

            <div className={'border-b border-2 border-[#232225] my-2'} />
            <div className="flex flex-col gap-2">
              <div className="text-gray-500 text-sm">runes</div>
              <Select
                onValueChange={(value) => {
                  const rune = runes?.find((r) => r.symbol === value)
                  setSelectedRune(rune)
                }}
                disabled={!provider}
              >
                <SelectTrigger

                  disabled={!provider}
                  className={cn(
                    'w-full bg-[#232225] border-none flex flex-row gap-4 items-center disabled:text-[#737275] text-sm text-center',
                    'min-w-[200px]'
                  )}
                >
                  <SelectValue placeholder="Select a Rune" />
                </SelectTrigger>
                <SelectContent>
                  {runes?.map((rune, index) => (
                    <SelectItem key={index} value={rune.symbol}>
                      {rune.name} ({rune.balance})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                disabled={!provider}
                className={cn(
                  'w-full bg-[#232225] border-none disabled:text-[#737275] text-center',
                  ''
                )}
                placeholder="To Address"
                value={runeToAddress}
                onChange={(e) => setRuneToAddress(e.target.value)}
              />
              <Input
                disabled={
                  !provider ||
                  !selectedRune ||
                  !runeToAddress
                }
                type="number"
                className={cn(
                  'w-full bg-[#232225] border-none disabled:text-[#737275] text-center',
                  ''
                )}
                placeholder="Amount"
                value={runeAmount}
                onChange={(e) => setRuneAmount(e.target.value)}
              />
              <Button
                disabled={
                  !provider ||
                  !selectedRune ||
                  !runeToAddress ||
                  !runeAmount
                }
                className={'w-full bg-[#232225] disabled:text-[#737275]'}
                onClick={sendRune}
              >
                Send Rune
              </Button>
            </div>

            <div className={'border-b border-2 border-[#232225] my-2'} />
            <div className="flex flex-col gap-2">
              <div className="text-gray-500 text-sm">brc-20</div>
              <Select
                onValueChange={(value) => {
                  const brc20 = brc20s?.find((r: any) => r.symbol === value)
                  setSelectedBrc20(brc20)
                }}
                disabled={!provider}
              >
                <SelectTrigger

                  disabled={!provider}
                  className={cn(
                    'w-full bg-[#232225] border-none flex flex-row gap-4 items-center disabled:text-[#737275] text-sm text-center',
                    'min-w-[200px]'
                  )}
                >
                  <SelectValue placeholder="Select a Brc-20" />
                </SelectTrigger>
                <SelectContent>
                  {runes?.map((rune, index) => (
                    <SelectItem key={index} value={rune.symbol}>
                      {rune.name} ({rune.balance})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                disabled={!provider}
                className={cn(
                  'w-full bg-[#232225] border-none disabled:text-[#737275] text-center',
                  ''
                )}
                placeholder="To Address"
                value={runeToAddress}
                onChange={(e) => setRuneToAddress(e.target.value)}
              />
              <Input
                disabled={
                  !provider ||
                  !selectedRune ||
                  !runeToAddress
                }
                type="number"
                className={cn(
                  'w-full bg-[#232225] border-none disabled:text-[#737275] text-center',
                  ''
                )}
                placeholder="Amount"
                value={runeAmount}
                onChange={(e) => setRuneAmount(e.target.value)}
              />
              <Button
                disabled={
                  !provider ||
                  !selectedRune ||
                  !runeToAddress ||
                  !runeAmount
                }
                className={'w-full bg-[#232225] disabled:text-[#737275]'}
                onClick={sendRune}
              >
                Send Rune
              </Button>
            </div>
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
