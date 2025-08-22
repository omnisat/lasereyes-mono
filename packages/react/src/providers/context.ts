import {
  createStores,
  LaserEyesClient,
  LaserEyesStoreType,
  NetworkType,
} from '@kevinoyl/lasereyes-core'
import { createContext } from 'react'
import { LaserEyesContextType } from './types'
import { MapStore, WritableAtom } from 'nanostores'

const { $store, $network } = createStores()
export const defaultMethods = {
  connect: async () => { },
  disconnect: () => { },
  getBalance: async () => '',
  getMetaBalances: async () => [],
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
  signPsbts: async () => ({
    signedPsbts: [],
  }),
  switchNetwork: async () => { },
  inscribe: async () => '',
  send: async () => '',
  sendInscriptions: async () => '',
  getUtxos: async () => [],
}
export const LaserEyesStoreContext = createContext<{
  $store: MapStore<LaserEyesStoreType>
  $network: WritableAtom<NetworkType>
  client: LaserEyesClient | null
  methods: Pick<
    LaserEyesContextType,
    | 'switchNetwork'
    | 'signPsbt'
    | 'signPsbts'
    | 'signMessage'
    | 'requestAccounts'
    | 'sendBTC'
    | 'inscribe'
    | 'send'
    | 'sendInscriptions'
    | 'getPublicKey'
    | 'getNetwork'
    | 'pushPsbt'
    | 'getInscriptions'
    | 'getBalance'
    | 'getMetaBalances'
    | 'disconnect'
    | 'connect'
    | 'getUtxos'
  >
}>({
  $store,
  $network,
  client: null,
  methods: defaultMethods,
})
