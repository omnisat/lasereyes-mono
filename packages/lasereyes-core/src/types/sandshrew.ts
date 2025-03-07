export interface SingleRuneOutpoint {
  output: string
  wallet_addr: string
  balances: number[]
  decimals: number[]
  rune_ids: string[]
  script: string
  value: number
}

export interface EsploraTx {
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
    witness: Array<string>
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
  fee: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
}

export interface EsploraUtxo {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height?: number
    block_hash?: string
    block_time?: number
  }
  value: number
}

export type SandshrewResponse = {
  jsonrpc: string
  id: number
  result: any
}

export type SandshrewGetRuneByIdOrNameResponse = {
  entry: {
    block: number
    burned: number
    divisibility: number
    etching: string
    mints: number
    number: number
    premine: number
    spaced_rune: string
    symbol: string
    terms: any
    timestamp: number
    turbo: boolean
  }
  id: string
  mintable: boolean
  parent: string
}
