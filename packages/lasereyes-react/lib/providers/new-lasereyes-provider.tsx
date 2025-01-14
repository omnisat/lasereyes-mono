'use client'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { LaserEyesContext } from './context'
import {
  Config,
  LaserEyesClientState,
  UnisatWalletProvider,
  NewLaserEyesClient,
  NewWalletProvider,
  ContentType,
  UNISAT,
  ProviderType,
  NetworkType,
  LOCAL_STORAGE_DEFAULT_WALLET,
} from '@omnisat/lasereyes-core'
import { useStore } from '@nanostores/react'
import { map } from 'nanostores'

export default function LaserEyesProvider({
  config,
  children,
}: {
  config?: Config & {
    autoReconnect?: boolean
  }
  children: ReactNode | ReactNode[]
}) {
  const [client, setClient] = useState<NewLaserEyesClient | null>(null)
  const [providerName, setProvider] = useState<ProviderType | null>(null)

  const store = useMemo(
    () =>
      map<LaserEyesClientState>({
        connected: false,
        accounts: [],
        isConnecting: false,
      }),
    []
  )
  const {
    address,
    paymentAddress,
    publicKey,
    paymentPublicKey,
    connected,
    isConnecting,
    accounts,
    balance,
    network,
  } = useStore(store)
  const providers = useMemo(() => {
    return {
      [UNISAT]: UnisatWalletProvider.getInstance(),
    }
  }, [])

  const connect = useCallback(
    async (walletProvider: ProviderType) => {
      if (providerName === walletProvider) {
        await client?.connect(config?.network)
        return
      }
      if (client) {
        await client.disconnect()
      }

      const provider: NewWalletProvider | undefined =
        Object(providers)[walletProvider]
      if (!provider) {
        throw new Error('Wallet not supported')
      }
      
      const client_ = new NewLaserEyesClient({
        provider,
        stateStore: store,
      })
      setClient(client_)
      await client_.connect(config?.network)
      setProvider(walletProvider)
      window.localStorage.setItem(LOCAL_STORAGE_DEFAULT_WALLET, walletProvider)
    },
    [client, config?.network, providerName, providers, store]
  )

  useEffect(() => {
    if (!config?.autoReconnect) return

    const storedProvider = window.localStorage.getItem(
      LOCAL_STORAGE_DEFAULT_WALLET
    )
    if (storedProvider) {
      connect(storedProvider as ProviderType)
    }
  }, [config?.autoReconnect, connect])

  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect()
    }
    setClient(null)
    setProvider(null)
  }, [client])

  return (
    <LaserEyesContext.Provider
      value={{
        paymentAddress: paymentAddress ?? '',
        address: address ?? '',
        publicKey: publicKey ?? '',
        paymentPublicKey: paymentPublicKey ?? '',
        library: undefined,
        network: (network as NetworkType | undefined) ?? 'mainnet',
        accounts,
        balance: Number(balance),
        connected,
        isConnecting,
        isInitializing: false,
        provider: providerName,
        hasLeather: false,
        hasMagicEden: false,
        hasOkx: false,
        hasOyl: false,
        hasOrange: false,
        hasOpNet: false,
        hasPhantom: false,
        hasUnisat: true,
        hasSparrow: false,
        hasWizz: false,
        hasXverse: false,
        connect: connect,
        disconnect: disconnect,
        getBalance: async () =>
          ((await client?.getBalance.call(client)) ?? '').toString(),
        getInscriptions: async (_, __) => [],
        getNetwork: client?.getNetwork.bind(client) ?? (async () => 'mainnet'),
        getPublicKey: async () =>
          (await client?.getPublicKey.call(client)) ?? '',
        pushPsbt: client?.pushPSBT.bind(client) ?? (async () => ''),
        signMessage: async (message: string, toSignAddress?: string) =>
          (await client?.signMessage.call(client, message, toSignAddress)) ??
          '',
        requestAccounts: async () =>
          (await client?.requestAccounts.call(client)) ?? [],
        sendBTC: async (to, amount) =>
          (await client?.sendBitcoin.call(client, to, BigInt(amount))) ?? '',
        signPsbt: async (psbt, finalize, broadcast) =>
          (await client?.signPSBT.call(client, psbt, finalize, broadcast)) ?? {
            signedPsbtBase64: '',
            signedPsbtHex: '',
          },
        switchNetwork: async (network) => {
          await client?.switchNetwork.call(client, network)
        },
        inscribe: async (_, __: ContentType) => '',
      }}
    >
      {children}
    </LaserEyesContext.Provider>
  )
}
