import type {
  BaseCapability,
  Client,
  FeeEstimate,
  PaginatedResult,
  Transaction,
  UTXO,
} from '../types'

/**
 * Action methods for core Bitcoin operations.
 *
 * @remarks
 * These actions require a data source with {@link BaseCapability} methods.
 */
export interface BtcActions {
  /** Retrieves the confirmed balance for an address in satoshis (as a string). */
  btcGetBalance(address: string): Promise<string>
  /** Retrieves the list of unspent transaction outputs for an address. */
  btcGetAddressUtxos(address: string): Promise<PaginatedResult<UTXO>>
  /** Fetches the current recommended fee rates from the data source. */
  btcGetRecommendedFees(): Promise<FeeEstimate>
  /** Retrieves full transaction details by transaction ID. */
  btcGetTransaction(txId: string): Promise<Transaction>
  /** Broadcasts a signed raw transaction hex to the Bitcoin network. Returns the transaction ID. */
  btcBroadcastTransaction(rawTx: string): Promise<string>
  /** Polls until the given transaction is confirmed on-chain. Returns `true` when confirmed. */
  btcWaitForTransaction(txId: string): Promise<boolean>
}

/**
 * Creates a BTC action group factory for use with {@link Client.extend | client.extend()}.
 *
 * Provides core Bitcoin operations such as balance queries, UTXO listing, fee estimation,
 * and transaction broadcasting.
 *
 * @returns A factory function that produces {@link BtcActions} when given a client
 *
 * @example
 * ```ts
 * import { createClient } from '@omnisat/lasereyes-client'
 * import { btcActions } from '@omnisat/lasereyes-client'
 *
 * const client = createClient({ network: MAINNET, dataSource: ds })
 *   .extend(btcActions())
 *
 * const balance = await client.btcGetBalance('bc1q...')
 * const utxos = await client.btcGetAddressUtxos('bc1q...')
 * ```
 */
export function btcActions() {
  return (client: Client<BaseCapability>): BtcActions => {
    const ds = client.dataSource

    return {
      btcGetBalance: (address: string) => ds.btcGetBalance(address),
      btcGetAddressUtxos: (address: string) => ds.btcGetAddressUtxos(address),
      btcGetRecommendedFees: () => ds.btcGetRecommendedFees(),
      btcGetTransaction: (txId: string) => ds.btcGetTransaction(txId),
      btcBroadcastTransaction: (rawTx: string) => ds.btcBroadcastTransaction(rawTx),
      btcWaitForTransaction: (txId: string) => ds.btcWaitForTransaction(txId),
    }
  }
}
