import {
  ContentType,
  MAINNET,
  NetworkType,
  ProviderType,
} from '@omnisat/lasereyes-core'
import { createContext } from 'react'
import { LaserEyesContextType } from './types'

const initialContext = {
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
  connect: async (_network: ProviderType) => { },
  disconnect: () => { },
  requestAccounts: async () => [],
  getNetwork: async () => MAINNET,
  switchNetwork: async (_network: NetworkType) => { },
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
