import type { PaginatedResult, PaginationParams } from './data-source'
import type { FeeEstimate } from './fees'
import type { Transaction } from './transaction'
import type { FormattedUTXO, UTXO } from './utxo'

export type ActionGroup = Record<string, (...args: any[]) => any>

/**
 * Core Bitcoin capability providing fundamental blockchain operations.
 *
 * @remarks
 * Every vendor data source must implement this capability. It is the foundation
 * upon which all other capabilities (runes, inscriptions, etc.) are built.
 */
export interface BaseCapability extends ActionGroup {
  /** Retrieves the confirmed balance for an address, returned as a string of satoshis. */
  btcGetBalance(address: string): Promise<string>
  /** Lists unspent transaction outputs for an address with optional pagination. */
  btcGetAddressUtxos(address: string, pagination?: PaginationParams): Promise<PaginatedResult<UTXO>>
  /** Fetches full transaction details by transaction ID. */
  btcGetTransaction(txId: string): Promise<Transaction>
  /** Broadcasts a signed raw transaction hex to the network. Returns the transaction ID. */
  btcBroadcastTransaction(rawTx: string): Promise<string>
  /** Fetches current recommended fee rates (fast and minimum). */
  btcGetRecommendedFees(): Promise<FeeEstimate>
  /** Returns the satoshi value of a specific transaction output, or `null` if not found. */
  btcGetOutputValue(txId: string, vout: number): Promise<number | null>
  /** Polls until a transaction is confirmed on-chain. Returns `true` when confirmed. */
  btcWaitForTransaction(txId: string): Promise<boolean>
}

/**
 * Capability for querying the ord indexer for address and UTXO details.
 *
 * @remarks
 * Available via the sandshrew vendor data source, which exposes the ord indexer.
 */
export interface OrdCapability extends ActionGroup {
  /** Retrieves ord-indexed address information including inscriptions, outputs, and rune balances. */
  ordGetAddress(address: string): Promise<OrdAddressInfo>
  /** Lists formatted UTXOs with embedded rune, alkane, and inscription metadata. */
  ordGetFormattedUtxos(
    address: string | string[],
    pagination?: PaginationParams
  ): Promise<PaginatedResult<FormattedUTXO>>
}

/** Address information as returned by the ord indexer. */
export interface OrdAddressInfo {
  /** Transaction outputs owned by this address (in `txid:vout` format). */
  outputs: string[]
  /** Inscription IDs held at this address. */
  inscriptions: string[]
  /** Total satoshi balance as tracked by the ord indexer. */
  sat_balance: number
  /** Rune balances as arrays of `[runeName, amount]` pairs. */
  runes_balances: string[][]
}
