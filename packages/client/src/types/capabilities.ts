import type { AlkaneBalance, AlkaneOutpoint } from './alkane'
import type { Brc20Balance, Brc20Info } from './brc20'
import type { PaginatedResult, PaginationParams } from './data-source'
import type { FeeEstimate } from './fees'
import type { Inscription, InscriptionInfo } from './inscription'
import type { OrdOutputWrapper, RuneBalance, RuneInfo, RuneOutpoint } from './rune'
import type { Transaction } from './transaction'
import type { FormattedUTXO, UTXO } from './utxo'

/**
 * Core Bitcoin capability providing fundamental blockchain operations.
 *
 * @remarks
 * Every vendor data source must implement this capability. It is the foundation
 * upon which all other capabilities (runes, inscriptions, etc.) are built.
 */
export interface BaseCapability {
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
 * Capability for querying Bitcoin Ordinal inscriptions.
 *
 * @remarks
 * Available via sandshrew and maestro vendor data sources.
 */
export interface InscriptionCapability {
  /** Lists inscriptions held by an address with optional pagination. */
  inscriptionsGetByAddress(
    address: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Inscription>>
  /** Retrieves detailed metadata for a single inscription by its ID. */
  inscriptionsGetInfo(inscriptionId: string): Promise<InscriptionInfo>
  /** Retrieves metadata for multiple inscriptions in a single call. */
  inscriptionsBatchGetInfo(inscriptionIds: string[]): Promise<InscriptionInfo[]>
}

/**
 * Capability for querying Bitcoin Runes protocol data.
 *
 * @remarks
 * Full support available via sandshrew; maestro provides a partial implementation
 * (only `runesGetById` and `runesGetByName`).
 */
export interface RuneCapability {
  /** Lists rune balances held by an address with optional pagination. */
  runesGetAddressBalances(
    address: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<RuneBalance>>
  /** Retrieves rune metadata by its protocol-assigned ID (e.g., `"840000:1"`). */
  runesGetById(runeId: string): Promise<RuneInfo>
  /** Retrieves rune metadata by its spaced name (e.g., `"UNCOMMON.GOODS"`). */
  runesGetByName(runeName: string): Promise<RuneInfo>
  /** Lists outpoints containing a specific rune for a given address. */
  runesGetOutpoints(
    params: { address: string; runeId: string },
    pagination?: PaginationParams
  ): Promise<PaginatedResult<RuneOutpoint>>
  /** Retrieves ord output details for multiple outpoints filtered by rune name. */
  runesBatchGetOutputs(params: {
    outpoints: string[]
    runeName: string
  }): Promise<OrdOutputWrapper[]>
}

/**
 * Capability for querying BRC-20 fungible token data.
 *
 * @remarks
 * Available via the maestro vendor data source.
 */
export interface Brc20Capability {
  /** Lists BRC-20 token balances held by an address with optional pagination. */
  brc20GetAddressBalances(
    address: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Brc20Balance>>
  /** Retrieves BRC-20 token metadata by its ticker symbol. */
  brc20GetByTicker(ticker: string): Promise<Brc20Info>
}

/**
 * Capability for querying Alkanes protocol data.
 *
 * @remarks
 * Available via the sandshrew vendor data source.
 */
export interface AlkaneCapability {
  /** Lists alkane token balances held by an address with optional pagination. */
  alkanesGetAddressBalances(
    address: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<AlkaneBalance>>
  /** Lists alkane outpoints (UTXOs containing alkane tokens) for an address with optional pagination. */
  alkanesGetByAddress(
    address: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<AlkaneOutpoint>>
}

/**
 * Capability for querying the ord indexer for address and UTXO details.
 *
 * @remarks
 * Available via the sandshrew vendor data source, which exposes the ord indexer.
 */
export interface OrdCapability {
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
