/**
 * A Bitcoin transaction in the mempool/esplora API format.
 *
 * @remarks
 * This structure follows the Esplora/Mempool.space transaction format,
 * providing full details including inputs, outputs, and confirmation status.
 */
export interface Transaction {
  /** The transaction ID (double SHA-256 hash, reversed). */
  txid: string
  /** The transaction version number. */
  version: number
  /** The transaction locktime value. */
  locktime: number
  /** The transaction inputs. */
  vin: Array<{
    /** The txid of the input being spent. */
    txid: string
    /** The output index of the input being spent. */
    vout: number
    /** Details about the previous output being spent. */
    prevout: {
      /** Hex-encoded scriptPubKey of the previous output. */
      scriptpubkey: string
      /** Human-readable ASM representation of the scriptPubKey. */
      scriptpubkey_asm: string
      /** The script type (e.g., `'v0_p2wpkh'`, `'v1_p2tr'`). */
      scriptpubkey_type: string
      /** The address derived from the scriptPubKey. */
      scriptpubkey_address: string
      /** The value of the previous output in satoshis. */
      value: number
    }
    /** Hex-encoded scriptSig (empty for SegWit inputs). */
    scriptsig: string
    /** Human-readable ASM representation of the scriptSig. */
    scriptsig_asm: string
    /** Segregated witness data, if present. */
    witness?: Array<string>
    /** Whether this input is a coinbase input. */
    is_coinbase: boolean
    /** The sequence number of the input. */
    sequence: number
  }>
  /** The transaction outputs. */
  vout: Array<{
    /** Hex-encoded scriptPubKey. */
    scriptpubkey: string
    /** Human-readable ASM representation of the scriptPubKey. */
    scriptpubkey_asm: string
    /** The script type (e.g., `'v0_p2wpkh'`, `'v1_p2tr'`). */
    scriptpubkey_type: string
    /** The address derived from the scriptPubKey. */
    scriptpubkey_address: string
    /** The output value in satoshis. */
    value: number
  }>
  /** The transaction size in bytes. */
  size: number
  /** The transaction weight in weight units (WU). */
  weight: number
  /** The transaction fee in satoshis. */
  fee: number
  /** Confirmation status and block details. */
  status: {
    /** Whether this transaction has been confirmed. */
    confirmed: boolean
    /** The block height at which this transaction was confirmed. */
    block_height: number
    /** The hash of the block containing this transaction. */
    block_hash: string
    /** The UNIX timestamp of the block containing this transaction. */
    block_time: number
  }
}
