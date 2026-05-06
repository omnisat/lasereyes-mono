/**
 * Read-only Bitcoin actions — the public-client surface.
 *
 * @remarks
 * These actions wrap the {@link BaseCapability} methods of a chain data
 * source. They require no account and no signer; just a {@link Client}
 * configured with a data source that exposes the relevant base methods.
 *
 * Each action is a free function `(client, …args) => Promise<T>` with
 * generic constraints declaring exactly which `BaseCapability` methods
 * the data source must expose.
 *
 * Use the {@link publicActions} factory to bundle them onto a client.
 *
 * @module actions/public
 */

import type { Client, ClientConfig } from '../../client/types'
import type { ActionGroup, BaseCapability } from '../../data-source/capabilities'
import type {
  FeeEstimate,
  PaginatedResult,
  PaginationParams,
  Transaction,
  UTXO,
} from '../../types'

// ============================================================================
// Strict actions
// ============================================================================

/**
 * Get the confirmed balance for an address (in satoshis, as a string).
 */
export async function getBalance<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetBalance'>,
>(client: Client<Config, DS, Actions>, address: string): Promise<string> {
  return client.config.dataSource.btcGetBalance(address)
}

/**
 * List unspent transaction outputs for an address.
 */
export async function getUtxos<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos'>,
>(
  client: Client<Config, DS, Actions>,
  address: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<UTXO>> {
  return client.config.dataSource.btcGetAddressUtxos(address, pagination)
}

/**
 * Fetch full transaction details by transaction ID.
 */
export async function getTransaction<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetTransaction'>,
>(client: Client<Config, DS, Actions>, txId: string): Promise<Transaction> {
  return client.config.dataSource.btcGetTransaction(txId)
}

/**
 * Broadcast a signed raw transaction. Returns the transaction ID.
 */
export async function broadcastTransaction<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcBroadcastTransaction'>,
>(client: Client<Config, DS, Actions>, rawTx: string): Promise<string> {
  return client.config.dataSource.btcBroadcastTransaction(rawTx)
}

/**
 * Fetch current recommended fee rates.
 */
export async function getRecommendedFees<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetRecommendedFees'>,
>(client: Client<Config, DS, Actions>): Promise<FeeEstimate> {
  return client.config.dataSource.btcGetRecommendedFees()
}

/**
 * Get the satoshi value of a specific transaction output.
 */
export async function getOutputValue<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetOutputValue'>,
>(client: Client<Config, DS, Actions>, txId: string, vout: number): Promise<number | null> {
  return client.config.dataSource.btcGetOutputValue(txId, vout)
}

/**
 * Poll until a transaction is confirmed on-chain.
 */
export async function waitForTransaction<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcWaitForTransaction'>,
>(client: Client<Config, DS, Actions>, txId: string): Promise<boolean> {
  return client.config.dataSource.btcWaitForTransaction(txId)
}

// ============================================================================
// Strict factory — accepts a client whose data source has full BaseCapability
// ============================================================================

/**
 * Action-group factory bundling all read-only Bitcoin operations onto a client.
 *
 * @remarks
 * Requires a data source implementing the full {@link BaseCapability}.
 *
 * @example
 * ```ts
 * import { createClient, publicActions, MAINNET } from '@omnisat/lasereyes-client'
 * import { createDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * const ds = createDataSource({ network: MAINNET })
 * const client = createClient({ network: MAINNET, dataSource: ds })
 *   .extend(publicActions())
 *
 * const balance = await client.getBalance('bc1q...')
 * const fees = await client.getRecommendedFees()
 * ```
 */
export function publicActions() {
  return <
    Config extends ClientConfig<DS>,
    DS extends BaseCapability,
    Actions extends ActionGroup,
  >(
    client: Client<Config, DS, Actions>
  ) => ({
    getBalance: (address: string) => getBalance(client, address),
    getUtxos: (address: string, pagination?: PaginationParams) =>
      getUtxos(client, address, pagination),
    getTransaction: (txId: string) => getTransaction(client, txId),
    broadcastTransaction: (rawTx: string) => broadcastTransaction(client, rawTx),
    getRecommendedFees: () => getRecommendedFees(client),
    getOutputValue: (txId: string, vout: number) => getOutputValue(client, txId, vout),
    waitForTransaction: (txId: string) => waitForTransaction(client, txId),
  })
}
