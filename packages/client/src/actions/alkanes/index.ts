/**
 * Alkanes protocol actions.
 *
 * @remarks
 * Two factories:
 *
 * - {@link alkaneActions} — read-only. Wraps {@link AlkaneCapability} methods
 *   on a {@link Client}. Requires the backend to expose `AlkaneCapability`
 *   (available via the sandshrew vendor backend).
 * - {@link alkaneWriteActions} — write. Adds alkane-sending capability.
 *   Requires the backend to expose `AlkaneCapability` *and* the client to
 *   already carry `signPsbt` (extended via {@link walletBtcActions} first).
 *   Bodies are stubbed pending implementation; the type surface is final.
 *
 * **Not yet exported.** Like the other protocol modules (runes, brc20,
 * inscriptions), this surface is deferred — see `FUTURE-IMPROVEMENTS.md`.
 * It is kept in `src` so the type surface stays compiled and ready to
 * re-export.
 *
 * @module actions/alkanes
 */

import type { WalletAccount } from '../../account/types'
import type { ActionGroup, AlkaneCapability, BaseCapability } from '../../backends/capabilities'
import type { Client, ClientConfig } from '../../client/types'
import type { WalletClient, WalletClientConfig } from '../../client/wallet-types'
import type { SignedPsbt, SignPsbtOptions } from '../../signer/types'
import type { AlkaneBalance, AlkaneOutpoint, PaginatedResult, PaginationParams } from '../../types'

// ============================================================================
// Read action signatures
// ============================================================================

export async function getAlkaneBalances<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<AlkaneCapability, 'alkanesGetAddressBalances'>,
>(
  client: Client<Config, DS, Actions>,
  address: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<AlkaneBalance>> {
  return client.config.backend.alkanesGetAddressBalances(address, pagination)
}

export async function getAlkanesByAddress<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<AlkaneCapability, 'alkanesGetByAddress'>,
>(
  client: Client<Config, DS, Actions>,
  address: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<AlkaneOutpoint>> {
  return client.config.backend.alkanesGetByAddress(address, pagination)
}

// ============================================================================
// Write action signatures (stubbed)
// ============================================================================

/** Parameters for sending alkane tokens from a wallet account. */
export interface SendAlkaneParams {
  /** Recipient Bitcoin address. */
  to: string
  /** Alkane token ID (e.g. `"2:0"`) to transfer. */
  alkaneId: string
  /** Amount of the alkane to send, as a decimal string (handles large numbers). */
  amount: string
  /** Fee rate in sat/vB (defaults to 7). */
  feeRate?: number
}

/**
 * Build, sign, and broadcast an alkane-transfer transaction.
 *
 * @remarks
 * Implementation is stubbed pending a follow-up. The type surface is final
 * — the client must be a `WalletClient<…, WalletAccount, …>` with `signPsbt`
 * already extended and a backend exposing alkane-outpoint discovery and
 * BTC broadcast.
 *
 * @todo Implement: select alkane outpoints + spending UTXOs, build PSBT with
 * the protocol transfer payload, sign via `client.signPsbt({ finalize: true })`,
 * broadcast via `backend.btcBroadcastTransaction`.
 */
export async function sendAlkane<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<AlkaneCapability, 'alkanesGetByAddress'> &
    Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends {
    signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  },
>(
  _client: WalletClient<Config, WalletAccount, Actions, DS>,
  _params: SendAlkaneParams
): Promise<string> {
  // TODO(sendAlkane): implementation deferred — type surface is locked.
  throw new Error('sendAlkane: not implemented')
}

// ============================================================================
// Named action surfaces — method shapes installed by the factories below.
// ============================================================================

/**
 * The method surface added to a client by {@link alkaneActions}.
 *
 * @remarks
 * Method shapes — `client` already removed. Free-function counterparts
 * live alongside in this module.
 */
export type PublicAlkaneActions = {
  getAlkaneBalances: (
    address: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<AlkaneBalance>>
  getAlkanesByAddress: (
    address: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<AlkaneOutpoint>>
}

/**
 * The method surface added to a wallet client by {@link alkaneWriteActions}.
 *
 * @remarks
 * Method shapes — `client` already removed. Implementation is stubbed;
 * type surface is final.
 */
export type WalletAlkaneActions = {
  sendAlkane: (params: SendAlkaneParams) => Promise<string>
}

// ============================================================================
// Factories
// ============================================================================

/**
 * Action-group factory bundling read-only Alkanes operations.
 *
 * Requires a backend implementing the full {@link AlkaneCapability}.
 *
 * @example
 * ```ts
 * import { alkaneActions } from '@omnisat/lasereyes-client/alkanes'
 *
 * const client = createClient({ network, backend }).extend(alkaneActions())
 * const balances = await client.getAlkaneBalances('bc1q...')
 * ```
 */
export function alkaneActions() {
  return <
    Config extends ClientConfig<DS>,
    DS extends AlkaneCapability,
    Actions extends ActionGroup,
  >(
    client: Client<Config, DS, Actions>
  ): PublicAlkaneActions => ({
    getAlkaneBalances: (address: string, pagination?: PaginationParams) =>
      getAlkaneBalances(client, address, pagination),
    getAlkanesByAddress: (address: string, pagination?: PaginationParams) =>
      getAlkanesByAddress(client, address, pagination),
  })
}

/**
 * Action-group factory bundling write Alkanes operations.
 *
 * @remarks
 * Requires the client to already carry `signPsbt` (extend `walletBtcActions`
 * before this) and the backend to expose alkane-outpoint discovery and
 * BTC broadcast.
 *
 * Implementation is stubbed; the type surface is final.
 */
export function alkaneWriteActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<AlkaneCapability, 'alkanesGetByAddress'> &
      Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
    Actions extends {
      signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
    },
  >(
    client: WalletClient<Config, WalletAccount, Actions, DS>
  ): WalletAlkaneActions => ({
    sendAlkane: (params: SendAlkaneParams) => sendAlkane(client, params),
  })
}
