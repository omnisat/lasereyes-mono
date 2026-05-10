/**
 * Data (read) actions over `LaserEyesConfig`.
 *
 * @remarks
 * Three patterns:
 *
 * - **Provider-first / client-fallback** (`getBalance`, `getAddressUtxos`):
 *   try the active connector's `request(method, params)` first. If no
 *   connector or the request fails, fall back to the bare action from the
 *   client package, composed with {@link getClient}.
 *
 * - **Provider-only** (`getInscriptions`, `getRunesBalances`,
 *   `getBrc20Balances`, `getAlkanesBalances`): try the active connector;
 *   throw if it can't satisfy the request. No data-source fallback in
 *   Phase 9 — that requires Phase 10's typed wallet keystone.
 *
 * - **Client-only** (`getRecommendedFees`, `getTransaction`,
 *   `broadcastTransaction`): delegate to the bare action from the client
 *   package: `clientAction(getClient(config, opts))`. Optional `{ chainId }`
 *   to query a chain other than the active one.
 *
 * **Architectural pattern: bare action + bare client.**
 *
 * Each fallback / client-only path goes through the *bare action functions*
 * exported from `@omnisat/lasereyes-client` (e.g. `getBalance(client, addr)`),
 * NOT through the extended-method form (`client.getBalance(addr)`). The
 * client returned by `getClient(config)` is bare — no action groups
 * pre-extended. This keeps the typed client surface composable: callers
 * who want methods can do `getClient(config).extend(publicActions())`
 * themselves; Phase 9 actions just use the underlying free functions.
 *
 * Why? Tree-shake friendliness, explicit imports per call, and zero
 * coupling between `getClient` and any specific action factory.
 *
 * All actions thread `<const config extends LaserEyesConfig<any, any,
 * any>>` so a precisely-typed config flows through.
 *
 * @module actions/data
 */

import {
  broadcastTransaction as clientBroadcastTransaction,
  getBalance as clientGetBalance,
  getRecommendedFees as clientGetRecommendedFees,
  getTransaction as clientGetTransaction,
  getUtxos as clientGetUtxos,
} from '@omnisat/lasereyes-client'
import type {
  AlkaneBalance,
  Brc20Balance,
  FeeEstimate,
  Inscription,
  PaginatedResult,
  RuneBalance,
  Transaction,
  UTXO,
} from '@omnisat/lasereyes-client'
import { getClient } from '../client'
import type { LaserEyesConfig } from '../config'
import { tryResolveConnector } from '../internal'

// ============================================================================
// Internal helper — provider-first attempt.
// ============================================================================

/**
 * Try to call a method on the currently-active connector's provider.
 *
 * @returns The result, or `undefined` if no connector is active OR the
 *   provider doesn't support the method OR the request throws.
 */
async function tryProvider<T>(
  config: LaserEyesConfig<any, any, any>,
  method: string,
  params?: Record<string, unknown>
): Promise<T | undefined> {
  const connector = tryResolveConnector(config)
  if (!connector) return undefined
  const provider = connector.getProvider()
  if (!provider) return undefined
  try {
    return (await provider.request(method, params)) as T
  } catch {
    return undefined
  }
}

// ============================================================================
// Provider-first / client-fallback
// ============================================================================

/**
 * Get the BTC balance for an address (in satoshis, as a string).
 *
 * @remarks
 * Provider-first. Falls back to `getBalance` from the client package,
 * composed with {@link getClient}.
 *
 * @throws {Error} If neither provider nor data source can satisfy the request.
 */
export async function getBalance<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  address: string
): Promise<string> {
  const fromProvider = await tryProvider<string>(config, 'bitcoin_getBalance', { address })
  if (fromProvider !== undefined) return fromProvider
  return clientGetBalance(getClient(config), address)
}

/**
 * Get unspent transaction outputs for an address.
 *
 * @remarks
 * Provider-first. Falls back to `getUtxos` from the client package.
 */
export async function getAddressUtxos<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  address: string
): Promise<PaginatedResult<UTXO>> {
  const fromProvider = await tryProvider<PaginatedResult<UTXO>>(config, 'bitcoin_getUtxos', {
    address,
  })
  if (fromProvider !== undefined) return fromProvider
  return clientGetUtxos(getClient(config), address)
}

