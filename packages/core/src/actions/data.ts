/**
 * Data (read) actions over `LaserEyesConfig`.
 *
 * @remarks
 * Two patterns:
 *
 * - **Client (backend) reads** (`getAddressBalance`, `getAddressUtxos`,
 *   `getRecommendedFees`, `getTransaction`, `broadcastTransaction`):
 *   delegate to the bare action from the client package, composed with
 *   `getClient(config, opts)`. The action layer never talks to the
 *   wallet provider directly. The wallet-fast-path optimization
 *   (avoiding an indexer round-trip when the wallet already has the
 *   answer) lives in the *connector's* `getClient` override — apps that
 *   want it call through `getWalletClient(config)` and the override
 *   wires "try wallet, fall back to base via `getAction`." Action-layer
 *   reads stay backend-only: no wallet involvement.
 *
 * - **Provider-only protocol reads** (`getInscriptions`,
 *   `getRunesBalances`, `getBrc20Balances`, `getAlkanesBalances`): no
 *   backend path yet — the client package's protocol actions are
 *   stubbed. Until those land, these hit the wallet's provider
 *   directly. To be migrated to the client-read pattern once the
 *   underlying actions ship.
 *
 * **Architectural pattern: bare action + bare client.**
 *
 * Each client read goes through the *bare action functions* exported
 * from `@omnisat/lasereyes-client` (e.g. `getAddressBalance(client, addr)`),
 * NOT through the extended-method form (`client.getAddressBalance(addr)`). The
 * client returned by `getClient(config)` is bare — no action groups
 * pre-extended. Tree-shake friendly, explicit imports per call.
 *
 * All actions thread `<const config extends LaserEyesConfig<any, any,
 * any>>` so a precisely-typed config flows through.
 *
 * @module actions/data
 */

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
import {
  broadcastTransaction as clientBroadcastTransaction,
  getAddressBalance as clientGetAddressBalance,
  getAddressUtxos as clientGetAddressUtxos,
  getRecommendedFees as clientGetRecommendedFees,
  getTransaction as clientGetTransaction,
  getAction,
} from '@omnisat/lasereyes-client'
import { getClient } from '../client'
import type { LaserEyesConfig } from '../config'
import { tryResolveConnector } from '../internal'

// ============================================================================
// Internal helper — provider-only attempt for protocol reads.
// ============================================================================

/**
 * Call a method on the currently-active connector's provider, returning
 * `undefined` on any failure mode.
 *
 * @remarks
 * Used only by the provider-only protocol reads — those have no
 * backend equivalent yet and can't fall back. Client reads
 * (`getAddressBalance`, etc.) don't use this; they go straight through
 * {@link getClient}.
 *
 * @returns The result, or `undefined` if no connector is active OR the
 *   provider doesn't support the method OR the request throws.
 */
