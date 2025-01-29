'use client'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { initialContext, LaserEyesStoreContext } from './context'
import {
  Config,
  ContentType,
  createConfig,
  createStores,
  LaserEyesClient,
  MAINNET,
  NetworkType,
  ProviderType,
} from '@omnisat/lasereyes-core'

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
  const [client, setClient] = useState<LaserEyesClient | null>(null)

  useEffect(() => {
    const c = new LaserEyesClient(clientStores, clientConfig)
    setClient(() => c)
    c.initialize()
    return () => c.dispose()
  }, [clientConfig, clientStores])

  const connect = useCallback(
    async (defaultWallet: ProviderType) => await client?.connect(defaultWallet),
    [client]
  )
  const disconnect = useCallback(() => client?.disconnect(), [client])
  const getBalance = useCallback(
    async () =>
      (
        await (client?.getBalance() ?? initialContext.getBalance())
      )?.toString() ?? '',
    [client]
  )
  const getInscriptions = useCallback(
    async (offset?: number, limit?: number) =>
      (await client?.getInscriptions(offset, limit)) ??
      initialContext.getInscriptions(),
    [client]
  )
  const getNetwork = useCallback(
    () => client?.getNetwork() ?? initialContext.getNetwork(),
    [client]
  )
  const getPublicKey = useCallback(
    async () => (await client?.getPublicKey()) ?? initialContext.getPublicKey(),
    [client]
  )
  const pushPsbt = useCallback(
    (tx: string) => client?.pushPsbt(tx) ?? initialContext.pushPsbt(tx),
    [client]
  )
  const signMessage = useCallback(
    async (message: string, toSignAddress?: string) =>
      (await client?.signMessage(message, toSignAddress)) ??
      initialContext.signMessage(message),
    [client]
  )
  const requestAccounts = useCallback(
    async () =>
      (await client?.requestAccounts()) ?? initialContext.requestAccounts(),
    [client]
  )
  const sendBTC = useCallback(
    async (to: string, amount: number) =>
      (await client?.sendBTC.call(client, to, amount)) ??
      initialContext.sendBTC(to, amount),
    [client]
  )
  const signPsbt = useCallback(
    async (psbt: string, finalize?: boolean, broadcast?: boolean) =>
      (await client?.signPsbt.call(client, psbt, finalize, broadcast)) ??
      initialContext.signPsbt(psbt),
    [client]
  )
  const switchNetwork = useCallback(
    async (network: NetworkType) =>
      await client?.switchNetwork.call(client, network),
    [client]
  )
  const inscribe = useCallback(
    async (content: string, mimeType: ContentType) =>
      (await client?.inscribe.call(client, content, mimeType)) ??
      initialContext.inscribe(content, mimeType),
    [client]
  )

  const methods = useMemo(
    () => ({
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
    }),
    [
      connect,
      disconnect,
      getBalance,
      getInscriptions,
      getNetwork,
      getPublicKey,
      inscribe,
      pushPsbt,
      requestAccounts,
      sendBTC,
      signMessage,
      signPsbt,
      switchNetwork,
    ]
  )

  return (
    <LaserEyesStoreContext.Provider
      value={{
        $store: clientStores.$store,
        $network: clientStores.$network,
        client: client,
        methods,
      }}
    >
      {children}
    </LaserEyesStoreContext.Provider>
  )
}
