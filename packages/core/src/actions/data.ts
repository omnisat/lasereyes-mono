/**
 * Data (read) actions for LaserEyes Core.
 *
 * @remarks
 * These actions use smart routing:
 * - **Provider-first** methods try the connected wallet's injected provider before
 *   falling back to the configured data-source client.
 * - **Client-only** methods skip the provider entirely and go straight to the client.
 *
 * @module actions/data
 */

import type { LaserEyesCore } from '../core'
import type { PaginatedResult } from '@omnisat/lasereyes-client'

// ============================================================================
// Provider-first helpers
// ============================================================================

/**
 * Try to call a method on the currently connected provider.
 * Returns `undefined` if no connector is active, the method is not supported,
 * or the provider throws.
 */
async function tryProvider<T>(
  core: LaserEyesCore,
  method: string,
  params: Record<string, unknown> = {}
): Promise<T | undefined> {
  const connector = core.$connector.get()
  if (!connector) return undefined
  try {
    return (await connector.getProvider().request({ method, params })) as T
  } catch {
    // Method not supported by provider — fall through to client
    return undefined
  }
}

// ============================================================================
// Provider-first actions
// ============================================================================

/**
 * Get the Bitcoin balance for an address (in satoshis, as a string).
 *
 * @remarks
 * Tries the connected wallet's provider first (`bitcoin_getBalance`).
 * Falls back to the configured data-source client on failure.
 *
 * @param core - LaserEyesCore instance
 * @param address - Bitcoin address to query
 * @returns Balance in satoshis as a decimal string
 *
 * @throws {Error} If no wallet is connected AND no data sources are configured.
 */
export async function getBalance(core: LaserEyesCore, address: string): Promise<string> {
  const providerResult = await tryProvider<string>(core, 'bitcoin_getBalance', { address })
  if (providerResult !== undefined) return providerResult
  return core.getClient().btcGetBalance(address)
}

/**
 * Get unspent transaction outputs for an address.
 *
 * @remarks
 * Tries the connected wallet's provider first (`bitcoin_getUtxos`).
 * Falls back to the configured data-source client on failure.
 *
 * @param core - LaserEyesCore instance
 * @param address - Bitcoin address to query
 * @returns Paginated list of UTXOs
 *
 * @throws {Error} If no wallet is connected AND no data sources are configured.
 */
export async function getAddressUtxos(
  core: LaserEyesCore,
  address: string
): Promise<PaginatedResult<any>> {
  const providerResult = await tryProvider<PaginatedResult<any>>(
    core,
    'bitcoin_getUtxos',
    { address }
  )
  if (providerResult !== undefined) return providerResult
  return core.getClient().btcGetAddressUtxos(address)
}

/**
 * Get current inscriptions for an address.
 *
 * @remarks
 * Always tries the connected wallet's provider first (`bitcoin_getInscriptions`).
 * No client fallback — inscriptions data requires a configured inscriptions data source.
 *
 * @param core - LaserEyesCore instance
 * @param address - Bitcoin address to query
 * @param offset - Pagination offset
 * @param limit - Pagination limit
 * @returns Array of inscriptions
 *
 * @throws {Error} If neither provider nor client can satisfy the request.
 */
export async function getInscriptions(
  core: LaserEyesCore,
  address: string,
  offset?: number,
  limit?: number
): Promise<any[]> {
  const params: Record<string, unknown> = { address }
  if (offset !== undefined) params.offset = offset
  if (limit !== undefined) params.limit = limit
  const providerResult = await tryProvider<any[]>(core, 'bitcoin_getInscriptions', params)
  if (providerResult !== undefined) return providerResult
  throw new Error(
    'getInscriptions: wallet provider did not support this method and no inscriptions data source is configured'
  )
}

/**
 * Get Runes token balances for an address.
 *
 * @remarks
 * Always tries the connected wallet's provider first (`bitcoin_getRunesBalances`).
 *
 * @param core - LaserEyesCore instance
 * @param address - Bitcoin address to query
 * @returns Array of Rune balances
 *
 * @throws {Error} If neither provider nor client can satisfy the request.
 */
export async function getRunesBalances(core: LaserEyesCore, address: string): Promise<any[]> {
  const providerResult = await tryProvider<any[]>(core, 'bitcoin_getRunesBalances', { address })
  if (providerResult !== undefined) return providerResult
  throw new Error(
    'getRunesBalances: wallet provider did not support this method and no runes data source is configured'
  )
}

/**
 * Get BRC-20 token balances for an address.
 *
 * @remarks
 * Always tries the connected wallet's provider first (`bitcoin_getBrc20Balances`).
 *
 * @param core - LaserEyesCore instance
 * @param address - Bitcoin address to query
 * @returns Array of BRC-20 balances
 *
 * @throws {Error} If neither provider nor client can satisfy the request.
 */
export async function getBrc20Balances(core: LaserEyesCore, address: string): Promise<any[]> {
  const providerResult = await tryProvider<any[]>(core, 'bitcoin_getBrc20Balances', { address })
  if (providerResult !== undefined) return providerResult
  throw new Error(
    'getBrc20Balances: wallet provider did not support this method and no BRC-20 data source is configured'
  )
}

/**
 * Get Alkanes token balances for an address.
 *
 * @remarks
 * Always tries the connected wallet's provider first (`bitcoin_getAlkanesBalances`).
 *
 * @param core - LaserEyesCore instance
 * @param address - Bitcoin address to query
 * @returns Array of Alkane balances
 *
 * @throws {Error} If neither provider nor client can satisfy the request.
 */
export async function getAlkanesBalances(core: LaserEyesCore, address: string): Promise<any[]> {
  const providerResult = await tryProvider<any[]>(core, 'bitcoin_getAlkanesBalances', { address })
  if (providerResult !== undefined) return providerResult
  throw new Error(
    'getAlkanesBalances: wallet provider did not support this method and no alkanes data source is configured'
  )
}

// ============================================================================
// Client-only actions (never route to provider)
// ============================================================================

/**
 * Get the recommended fee rates from the configured data source.
 *
 * @remarks
 * Always uses the data-source client. Wallets do not expose fee estimation.
 *
 * @param core - LaserEyesCore instance
 * @returns Fee estimates (fastest, half-hour, hour, economy, minimum)
 *
 * @throws {Error} If no data sources are configured for the current network.
 */
export async function getRecommendedFees(core: LaserEyesCore) {
  return core.getClient().btcGetRecommendedFees()
}

/**
 * Get full transaction details by transaction ID.
 *
 * @remarks
 * Always uses the data-source client.
 *
 * @param core - LaserEyesCore instance
 * @param txId - Transaction ID
 * @returns Transaction details
 *
 * @throws {Error} If no data sources are configured for the current network.
 */
export async function getTransaction(core: LaserEyesCore, txId: string) {
  return core.getClient().btcGetTransaction(txId)
}

/**
 * Broadcast a signed raw transaction to the Bitcoin network.
 *
 * @remarks
 * Always uses the data-source client.
 *
 * @param core - LaserEyesCore instance
 * @param rawTx - Signed raw transaction hex
 * @returns Transaction ID
 *
 * @throws {Error} If no data sources are configured for the current network.
 */
export async function broadcastTransaction(core: LaserEyesCore, rawTx: string): Promise<string> {
  return core.getClient().btcBroadcastTransaction(rawTx)
}
