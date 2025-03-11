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
