import {
  ContentType,
  NetworkType,
  Protocol,
  ProviderType,
  SendArgs,
  SignMessageOptions,
  LaserEyesClient,
  MempoolUtxo
} from '@omnisat/lasereyes-core'

export type LaserEyesContextType = {
  isInitializing: boolean
  connected: boolean
  isConnecting: boolean
  publicKey: string
  address: string
  paymentAddress: string
  paymentPublicKey: string
  balance: number | undefined
  network: NetworkType
  library: any
  client: LaserEyesClient | null
  provider: any
  accounts: string[]
  hasUnisat: boolean
  hasXverse: boolean
  hasOrange: boolean
  hasOpNet: boolean
  hasOyl: boolean
  hasMagicEden: boolean
  hasOkx: boolean
  hasSparrow: boolean
  hasLeather: boolean
  hasPhantom: boolean
  hasWizz: boolean

  connect: (walletName: ProviderType, _forceReconnect?: boolean) => Promise<void>
  disconnect: () => void
  requestAccounts: () => Promise<string[]>
  getNetwork: () => Promise<string | undefined>
  switchNetwork: (network: NetworkType) => Promise<void>
  getPublicKey: () => Promise<string>
  getBalance: () => Promise<string>
  getMetaBalances: (protocol: Protocol) => Promise<any>
  getInscriptions: (offset?: number, limit?: number) => Promise<any[]>
  sendBTC: (to: string, amount: number) => Promise<string>
  signMessage: (
    message: string,
    toSignAddressOrOptions?: string | SignMessageOptions
  ) => Promise<string>
  signPsbt: LaserEyesClient['signPsbt']
  pushPsbt: (tx: string) => Promise<string | undefined>
  inscribe: (
    contentBase64: string,
    mimeType: ContentType
  ) => Promise<string | string[]>
  send: (protocol: Protocol, sendArgs: SendArgs) => Promise<string>
  sendInscriptions: (inscriptionIds: string[], toAddress: string) => Promise<string>
  getUtxos: (address: string) => Promise<MempoolUtxo[]>
}
