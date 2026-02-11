export interface RuneBalance {
  name: string
  balance: string
  symbol: string
}

export interface RuneInfo {
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
    terms: {
      amount: number
      cap: number
      height: unknown[]
      offset: unknown[]
    }
    timestamp: number
    turbo: boolean
  }
  id: string
  mintable: boolean
  parent: string
}

export interface RuneOutpoint {
  output: string
  wallet_addr: string
  balances: number[]
  decimals: number[]
  rune_ids: string[]
  script: string
  value: number
}

export interface OrdOutput {
  address: string
  indexed: boolean
  inscriptions: string[]
  runes: Record<string, { amount: number; divisibility: number }> | unknown[][]
  sat_ranges: number[][]
  script_pubkey: string
  spent: boolean
  transaction: string
  value: number
  output?: string
}

export interface OrdOutputWrapper {
  result: OrdOutput
}
