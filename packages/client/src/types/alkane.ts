/** An alkane token balance held by an address. */
export interface AlkaneBalance {
  /** The alkane token ID. */
  id: string
  /** The balance amount as a BigInt (alkanes can have very large values). */
  balance: bigint
  /** The alkane token name, if known. */
  name?: string
  /** The alkane token symbol, if known. */
  symbol?: string
}

/** A UTXO outpoint containing alkane token data, as returned by the Alkanes protocol indexer. */
export interface AlkaneOutpoint {
  /** Alkane (rune-like) balances attached to this outpoint. */
  runes: Array<{
    /** The alkane/rune metadata. */
    rune: {
      /** The alkane ID composed of block and transaction index. */
      id: { block: string; tx: string }
      /** The alkane name. */
      name: string
      /** The alkane name with spacer characters. */
      spacedName: string
      /** Number of decimal places for display. */
      divisibility: number
      /** Bitmask of spacer positions in the name. */
      spacers: number
      /** The alkane display symbol. */
      symbol: string
    }
    /** The balance amount as a decimal string. */
    balance: string
  }>
  /** The UTXO outpoint reference. */
  outpoint: { txid: string; vout: number }
  /** The output's value and script. */
  output: { value: string; script: string }
  /** The transaction's index within its block. */
  txindex: number
  /** The block height containing this outpoint. */
  height: number
}
