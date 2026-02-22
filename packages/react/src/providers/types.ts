import type {
  Inscription,
  LaserEyesClient,
  MempoolUtxo,
  NetworkType,
  Protocol,
  ProviderType,
} from '@omnisat/lasereyes-core'

/**
 * Shape of the LaserEyes React context value returned by {@link useLaserEyes}.
 *
 * @remarks
 * Contains the full wallet state (addresses, connection status, provider detection)
 * as well as all wallet interaction methods (connect, sign, send, etc.).
 *
 * State properties are reactive and automatically update when the underlying
 * wallet state changes. The `has*` flags indicate which wallet browser extensions
 * are detected in the current environment.
 */
export type LaserEyesContextType = {
  /** Whether the client is performing initial setup and provider detection */
  isInitializing: boolean
  /** Whether a wallet is currently connected */
  connected: boolean
  /** Whether a wallet connection attempt is in progress */
  isConnecting: boolean
  /** The connected wallet's ordinals/taproot public key (hex-encoded) */
  publicKey: string
  /** The connected wallet's ordinals/taproot address */
  address: string
  /** The connected wallet's payment (P2WPKH/P2SH) address */
  paymentAddress: string
  /** The connected wallet's payment public key (hex-encoded) */
  paymentPublicKey: string
  /** The wallet's BTC balance in satoshis, or undefined if not yet fetched */
  balance: number | undefined
  /** The currently active Bitcoin network */
  network: NetworkType
  /** @deprecated Reserved for legacy compatibility */
  library: unknown
  /** The underlying LaserEyes client instance, or null before initialization */
  client: LaserEyesClient | null
  /** The currently connected wallet provider type, or undefined if disconnected */
  provider: ProviderType | undefined
  /** List of account addresses exposed by the connected wallet */
  accounts: string[]

  /** Whether the Unisat wallet extension is detected */
  hasUnisat: boolean
  /** Whether the Xverse wallet extension is detected */
  hasXverse: boolean
  /** Whether the Orange wallet extension is detected */
  hasOrange: boolean
  /** Whether the OpNet wallet extension is detected */
  hasOpNet: boolean
  /** Whether the OYL wallet extension is detected */
  hasOyl: boolean
  /** Whether the Magic Eden wallet extension is detected */
  hasMagicEden: boolean
  /** Whether the OKX wallet extension is detected */
  hasOkx: boolean
  /** Whether the Sparrow wallet extension is detected */
  hasSparrow: boolean
  /** Whether the Leather wallet extension is detected */
  hasLeather: boolean
  /** Whether the Phantom wallet extension is detected */
  hasPhantom: boolean
  /** Whether the Wizz wallet extension is detected */
  hasWizz: boolean
  /** Whether the Tokeo wallet extension is detected */
  hasTokeo: boolean
  /** Whether the Keplr wallet extension is detected */
  hasKeplr: boolean
  /** Whether the Binance wallet extension is detected */
  hasBinance: boolean

  /** Connects to the specified wallet provider */
  connect: (walletName: ProviderType) => Promise<void>
  /** Disconnects the currently connected wallet */
  disconnect: () => void
  /** Requests account addresses from the connected wallet */
  requestAccounts: () => Promise<string[]>
  /** Returns the network name reported by the connected wallet */
  getNetwork: () => Promise<string | undefined>
  /** Switches the active Bitcoin network */
  switchNetwork: (network: NetworkType) => Promise<void>
  /** Returns the public key from the connected wallet */
  getPublicKey: () => Promise<string>
  /** Returns the wallet's BTC balance as a string (in satoshis) */
  getBalance: () => Promise<string>
  /** Returns token balances for the given meta-protocol (e.g., Runes, BRC-20) */
  getMetaBalances: (protocol: Protocol) => Promise<unknown>
  /** Returns inscriptions owned by the connected wallet */
  getInscriptions: (offset?: number, limit?: number) => Promise<Inscription[]>
  /** Sends BTC to a recipient address */
  sendBTC: LaserEyesClient['sendBTC']
  /** Signs a message using the connected wallet */
  signMessage: LaserEyesClient['signMessage']
  /** Signs a PSBT using the connected wallet */
  signPsbt: LaserEyesClient['signPsbt']
  /** Signs multiple PSBTs in a single request */
  signPsbts: LaserEyesClient['signPsbts']
  /** Broadcasts a signed PSBT to the Bitcoin network */
  pushPsbt: LaserEyesClient['pushPsbt']
  /** Creates an on-chain inscription with the given content */
  inscribe: LaserEyesClient['inscribe']
  /** Sends tokens using the specified protocol (Runes, BRC-20, etc.) */
  send: LaserEyesClient['send']
  /** Transfers inscriptions to a recipient address */
  sendInscriptions: LaserEyesClient['sendInscriptions']
  /** Returns the UTXOs for a given Bitcoin address */
  getUtxos: (address: string) => Promise<MempoolUtxo[]>
}
