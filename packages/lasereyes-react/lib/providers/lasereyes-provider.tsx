'use client'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { LaserEyesContext, initialContext } from './context'
import {
  Config,
  LaserEyesClient,
  MAINNET,
  createConfig,
  createStores,
  ContentType,
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
        connect: client?.connect.bind(client) ?? initialContext.connect,
        disconnect: client?.disconnect.bind(client) ?? initialContext.disconnect,
        getBalance: async () =>
          ((await client?.getBalance.call(client)) ?? initialContext.getBalance())?.toString(),
        getInscriptions: async (offset, limit) =>
          (await client?.getInscriptions.call(client, offset, limit)) ?? initialContext.getInscriptions(),
        getNetwork: client?.getNetwork.bind(client) ?? initialContext.getNetwork,
        getPublicKey: async () =>
          (await client?.getPublicKey.call(client)) ?? initialContext.getPublicKey(),
        pushPsbt: client?.pushPsbt.bind(client) ?? initialContext.pushPsbt,
        signMessage: async (message: string, toSignAddress?: string) =>
          (await client?.signMessage.call(client, message, toSignAddress)) ?? initialContext.signMessage(message),
        requestAccounts: async () =>
          (await client?.requestAccounts.call(client)) ?? initialContext.requestAccounts(),
        sendBTC: async (to, amount) =>
          (await client?.sendBTC.call(client, to, amount)) ?? initialContext.sendBTC(to, amount),
        signPsbt: async (psbt, finalize, broadcast) =>
          (await client?.signPsbt.call(client, psbt, finalize, broadcast)) ?? initialContext.signPsbt(psbt),
        switchNetwork: async (network) => {
          await client?.switchNetwork.call(client, network)
        },
        inscribe: async (content, mimeType: ContentType) =>
          (await client?.inscribe.call(client, content, mimeType)) ?? initialContext.inscribe(content, mimeType),
      }}
    >
      {children}
    </LaserEyesContext.Provider>
  )
}
