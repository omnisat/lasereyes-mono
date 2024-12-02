import { ContentType, NetworkType, ProviderType } from '@omnisat/lasereyes-core'

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

  connect: (walletName: ProviderType) => Promise<void>
  disconnect: () => void
  requestAccounts: () => Promise<string[]>
  getNetwork: () => Promise<string | undefined>
  switchNetwork: (network: NetworkType) => Promise<void>
  getPublicKey: () => Promise<string>
  getBalance: () => Promise<string>
  getInscriptions: () => Promise<any[]>
  sendBTC: (to: string, amount: number) => Promise<string>
  signMessage: (message: string, toSignAddress?: string) => Promise<string>
  signPsbt: (
    tx: string,
    finalize?: boolean,
    broadcast?: boolean
  ) => Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string
    }
    | undefined
  >
  pushPsbt: (tx: string) => Promise<string | undefined>
  inscribe: (
    contentBase64: string,
    mimeType: ContentType
  ) => Promise<string | string[]>
}
