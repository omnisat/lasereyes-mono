/** A rune balance held by an address. */
export interface RuneBalance {
  /** The rune name (unspaced). */
  name: string
  /** The balance amount as a string (to handle large numbers). */
  balance: string
  /** The rune's display symbol. */
  symbol: string
}

/**
 * Detailed metadata about a rune, as returned by the ord indexer.
 */
export interface RuneInfo {
  /** The rune's registry entry containing etching and minting details. */
  entry: {
    /** The block height at which this rune was etched. */
    block: number
    /** Total amount of this rune that has been burned. */
    burned: number
    /** Number of decimal places for display purposes. */
    divisibility: number
    /** The transaction ID of the etching transaction. */
    etching: string
    /** Total number of times this rune has been minted. */
    mints: number
    /** The rune's ordinal number in the protocol registry. */
    number: number
    /** The amount premined during the etching transaction. */
    premine: number
    /** The rune name with spacer characters (e.g., `"UNCOMMON.GOODS"`). */
    spaced_rune: string
    /** The rune's display symbol. */
    symbol: string
    /** The minting terms defining supply and height constraints. */
    terms: {
      /** Amount of rune issued per mint. */
      amount: number
      /** Maximum number of mints allowed. */
      cap: number
      /** Block height constraints for minting. */
      height: unknown[]
      /** Block offset constraints for minting. */
      offset: unknown[]
    }
    /** UNIX timestamp of the etching block. */
    timestamp: number
    /** Whether this rune uses the Turbo flag for future protocol upgrades. */
    turbo: boolean
  }
  /** The rune's protocol-assigned ID (e.g., `"840000:1"`). */
  id: string
  /** Whether this rune can currently be minted. */
  mintable: boolean
  /** The parent inscription ID, if this rune was etched with a parent. */
  parent: string
}

/** A UTXO outpoint containing rune balances. */
export interface RuneOutpoint {
  /** The outpoint in `txid:vout` format. */
  output: string
  /** The wallet address that owns this outpoint. */
  wallet_addr: string
  /** Rune balance amounts (corresponding to `rune_ids` by index). */
  balances: number[]
  /** Decimal places for each rune balance (corresponding to `rune_ids` by index). */
  decimals: number[]
  /** The rune IDs held in this outpoint. */
  rune_ids: string[]
  /** Hex-encoded scriptPubKey of this output. */
  script: string
  /** The satoshi value of this output. */
  value: number
}

/** A UTXO output as returned by the ord indexer, including inscription and rune data. */
export interface OrdOutput {
  /** The address that owns this output. */
  address: string
  /** Whether this output has been indexed by the ord indexer. */
  indexed: boolean
  /** Inscription IDs attached to this output. */
  inscriptions: string[]
  /** Rune balances mapped by name, or as nested arrays. */
  runes: Record<string, { amount: number; divisibility: number }> | unknown[][]
  /** Sat ranges contained in this output. */
  sat_ranges: number[][]
  /** Hex-encoded scriptPubKey. */
  script_pubkey: string
  /** Whether this output has been spent. */
  spent: boolean
  /** The transaction ID containing this output. */
  transaction: string
  /** The satoshi value of this output. */
  value: number
  /** The outpoint in `txid:vout` format, if available. */
  output?: string
}

/** Wrapper around an {@link OrdOutput} result from batch queries. */
export interface OrdOutputWrapper {
  /** The ord output data. */
  result: OrdOutput
}
