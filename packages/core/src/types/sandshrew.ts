export interface SingleRuneOutpoint {
  output: string
  wallet_addr: string
  balances: number[]
  decimals: number[]
  rune_ids: string[]
  script: string
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

export interface SandshrewSpendableUtxo {
  outpoint: string
  value: number
  height: number
}

export interface SandshrewRuneId {
  block: string
  tx: string
}

export interface SandshrewRune {
  id: SandshrewRuneId
  name: string
  spacedName: string
  divisibility: number
  spacers: number
  symbol: string
}

export interface SandshrewRuneBalance {
  rune: SandshrewRune
  balance: string
}

export interface SandshrewOrdRune {
  amount: number
  divisibility: number
  symbol: string
}

export interface SandshrewAssetUtxo {
  outpoint: string
  value: number
  height: number
  inscriptions?: string[]
  ord_runes?: Record<string, SandshrewOrdRune>
  runes?: SandshrewRuneBalance[]
}

export interface SandshrewBalancesResult {
  spendable: SandshrewSpendableUtxo[]
  assets: SandshrewAssetUtxo[]
  pending: SandshrewAssetUtxo[]
  ordHeight: number
  metashrewHeight: number
}

export interface SandshrewBalancesResponse {
  id: string
  result: SandshrewBalancesResult
  jsonrpc: string
}
