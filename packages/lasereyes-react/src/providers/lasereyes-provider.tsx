'use client'
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { defaultMethods, LaserEyesStoreContext } from './context'
import {
  type BTCSendArgs,
  type Config,
  type ContentType,
  createConfig,
  createStores,
  LaserEyesClient,
  type LaserEyesSignPsbtOptions,
  type NetworkType,
  type Protocol,
  type ProviderType,
  type RuneSendArgs,
  type SignMessageOptions,
} from '@omnisat/lasereyes-core'

export default function LaserEyesProvider({
  config,
  children,
}: {
  config?: Config
  children: ReactNode | ReactNode[]
}) {
  const clientStores = useMemo(() => createStores(), [])
  const clientConfig = useMemo(() => createConfig(config), [config])
  const [client, setClient] = useState<LaserEyesClient | null>(null)

  useEffect(() => {
    if (clientConfig?.network) {
      clientStores.$network.set(clientConfig.network)
    }
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
        await (client?.getBalance() ?? defaultMethods.getBalance())
      )?.toString() ?? '',
    [client]
  )
  const getMetaBalances = useCallback(
    async (protocol: Protocol) =>
      (await client?.getMetaBalances(protocol)) ??
      defaultMethods.getMetaBalances(),
    [client]
  )
  const getInscriptions = useCallback(
    async (offset?: number, limit?: number) =>
      (await client?.getInscriptions(offset, limit)) ??
      defaultMethods.getInscriptions(),
    [client]
  )
  const getNetwork = useCallback(
    () => client?.getNetwork() ?? defaultMethods.getNetwork(),
    [client]
  )
  const getPublicKey = useCallback(
    async () => (await client?.getPublicKey()) ?? defaultMethods.getPublicKey(),
    [client]
  )
  const pushPsbt = useCallback(
    (tx: string) => client?.pushPsbt(tx) ?? defaultMethods.pushPsbt(),
    [client]
  )
  const signMessage = useCallback(
    async (
      message: string,
      toSignAddressOrOptions?: string | SignMessageOptions
    ) => {
      let options: SignMessageOptions = {}
      if (typeof toSignAddressOrOptions === 'string') {
        options = { toSignAddress: toSignAddressOrOptions }
      } else if (toSignAddressOrOptions) {
        options = toSignAddressOrOptions
      }

      return (
        (await client?.signMessage(message, options)) ??
        defaultMethods.signMessage()
      )
    },
    [client]
  )
  const requestAccounts = useCallback(
    async () =>
      (await client?.requestAccounts()) ?? defaultMethods.requestAccounts(),
    [client]
  )
  const sendBTC = useCallback(
    async (to: string, amount: number) =>
      (await client?.sendBTC.call(client, to, amount)) ??
      defaultMethods.sendBTC(),
    [client]
  )

  const signPsbt = useCallback<LaserEyesClient['signPsbt']>(
    async (
      ...args:
        | [LaserEyesSignPsbtOptions]
        | [tx: string, finalize?: boolean, broadcast?: boolean]
    ) => {
      if (typeof args[0] === 'string') {
        // Handle the `(tx: string, finalize: boolean, broadcast: boolean)` overload
        const [tx, finalize, broadcast] = args
        return (
          (await client?.signPsbt?.(
            tx,
            finalize ?? false,
            broadcast ?? false
          )) ?? defaultMethods.signPsbt()
        )
      }
      // Handle the `(options: LaserEyesSignPsbtOptions)` overload
      const [options] = args
      return (await client?.signPsbt?.(options)) ?? defaultMethods.signPsbt()
    },
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
      defaultMethods.inscribe(),
    [client]
  )
  const send = useCallback(
    async (protocol: Protocol, sendArgs: BTCSendArgs | RuneSendArgs) =>
      (await client?.send.call(client, protocol, sendArgs)) ??
      defaultMethods.send(),
    [client]
  )

  const sendInscriptions = useCallback(
    async (inscriptionIds: string[], toAddress: string) =>
      (await client?.sendInscriptions.call(
        client,
        inscriptionIds,
        toAddress
      )) ?? defaultMethods.sendInscriptions(),
    [client]
  )

  const getUtxos = useCallback(
    async (address: string) =>
      (await client?.dataSourceManager.getAddressUtxos(address)) ??
      defaultMethods.getUtxos(),
    [client]
  )

  // TODO: Move method definitions into useMemo here
  const methods = useMemo(() => {
    if (!client) {
      return defaultMethods
    }

    return {
      connect,
      disconnect,
      getBalance,
      getMetaBalances,
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
      send,
      sendInscriptions,
      getUtxos,
    }
  }, [
    client,
    connect,
    disconnect,
    getBalance,
    getInscriptions,
    getMetaBalances,
    getNetwork,
    getPublicKey,
    inscribe,
    pushPsbt,
    requestAccounts,
    send,
    sendBTC,
    sendInscriptions,
    signMessage,
    signPsbt,
    switchNetwork,
    getUtxos,
  ])

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
