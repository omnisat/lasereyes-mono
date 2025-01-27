'use client'
import { ReactNode, useEffect, useMemo, useState, useCallback } from 'react'
import { LaserEyesContext, initialContext } from './context'
import {
  Config,
  LaserEyesClient,
  MAINNET,
  createConfig,
  createStores,
  ContentType,
  ProviderType,
  NetworkType,
} from '@omnisat/lasereyes-core'
import { useStore } from '@nanostores/react'

export default function LaserEyesProvider({
  config,
  children,
}: {
  config?: Config
  children: ReactNode | ReactNode[]
}) {
  const clientStores = useMemo(() => createStores(), [])
  const clientConfig = useMemo(
    () => createConfig(config ?? { network: MAINNET }),
    [config]
  )
  const [client, setClient] = useState<LaserEyesClient | null>()

  const {
    address,
    paymentAddress,
    publicKey,
    paymentPublicKey,
    accounts,
    balance,
    connected,
    hasProvider,
    isConnecting,
    isInitializing,
    provider,
  } = useStore(clientStores.$store)
  const library = {}
  const network = useStore(clientStores.$network)

  useEffect(() => {
    const c = new LaserEyesClient(clientStores, clientConfig)
    setClient(c)
    c.initialize()
    return () => c.dispose()
  }, [clientConfig, clientStores])

  const connect = useCallback(async (defaultWallet: ProviderType) => await client?.connect(defaultWallet), [client])
  const disconnect = useCallback(() => client?.disconnect(), [client])
  const getBalance = useCallback(async () =>
    (await (client?.getBalance()  ?? initialContext.getBalance()))?.toString() ?? "", [client])
  const getInscriptions = useCallback(async (offset?: number, limit?: number) =>
    (await client?.getInscriptions(offset, limit)) ?? initialContext.getInscriptions(), [client])
  const getNetwork = useCallback(() => client?.getNetwork() ?? initialContext.getNetwork(), [client])
  const getPublicKey = useCallback(async () =>
    (await client?.getPublicKey()) ?? initialContext.getPublicKey(), [client])
  const pushPsbt = useCallback((tx: string) => client?.pushPsbt(tx) ?? initialContext.pushPsbt(tx), [client])
  const signMessage = useCallback(async (message: string, toSignAddress?: string) =>
    (await client?.signMessage(message, toSignAddress)) ?? initialContext.signMessage(message), [client])
  const requestAccounts = useCallback(async () =>
    (await client?.requestAccounts()) ?? initialContext.requestAccounts(), [client])
  const sendBTC = useCallback(async (to: string, amount: number) =>
    (await client?.sendBTC.call(client, to, amount)) ?? initialContext.sendBTC(to, amount), [client])
  const signPsbt = useCallback(async (psbt: string, finalize?: boolean, broadcast?: boolean) =>
    (await client?.signPsbt.call(client, psbt, finalize, broadcast)) ?? initialContext.signPsbt(psbt), [client])
  const switchNetwork = useCallback(async (network: NetworkType) => {
    await client?.switchNetwork.call(client, network)
  }, [client])
  const inscribe = useCallback(async (content: string, mimeType: ContentType) =>
    (await client?.inscribe.call(client, content, mimeType)) ?? initialContext.inscribe(content, mimeType), [client])

  return (
    <LaserEyesContext.Provider
      value={{
        paymentAddress,
        address,
        publicKey,
        paymentPublicKey,
        library,
        network,
        accounts,
        balance: Number(balance),
        connected,
        isConnecting,
        isInitializing,
        provider,
        hasLeather: hasProvider.leather ?? false,
        hasMagicEden: hasProvider['magic-eden'] ?? false,
        hasOkx: hasProvider.okx ?? false,
        hasOyl: hasProvider.oyl ?? false,
        hasOrange: hasProvider.orange ?? false,
        hasOpNet: hasProvider.op_net ?? false,
        hasPhantom: hasProvider.phantom ?? false,
        hasUnisat: hasProvider.unisat ?? false,
        hasSparrow: hasProvider.sparrow ?? false,
        hasWizz: hasProvider.wizz ?? false,
        hasXverse: hasProvider.xverse ?? false,
        connect,
        disconnect,
        getBalance,
        getInscriptions,
        getNetwork,
        getPublicKey,
        pushPsbt,
        signMessage,
        requestAccounts,
        sendBTC,
        signPsbt,
        switchNetwork,
        inscribe,
      }}
    >
      {children}
    </LaserEyesContext.Provider>
  )
}
