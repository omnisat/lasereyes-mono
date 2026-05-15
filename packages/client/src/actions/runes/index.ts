/**
 * Bitcoin Runes protocol actions.
 *
 * @remarks
 * Two factories:
 *
 * - {@link runeActions} — read-only. Wraps {@link RuneCapability} methods
 *   on a {@link Client}. Requires the data source to expose
 *   `RuneCapability` (full or partial).
 * - {@link runeWriteActions} — write. Adds rune-sending capability. Requires
 *   the data source to expose `RuneCapability` *and* the client to already
 *   carry `signPsbt` (extended via {@link walletBtcActions} first). Bodies
 *   are stubbed pending implementation; the type surface is final.
 *
 * @module actions/runes
 */

import type { WalletAccount } from '../../account/types'
import type { Client, ClientConfig } from '../../client/types'
import type { WalletClient, WalletClientConfig } from '../../client/wallet-types'
import type {
  ActionGroup,
  BaseCapability,
  RuneCapability,
} from '../../data-source/capabilities'
import type { SignedPsbt, SignPsbtOptions } from '../../signer/types'
import type {
  OrdOutputWrapper,
  PaginatedResult,
  PaginationParams,
  RuneBalance,
  RuneInfo,
  RuneOutpoint,
} from '../../types'

// ============================================================================
// Read action signatures
// ============================================================================

export async function getRuneBalances<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<RuneCapability, 'runesGetAddressBalances'>,
>(
  client: Client<Config, DS, Actions>,
  address: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<RuneBalance>> {
  return client.config.dataSource.runesGetAddressBalances(address, pagination)
}

export async function getRuneById<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<RuneCapability, 'runesGetById'>,
>(client: Client<Config, DS, Actions>, runeId: string): Promise<RuneInfo> {
  return client.config.dataSource.runesGetById(runeId)
}

export async function getRuneByName<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<RuneCapability, 'runesGetByName'>,
>(client: Client<Config, DS, Actions>, runeName: string): Promise<RuneInfo> {
  return client.config.dataSource.runesGetByName(runeName)
}

export async function getRuneOutpoints<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<RuneCapability, 'runesGetOutpoints'>,
>(
  client: Client<Config, DS, Actions>,
  params: { address: string; runeId: string },
  pagination?: PaginationParams
): Promise<PaginatedResult<RuneOutpoint>> {
  return client.config.dataSource.runesGetOutpoints(params, pagination)
}

export async function batchGetRuneOutputs<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<RuneCapability, 'runesBatchGetOutputs'>,
>(
  client: Client<Config, DS, Actions>,
  params: { outpoints: string[]; runeName: string }
): Promise<OrdOutputWrapper[]> {
  return client.config.dataSource.runesBatchGetOutputs(params)
}

// ============================================================================
// Write action signatures (stubbed)
// ============================================================================

/** Parameters for sending runes from a wallet account. */
export interface SendRuneParams {
  /** Recipient Bitcoin address. */
  to: string
  /** Rune ID (e.g. `"840000:1"`) to transfer. */
  runeId: string
  /** Amount of the rune to send, as a decimal string (handles large numbers). */
  amount: string
  /** Fee rate in sat/vB (defaults to 7). */
  feeRate?: number
}

/**
 * Build, sign, and broadcast a rune-transfer transaction.
 *
 * @remarks
 * Implementation is stubbed pending a follow-up. The type surface is final
 * — the client must be a `WalletClient<…, WalletAccount, …>` with `signPsbt`
 * already extended and a data source exposing rune-outpoint discovery and
 * BTC broadcast.
 *
 * @todo Implement: select rune outpoints + spending UTXOs, build PSBT with
 * runestone OP_RETURN edict, sign via `client.signPsbt({ finalize: true })`,
 * broadcast via `dataSource.btcBroadcastTransaction`.
 */
export async function sendRune<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<RuneCapability, 'runesGetOutpoints'> &
    Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends {
    signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  },
>(
  _client: WalletClient<Config, WalletAccount, Actions, DS>,
  _params: SendRuneParams
): Promise<string> {
  // TODO(sendRune): implementation deferred — type surface is locked.
  throw new Error('sendRune: not implemented')
}

// ============================================================================
// Factories
// ============================================================================

// ============================================================================
// Named action surfaces — method shapes installed by the factories below.
// ============================================================================

/**
 * The method surface added to a client by {@link runeActions}.
 *
 * @remarks
 * Method shapes — `client` already removed. Free-function counterparts
 * live alongside in this module.
 */
export type PublicRuneActions = {
  getRuneBalances: (
    address: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<RuneBalance>>
  getRuneById: (runeId: string) => Promise<RuneInfo>
  getRuneByName: (runeName: string) => Promise<RuneInfo>
  getRuneOutpoints: (
    params: { address: string; runeId: string },
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<RuneOutpoint>>
  batchGetRuneOutputs: (params: {
    outpoints: string[]
    runeName: string
  }) => Promise<OrdOutputWrapper[]>
}

/**
 * The method surface added to a wallet client by {@link runeWriteActions}.
 *
 * @remarks
 * Method shapes — `client` already removed. Implementation is stubbed;
 * type surface is final.
 */
export type WalletRuneActions = {
  sendRune: (params: SendRuneParams) => Promise<string>
}

/**
 * Action-group factory bundling read-only Runes operations.
 *
 * Requires a data source implementing the full {@link RuneCapability}.
 *
 * @example
 * ```ts
 * import { runeActions } from '@omnisat/lasereyes-client/runes'
 *
 * const client = createClient({ network, dataSource }).extend(runeActions())
 * const balances = await client.getRuneBalances('bc1q...')
 * ```
 */
export function runeActions() {
  return <
    Config extends ClientConfig<DS>,
    DS extends RuneCapability,
    Actions extends ActionGroup,
  >(
    client: Client<Config, DS, Actions>
  ): PublicRuneActions => ({
    getRuneBalances: (address: string, pagination?: PaginationParams) =>
      getRuneBalances(client, address, pagination),
    getRuneById: (runeId: string) => getRuneById(client, runeId),
    getRuneByName: (runeName: string) => getRuneByName(client, runeName),
    getRuneOutpoints: (
      params: { address: string; runeId: string },
      pagination?: PaginationParams
    ) => getRuneOutpoints(client, params, pagination),
    batchGetRuneOutputs: (params: { outpoints: string[]; runeName: string }) =>
      batchGetRuneOutputs(client, params),
  })
}

/**
 * Action-group factory bundling write Runes operations.
 *
 * @remarks
 * Requires the client to already carry `signPsbt` (extend `walletBtcActions`
 * before this) and the data source to expose rune-outpoint discovery and
 * BTC broadcast.
 *
 * Implementation is stubbed; the type surface is final.
 */
export function runeWriteActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<RuneCapability, 'runesGetOutpoints'> &
      Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
    Actions extends {
      signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
    },
  >(
    client: WalletClient<Config, WalletAccount, Actions, DS>
  ): WalletRuneActions => ({
    sendRune: (params: SendRuneParams) => sendRune(client, params),
  })
}
