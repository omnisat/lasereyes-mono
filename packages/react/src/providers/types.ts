import type {
  Inscription,
  LaserEyesClient, MempoolUtxo,
  NetworkType,
  Protocol,
  ProviderType
} from "@kevinoyl/lasereyes-core"

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
  library: unknown
  client: LaserEyesClient | null
  provider: ProviderType | undefined
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
  getMetaBalances: (protocol: Protocol) => Promise<unknown>
  getInscriptions: (offset?: number, limit?: number) => Promise<Inscription[]>
  sendBTC: LaserEyesClient["sendBTC"]
  signMessage: LaserEyesClient["signMessage"]
  signPsbt: LaserEyesClient["signPsbt"]
  signPsbts: LaserEyesClient["signPsbts"]
  pushPsbt: LaserEyesClient["pushPsbt"]
  inscribe: LaserEyesClient["inscribe"]
  send: LaserEyesClient["send"]
  sendInscriptions: LaserEyesClient["sendInscriptions"]
  getUtxos: (address: string) => Promise<MempoolUtxo[]>
}
