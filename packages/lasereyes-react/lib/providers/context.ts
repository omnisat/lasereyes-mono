import {
  ContentType,
  LaserEyesClient,
  LaserEyesStoreType,
  MAINNET,
  NetworkType,
  ProviderType,
} from '@omnisat/lasereyes-core'
import { createContext } from 'react'
import { LaserEyesContextType } from './types'
import { atom, map, MapStore, WritableAtom } from 'nanostores'

export const initialContext = {
  hasUnisat: false,
  hasXverse: false,
  hasOyl: false,
  hasMagicEden: false,
  hasOkx: false,
  hasOrange: false,
  hasOpNet: false,
  hasLeather: false,
  hasPhantom: false,
  hasSparrow: false,
  hasWizz: false,
  isInitializing: true,
  connected: false,
  isConnecting: false,
  publicKey: '',
  address: '',
  paymentAddress: '',
  paymentPublicKey: '',
  balance: undefined,
  network: MAINNET as NetworkType,
  library: null,
  provider: null,
  accounts: [],
  connect: async (_network: ProviderType) => {},
  disconnect: () => {},
  requestAccounts: async () => [],
  getNetwork: async () => MAINNET,
  switchNetwork: async (_network: NetworkType) => {},
  getPublicKey: async () => '',
  getBalance: async () => '',
  getInscriptions: async () => [],
  sendBTC: async (_to: string, _amount: number) => '',
  signMessage: async (_message: string) => '',
  signPsbt: async (_tx: string) => {
    return {
      signedPsbtHex: '',
      signedPsbtBase64: '',
      txId: '',
    }
  },
  pushPsbt: async (_tx: string) => {
    return ''
  },
  inscribe: async (_content: any, _: ContentType) => '',
  isCreatingCommit: false,
  isInscribing: false,
}

export const LaserEyesContext =
  createContext<LaserEyesContextType>(initialContext)

export const LaserEyesStoreContext = createContext<{
  $store: MapStore<LaserEyesStoreType>
  $network: WritableAtom<NetworkType>
  client: LaserEyesClient | null
  methods: Pick<
    LaserEyesContextType,
    | 'switchNetwork'
    | 'signPsbt'
    | 'signMessage'
    | 'requestAccounts'
    | 'sendBTC'
    | 'inscribe'
    | 'getPublicKey'
    | 'getNetwork'
    | 'pushPsbt'
    | 'getInscriptions'
    | 'getBalance'
    | 'disconnect'
    | 'connect'
  >
}>({
  $store: map(),
  $network: atom(),
  client: null,
  methods: {
    connect: async () => {},
    disconnect: () => {},
    getBalance: async () => '',
    getInscriptions: async () => [],
    getNetwork: async () => '',
    getPublicKey: async () => '',
    pushPsbt: async () => '',
    signMessage: async () => '',
    requestAccounts: async () => [],
    sendBTC: async () => '',
    signPsbt: async () => ({
      signedPsbtBase64: '',
      signedPsbtHex: '',
    }),
    switchNetwork: async () => {},
    inscribe: async () => '',
  },
})
