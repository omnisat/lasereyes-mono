export interface AlkaneBalance {
  id: string
  balance: bigint
  name?: string
  symbol?: string
}

export interface AlkaneOutpoint {
  runes: Array<{
    rune: {
      id: { block: string; tx: string }
      name: string
      spacedName: string
      divisibility: number
      spacers: number
      symbol: string
    }
    balance: string
  }>
  outpoint: { txid: string; vout: number }
  output: { value: string; script: string }
  txindex: number
  height: number
}
