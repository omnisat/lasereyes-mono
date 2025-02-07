export interface OrdOutputs {
  result: OrdOutput;
}

export type OrdOutputRune = {
  amount: number
  divisibility: number
}

export interface OrdOutput {
  address: string
  indexed: boolean
  inscriptions: string[]
  runes: Record<string, OrdOutputRune> | OrdOutputRune[][]
  sat_ranges: number[][]
  script_pubkey: string
  spent: boolean
  transaction: string
  value: number
  output?: string
}

export type RuneBalance = {
  name: string;
  balance: string;
  symbol: string;
};

export type OrdAddressResponse = {
  jsonrpc: string
  id: number
  result: OrdAddress
}

export type OrdAddress = {
  outputs: Array<string>
  inscriptions: Array<string>
  sat_balance: number
  runes_balances: Array<Array<string>>
}

export type OrdRune = {
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
      height: Array<any>
      offset: Array<any>
    }
    timestamp: number
    turbo: boolean
  }
  id: string
  mintable: boolean
  parent: string
}