// ============================================================================
// Provider-only protocol reads
// ============================================================================

/**
 * Get current inscriptions for an address.
 *
 * @remarks
 * Provider-only. The active wallet must support `bitcoin_getInscriptions`.
 *
 * @throws {Error} If no wallet is connected or the provider doesn't support
 *   the method. (Once Phase 10's typed wallet keystone lands, the
 *   `inscriptionActions()` factory provides a data-source path.)
 */
export async function getInscriptions<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  address: string,
  options?: { offset?: number; limit?: number }
): Promise<Inscription[]> {
  const params: Record<string, unknown> = { address }
  if (options?.offset !== undefined) params.offset = options.offset
  if (options?.limit !== undefined) params.limit = options.limit
  const result = await tryProvider<Inscription[]>(config, 'bitcoin_getInscriptions', params)
  if (result !== undefined) return result
  throw new Error(
    'getInscriptions: provider unavailable. Connect a wallet that supports `bitcoin_getInscriptions`, or use the typed `inscriptionActions()` once Phase 10 keystone lands.'
  )
}

/**
 * Get Runes balances for an address.
 *
 * @remarks
 * Provider-only. See {@link getInscriptions} for the rationale.
 */
export async function getRunesBalances<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  address: string
): Promise<RuneBalance[]> {
  const result = await tryProvider<RuneBalance[]>(config, 'bitcoin_getRunesBalances', { address })
  if (result !== undefined) return result
  throw new Error(
    'getRunesBalances: provider unavailable. Use the typed `runeActions()` once Phase 10 keystone lands.'
  )
}

/**
 * Get BRC-20 balances for an address.
 *
 * @remarks
 * Provider-only.
 */
export async function getBrc20Balances<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  address: string
): Promise<Brc20Balance[]> {
  const result = await tryProvider<Brc20Balance[]>(config, 'bitcoin_getBrc20Balances', {
    address,
  })
  if (result !== undefined) return result
  throw new Error(
    'getBrc20Balances: provider unavailable. Use the typed `brc20Actions()` once Phase 10 keystone lands.'
  )
}

/**
 * Get Alkane balances for an address.
 *
 * @remarks
 * Provider-only.
 */
export async function getAlkanesBalances<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  address: string
): Promise<AlkaneBalance[]> {
  const result = await tryProvider<AlkaneBalance[]>(config, 'bitcoin_getAlkanesBalances', {
    address,
  })
  if (result !== undefined) return result
  throw new Error('getAlkanesBalances: provider unavailable.')
}

// ============================================================================
// Client-only — delegated to `getClient(config, opts).<method>()`.
// Optional `{ chainId }` to query a chain other than the active one.
// ============================================================================

/**
 * Get the recommended fee rates from the configured data source.
 *
 * @remarks
 * Client-only. Delegates to the client package's bare `getRecommendedFees`
 * action with `getClient(config, opts)` as the client argument.
 *
 * @example
 * ```ts
 * const fees = await getRecommendedFees(config)                          // active chain
 * const t4Fees = await getRecommendedFees(config, { chainId: 'testnet4' })
 * ```
 */
export async function getRecommendedFees<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<FeeEstimate> {
  return clientGetRecommendedFees(getClient(config, options))
}

/**
 * Get full transaction details by transaction ID.
 *
 * @remarks
 * Client-only. Delegates to the client package's bare `getTransaction`
 * action.
 *
 * @example
 * ```ts
 * const tx = await getTransaction(config, txId)
 * const t4Tx = await getTransaction(config, txId, { chainId: 'testnet4' })
 * ```
 */
export async function getTransaction<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  txId: string,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<Transaction> {
  return clientGetTransaction(getClient(config, options), txId)
}

/**
 * Broadcast a signed raw transaction to the Bitcoin network.
 *
 * @remarks
 * Client-only. Delegates to the client package's bare `broadcastTransaction`.
 *
 * Optionally pass `{ chainId }` to broadcast on a chain other than the active
 * one. Useful for cross-chain helper flows.
 */
export async function broadcastTransaction<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  rawTx: string,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<string> {
  return clientBroadcastTransaction(getClient(config, options), rawTx)
}
