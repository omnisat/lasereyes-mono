import {
  ContentType,
  NetworkType,
  Protocol,
  ProviderType,
  SignMessageOptions,
  LaserEyesClient,
  MempoolUtxo,
  LaserEyesSignPsbtsOptions,
  SignPsbtsResponse,
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
  hasTokeo: boolean
  hasKeplr: boolean

  connect: (walletName: ProviderType) => Promise<void>
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
  signPsbts: (options: LaserEyesSignPsbtsOptions) => Promise<SignPsbtsResponse>
  pushPsbt: (tx: string) => Promise<string | undefined>
  inscribe: (
    contentBase64: string,
    mimeType: ContentType
  ) => Promise<string | string[]>
  send: LaserEyesClient['send']
  sendInscriptions: (
    inscriptionIds: string[],
    toAddress: string
  ) => Promise<string>
  getUtxos: (address: string) => Promise<MempoolUtxo[]>
}