async function callProvider<T>(
  config: LaserEyesConfig,
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
// Client (backend) reads
// ============================================================================

/**
 * Get the BTC balance for an address (in satoshis, as a string).
 *
 * @remarks
 * Goes through the configured backend for the active chain (or the
 * chain explicitly named in `options.chainId`). The wallet-fast-path
 * variant lives on the wallet client —
 * `getWalletClient(config).getAccountBalance(account)` — and is supplied
 * by the active connector's `getClient` override when it declares
 * native support.
 *
 * @example
 * ```ts
 * const balance = await getAddressBalance(config, 'bc1q…')                    // active chain
 * const t4Bal = await getAddressBalance(config, 'bc1q…', { chainId: 'testnet4' })
 * ```
 */
export async function getAddressBalance<const config extends LaserEyesConfig>(
  config: config,
  address: string,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<string> {
  // `getClient` now returns a precise/union client, but in this generic body
  // `config` is the loose `LaserEyesConfig` bound, so its backends are
  // capability-less (`{}`). These reads *assume* the active backend supports
  // the base method they dispatch — a precondition the loose config can't
  // prove — so we assert it at the dispatch site. `getAction` itself stays
  // strict (it still verifies the cast target supports the action). See
  // FUTURE-IMPROVEMENTS: capability-constraining read actions would remove
  // these casts. Same pattern in every read below.
  const client = getClient(config, options)
  return getAction(
    client as unknown as Parameters<typeof clientGetAddressBalance>[0],
    clientGetAddressBalance,
    'getAddressBalance'
  )(address)
}

/**
 * Get unspent transaction outputs for an address.
 *
 * @remarks
 * Backend path. See {@link getAddressBalance} for the wallet-fast-path
 * alternative.
 */
export async function getAddressUtxos<const config extends LaserEyesConfig>(
  config: config,
  address: string,
  options?: { chainId?: config['chains'][number]['id']; cursor?: string | number; limit?: number }
): Promise<PaginatedResult<UTXO>> {
  const client = getClient(config, options)
  // Forward cursor pagination to the client action when set.
  const pagination =
    options?.cursor !== undefined || options?.limit !== undefined
      ? { cursor: options?.cursor, limit: options?.limit }
      : undefined
  return getAction(
    client as unknown as Parameters<typeof clientGetAddressUtxos>[0],
    clientGetAddressUtxos,
    'getAddressUtxos'
  )(address, pagination)
}

// ============================================================================
// Provider-only protocol reads
//
// No backend path yet — the client package's protocol actions are
// stubbed. Once those land, migrate these to the client-read pattern.
// ============================================================================

/**
 * Get current inscriptions for an address.
 *
 * @remarks
 * Provider-only. The active wallet must support `bitcoin_getInscriptions`.
 *
 * @throws {Error} If no wallet is connected or the provider doesn't support
 *   the method. For a backend-backed path, use the `inscriptionActions()`
 *   factory from `@omnisat/lasereyes-client`.
 */
export async function getInscriptions<const config extends LaserEyesConfig>(
  config: config,
  address: string,
  options?: { offset?: number; limit?: number }
): Promise<Inscription[]> {
  const params: Record<string, unknown> = { address }
  if (options?.offset !== undefined) params.offset = options.offset
  if (options?.limit !== undefined) params.limit = options.limit
  const result = await callProvider<Inscription[]>(config, 'bitcoin_getInscriptions', params)
  if (result !== undefined) return result
  throw new Error(
    'getInscriptions: provider unavailable. Connect a wallet that supports `bitcoin_getInscriptions`, or use the typed `inscriptionActions()` from `@omnisat/lasereyes-client`.'
  )
}

/**
 * Get Runes balances for an address.
 *
 * @remarks
 * Provider-only. See {@link getInscriptions} for the rationale.
 */
export async function getRunesBalances<const config extends LaserEyesConfig>(
  config: config,
  address: string
): Promise<RuneBalance[]> {
  const result = await callProvider<RuneBalance[]>(config, 'bitcoin_getRunesBalances', { address })
  if (result !== undefined) return result
  throw new Error(
    'getRunesBalances: provider unavailable. Use the typed `runeActions()` from `@omnisat/lasereyes-client`.'
  )
}

/**
 * Get BRC-20 balances for an address.
 *
 * @remarks
 * Provider-only.
 */
export async function getBrc20Balances<const config extends LaserEyesConfig>(
  config: config,
  address: string
): Promise<Brc20Balance[]> {
  const result = await callProvider<Brc20Balance[]>(config, 'bitcoin_getBrc20Balances', {
    address,
  })
  if (result !== undefined) return result
  throw new Error(
    'getBrc20Balances: provider unavailable. Use the typed `brc20Actions()` from `@omnisat/lasereyes-client`.'
  )
}

/**
 * Get Alkane balances for an address.
 *
 * @remarks
 * Provider-only.
 */
export async function getAlkanesBalances<const config extends LaserEyesConfig>(
  config: config,
  address: string
): Promise<AlkaneBalance[]> {
  const result = await callProvider<AlkaneBalance[]>(config, 'bitcoin_getAlkanesBalances', {
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
 * Get the recommended fee rates from the configured backend.
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
export async function getRecommendedFees<const config extends LaserEyesConfig>(
  config: config,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<FeeEstimate> {
  const client = getClient(config, options)
  return getAction(
    client as unknown as Parameters<typeof clientGetRecommendedFees>[0],
    clientGetRecommendedFees,
    'getRecommendedFees'
  )()
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
export async function getTransaction<const config extends LaserEyesConfig>(
  config: config,
  txId: string,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<Transaction> {
  const client = getClient(config, options)
  return getAction(
    client as unknown as Parameters<typeof clientGetTransaction>[0],
    clientGetTransaction,
    'getTransaction'
  )(txId)
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
export async function broadcastTransaction<const config extends LaserEyesConfig>(
  config: config,
  rawTx: string,
  options?: { chainId?: config['chains'][number]['id'] }
): Promise<string> {
  const client = getClient(config, options)
  return getAction(
    client as unknown as Parameters<typeof clientBroadcastTransaction>[0],
    clientBroadcastTransaction,
    'broadcastTransaction'
  )(rawTx)
}
