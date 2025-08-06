import type {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  OYLNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import type {
  UNISAT,
  XVERSE,
  OYL,
  MAGIC_EDEN,
  OKX,
  LEATHER,
  PHANTOM,
  WIZZ,
  ORANGE,
  OP_NET,
  SPARROW,
  TOKEO,
  KEPLR,
} from '../constants/wallets'
import type {
  AUDIO_OGG,
  MULTIPART_FORM_DATA,
  APPLICATION_ATOM_XML,
  APPLICATION_FORM_URLENCODED,
  APPLICATION_GZIP,
  APPLICATION_JSON,
  APPLICATION_JAVASCRIPT,
  APPLICATION_OCTET_STREAM,
  APPLICATION_PDF,
  APPLICATION_RSS_XML,
  APPLICATION_XML,
  APPLICATION_XHTML_XML,
  APPLICATION_ZIP,
  AUDIO_MP3,
  AUDIO_WAV,
  IMAGE_GIF,
  IMAGE_ICON,
  IMAGE_JPEG,
  IMAGE_PNG,
  IMAGE_SVG_XML,
  IMAGE_WEBP,
  TEXT_CSS,
  TEXT_HTML,
  TEXT_JAVASCRIPT,
  TEXT_PLAIN,
  VIDEO_MP4,
  VIDEO_OGG,
  VIDEO_WEBM,
  TEXT_MARKDOWN,
} from '../constants/content'
import type { BTC, RUNES, BRC20, ALKANES } from '../constants/protocols'
import type { BaseNetwork } from './network'

export type BaseNetworkType =
  | typeof BaseNetwork.MAINNET
  | typeof BaseNetwork.TESTNET
  | typeof BaseNetwork.TESTNET4
  | typeof BaseNetwork.SIGNET
  | typeof BaseNetwork.FRACTAL_MAINNET
  | typeof BaseNetwork.FRACTAL_TESTNET
  | typeof BaseNetwork.OYLNET

export type NetworkType = BaseNetworkType | string

export type ProviderType =
  | typeof UNISAT
  | typeof XVERSE
  | typeof OYL
  | typeof MAGIC_EDEN
  | typeof OKX
  | typeof LEATHER
  | typeof PHANTOM
  | typeof WIZZ
  | typeof ORANGE
  | typeof OP_NET
  | typeof SPARROW
  | typeof TOKEO
  | typeof KEPLR

export type ContentType =
  | typeof TEXT_HTML
  | typeof TEXT_CSS
  | typeof TEXT_PLAIN
  | typeof TEXT_JAVASCRIPT
  | typeof TEXT_MARKDOWN
  | typeof APPLICATION_JSON
  | typeof APPLICATION_JAVASCRIPT
  | typeof APPLICATION_XML
  | typeof APPLICATION_PDF
  | typeof APPLICATION_ZIP
  | typeof APPLICATION_GZIP
  | typeof APPLICATION_XHTML_XML
  | typeof APPLICATION_RSS_XML
  | typeof APPLICATION_ATOM_XML
  | typeof APPLICATION_FORM_URLENCODED
  | typeof APPLICATION_OCTET_STREAM
  | typeof IMAGE_JPEG
  | typeof IMAGE_PNG
  | typeof IMAGE_GIF
  | typeof IMAGE_SVG_XML
  | typeof IMAGE_WEBP
  | typeof IMAGE_ICON
  | typeof VIDEO_MP4
  | typeof VIDEO_WEBM
  | typeof VIDEO_OGG
  | typeof AUDIO_MP3
  | typeof AUDIO_WAV
  | typeof AUDIO_OGG
  | typeof MULTIPART_FORM_DATA

export type Config = {
  network?:
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET
    | typeof OYLNET
    | string
  dataSources?: {
    mempool?: {
      url: string
      networks?: {
        mainnet: {
          apiUrl: string
        }
        [key: string]: {
          apiUrl: string
        }
      }
    }
    sandshrew?: {
      url?: string
      apiKey?: string
      networks?: {
        mainnet?: {
          apiKey: string
          apiUrl: string
        }
        [key: string]:
          | {
              apiKey: string
              apiUrl: string
            }
          | undefined
      }
    }
    esplora?: string
    maestro?: {
      apiKey?: string
      testnetApiKey?: string
      networks?: {
        mainnet: {
          apiKey: string
          apiUrl: string
        }
        [key: string]: {
          apiKey: string
          apiUrl: string
        }
      }
    }
  }
  customNetworks?: {
    [key: string]: {
      baseNetwork: BaseNetworkType
      preferredDataSource: 'mempool' | 'sandshrew' | 'maestro' | string
    }
  }
}

export type SendArgs =
  | BTCSendArgs
  | RuneSendArgs
  | Brc20SendArgs
  | AlkaneSendArgs

export type Protocol = typeof BTC | typeof RUNES | typeof BRC20 | typeof ALKANES

export interface BTCSendArgs {
  fromAddress: string
  toAddress: string
  amount: number
  network: NetworkType
}

export * from './lasereyes'

export interface RuneSendArgs {
  runeId: string
  fromAddress: string
  toAddress: string
  amount: number
  network: NetworkType
}

export interface Brc20SendArgs {
  ticker: string
  fromAddress: string
  toAddress: string
  amount: number
  network: NetworkType
}

export interface AlkaneSendArgs {
  id: string
  fromAddress: string
  toAddress: string
  amount: bigint
  network: NetworkType
}

export interface OYLBalanceResponse {
  brc20s: {
    total: number
  }
  btc: {
    pending: number
    confirmed: number
    total: number
  }
  overall: {
    pending: number
    confirmed: number
    total: number
  }
}

export interface LeatherRPCResponse {
  jsonrpc: string
  id: string
  result: LeatherRequestAddressResponse | LeatherRequestSignResponse
  error?: LeatherError
}

export interface LeatherRequestAddressResponse {
  addresses: LeatherAddress[]
}

export interface LeatherRequestSignResponse {
  hex: string
  txid: string
  signature: string
}

export interface LeatherError {
  code: number
  message: string
}

export interface LeatherAddress {
  symbol: string
  type?: string
  address: string
  publicKey?: string
  derivationPath?: string
  tweakedPublicKey?: string
}

export interface SignPsbtRequestParams {
  hex: string
  signAtIndex?: number | number[]
  broadcast?: boolean
  network?: string
  account?: number
}

export interface BlockchainInfoResponse {
  notice: string
  unspent_outputs: BlockchainInfoUTXO[]
}

export interface BlockchainInfoUTXO {
  tx_hash_big_endian: string
  tx_hash: string
  tx_output_n: number
  script: string
  value: number
  value_hex: string
  confirmations: number
  tx_index: number
}

export interface MempoolUtxo {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
  value: number
}

export type PhantomBtcAccount = {
  address: string
  addressType: 'p2tr' | 'p2wpkh' | 'p2sh' | 'p2pkh'
  publicKey: string
  purpose: 'payment' | 'ordinals'
}

export type WizzBalanceResponse = {
  unconfirmed: number
  confirmed: number
  total: number
}

export interface UTXO {
  tx_hash_big_endian: string
  tx_hash: string
  tx_output_n: number
  script: string
  value: number
  value_hex: string
  confirmations: number
  tx_index: number
}

export interface CommitPsbtResponse {
  inscriberAddress: string
  psbtHex: string
  psbtBase64: string
  feeRate: number
  totalFees: number
}

export interface MempoolTransaction {
  txid: string
  version: number
  locktime: number
  vin: Vin[]
  vout: Vout[]
  size: number
  weight: number
  sigops: number
  fee: number
  status: Status
}

export interface Vin {
  txid: string
  vout: number
  prevout: Prevout
  scriptsig: string
  scriptsig_asm: string
  is_coinbase: boolean
  sequence: number
}

export interface Prevout {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
}

export interface Vout {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
}

export interface Status {
  confirmed: boolean
  block_height: number
  block_hash: string
  block_time: number
}

export interface MempoolTransactionResponse {
  txid: string
  version: number
  locktime: number
  vin: Array<{
    txid: string
    vout: number
    prevout: {
      scriptpubkey: string
      scriptpubkey_asm: string
      scriptpubkey_type: string
      scriptpubkey_address: string
      value: number
    }
    scriptsig: string
    scriptsig_asm: string
    is_coinbase: boolean
    sequence: number
  }>
  vout: Array<{
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_type: string
    scriptpubkey_address: string
    value: number
  }>
  size: number
  weight: number
  sigops: number
  fee: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
}

export interface Rune {
  rune: {
    id: { block: string; tx: string }
    name: string
    spacedName: string
    divisibility: number
    spacers: number
    symbol: string
  }
  balance: string
}

export interface AlkanesOutpoint {
  runes: Rune[]
  outpoint: { txid: string; vout: number }
  output: { value: string; script: string }
  txindex: number
  height: number
}

export * from './network'
export * from './lasereyes'
export * from './esplora'
export * from './mempool-space'
export * from './sandshrew'
export * from './maestro'
export * from './ord'
export * from './data-source'
export * from './alkane'
export * from './utxo'
