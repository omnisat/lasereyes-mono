/**
 * An unspent transaction output (UTXO) as returned by mempool-style APIs.
 */
export interface UTXO {
  /** The transaction ID containing this output. */
  txid: string
  /** The output index within the transaction. */
  vout: number
  /** Confirmation status and block details. */
  status: {
    /** Whether this UTXO's transaction has been confirmed. */
    confirmed: boolean
    /** The block height at which this transaction was confirmed. */
    block_height: number
    /** The hash of the block containing this transaction. */
    block_hash: string
    /** The UNIX timestamp of the block containing this transaction. */
    block_time: number
  }
  /** The value of this output in satoshis. */
  value: number
}

/**
 * A UTXO enriched with metadata about runes, alkanes, and inscriptions it contains.
 *
 * @remarks
 * Produced by the {@link OrdCapability.ordGetFormattedUtxos | ordGetFormattedUtxos} method.
 */
export interface FormattedUTXO {
  /** The transaction hash (txid). */
  txHash: string
  /** The output index within the transaction. */
  txOutputIndex: number
  /** The BTC value of this output in satoshis. */
  btcValue: number
  /** The hex-encoded scriptPubKey locking this output. */
  scriptPubKey: string
  /** The address that owns this output. */
  address: string
  /** Number of confirmations, if known. */
  confirmations?: number
  /** Whether this UTXO contains any rune balances. */
  hasRunes: boolean
  /** Rune balances attached to this UTXO. */
  runes: FormattedRune[]
  /** Whether this UTXO contains any alkane balances. */
  hasAlkanes: boolean
  /** Alkane balances attached to this UTXO. */
  alkanes: FormattedAlkane[]
  /** Whether this UTXO contains any inscriptions. */
  hasInscriptions: boolean
  /** Inscriptions attached to this UTXO. */
  inscriptions: FormattedInscription[]
}

/** A rune balance attached to a formatted UTXO. */
export interface FormattedRune {
  /** The rune's protocol-assigned ID (e.g., `"840000:1"`). */
  runeId: string
  /** The rune balance amount in base units. */
  amount: number
}

/** An alkane balance attached to a formatted UTXO. */
export interface FormattedAlkane {
  /** The alkane token ID. */
  id: string
  /** The alkane balance amount in base units. */
  amount: number
  /** The alkane token name. */
  name: string
  /** The alkane token symbol. */
  symbol: string
}

/** An inscription reference attached to a formatted UTXO. */
export interface FormattedInscription {
  /** The inscription ID (format: `txid` + `i` + `index`). */
  inscriptionId: string
}
