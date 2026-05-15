/**
 * Bitcoin Ordinal inscription actions.
 *
 * @remarks
 * Two factories:
 *
 * - {@link inscriptionActions} — read-only. Wraps
 *   {@link InscriptionCapability} methods.
 * - {@link inscriptionWriteActions} — write. Adds inscribe + send.
 *   Requires `signPsbt` and base data source. Bodies are stubbed; type
 *   surface is final.
 *
 * @module actions/inscriptions
 */

import type { WalletAccount } from '../../account/types'
import type { Client, ClientConfig } from '../../client/types'
import type { WalletClient, WalletClientConfig } from '../../client/wallet-types'
import type {
  ActionGroup,
  BaseCapability,
  InscriptionCapability,
} from '../../data-source/capabilities'
import type { SignedPsbt, SignPsbtOptions } from '../../signer/types'
import type {
  Inscription,
  InscriptionInfo,
  PaginatedResult,
  PaginationParams,
} from '../../types'

// ============================================================================
// Read action signatures
// ============================================================================

export async function getInscriptionsByAddress<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<InscriptionCapability, 'inscriptionsGetByAddress'>,
>(
  client: Client<Config, DS, Actions>,
  address: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<Inscription>> {
  return client.config.dataSource.inscriptionsGetByAddress(address, pagination)
}

export async function getInscriptionInfo<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<InscriptionCapability, 'inscriptionsGetInfo'>,
>(
  client: Client<Config, DS, Actions>,
  inscriptionId: string
): Promise<InscriptionInfo> {
  return client.config.dataSource.inscriptionsGetInfo(inscriptionId)
}

export async function batchGetInscriptionInfo<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<InscriptionCapability, 'inscriptionsBatchGetInfo'>,
>(
  client: Client<Config, DS, Actions>,
  inscriptionIds: string[]
): Promise<InscriptionInfo[]> {
  return client.config.dataSource.inscriptionsBatchGetInfo(inscriptionIds)
}

// ============================================================================
// Write action signatures (stubbed)
// ============================================================================

/** Parameters for inscribing arbitrary content on Bitcoin. */
export interface InscribeParams {
  /** MIME content type (e.g. `'text/plain'`, `'image/png'`). */
  contentType: string
  /** Inscription content as raw bytes or a UTF-8 string. */
  content: string | Uint8Array
  /** Address to receive the inscription. Defaults to the account's `ordinals` address. */
  to?: string
  /** Fee rate in sat/vB. */
  feeRate?: number
}

/** Parameters for sending an existing inscription. */
export interface SendInscriptionParams {
  /** The inscription ID to transfer. */
  inscriptionId: string
  /** Recipient Bitcoin address. */
  to: string
  /** Fee rate in sat/vB. */
  feeRate?: number
}

/**
 * Inscribe content on Bitcoin (commit + reveal). Stubbed.
 *
 * @returns The inscription ID once the reveal transaction is broadcast.
 *
 * @todo Implement: build commit transaction (P2TR taproot with reveal-script
 * envelope), sign + broadcast commit, build reveal transaction spending the
 * commit output to `params.to` (or account ordinals address), sign + broadcast
 * reveal, return derived inscription ID.
 */
export async function inscribe<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends {
    signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  },
>(
  _client: WalletClient<Config, WalletAccount, Actions, DS>,
  _params: InscribeParams
): Promise<string> {
  // TODO(inscribe): implementation deferred — type surface is locked.
  throw new Error('inscribe: not implemented')
}

/**
 * Send an existing inscription to another address. Stubbed.
 *
 * @todo Implement: locate the inscription's current outpoint, build a
 * spending PSBT that preserves the inscription sat (postage UTXO + change),
 * sign via `client.signPsbt({ finalize: true })`, broadcast.
 */
export async function sendInscription<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends {
    signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  },
>(
  _client: WalletClient<Config, WalletAccount, Actions, DS>,
  _params: SendInscriptionParams
): Promise<string> {
  // TODO(sendInscription): implementation deferred — type surface is locked.
  throw new Error('sendInscription: not implemented')
}

// ============================================================================
// Named action surfaces — method shapes installed by the factories below.
// ============================================================================

/**
 * The method surface added to a client by {@link inscriptionActions}.
 */
export type PublicInscriptionActions = {
  getInscriptionsByAddress: (
    address: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<Inscription>>
  getInscriptionInfo: (inscriptionId: string) => Promise<InscriptionInfo>
  batchGetInscriptionInfo: (inscriptionIds: string[]) => Promise<InscriptionInfo[]>
}

/**
 * The method surface added to a wallet client by {@link inscriptionWriteActions}.
 *
 * @remarks
 * Implementation is stubbed; type surface is final.
 */
export type WalletInscriptionActions = {
  inscribe: (params: InscribeParams) => Promise<string>
  sendInscription: (params: SendInscriptionParams) => Promise<string>
}

// ============================================================================
// Factories
// ============================================================================

/**
 * Action-group factory bundling read-only inscription operations.
 *
 * @example
 * ```ts
 * import { inscriptionActions } from '@omnisat/lasereyes-client/inscriptions'
 *
 * const client = createClient({ network, dataSource }).extend(inscriptionActions())
 * const { data } = await client.getInscriptionsByAddress('bc1p...')
 * ```
 */
export function inscriptionActions() {
  return <
    Config extends ClientConfig<DS>,
    DS extends InscriptionCapability,
    Actions extends ActionGroup,
  >(
    client: Client<Config, DS, Actions>
  ): PublicInscriptionActions => ({
    getInscriptionsByAddress: (address: string, pagination?: PaginationParams) =>
      getInscriptionsByAddress(client, address, pagination),
    getInscriptionInfo: (inscriptionId: string) => getInscriptionInfo(client, inscriptionId),
    batchGetInscriptionInfo: (inscriptionIds: string[]) =>
      batchGetInscriptionInfo(client, inscriptionIds),
  })
}

/**
 * Action-group factory bundling write inscription operations (stubbed).
 */
export function inscriptionWriteActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
    Actions extends {
      signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
    },
  >(
    client: WalletClient<Config, WalletAccount, Actions, DS>
  ): WalletInscriptionActions => ({
    inscribe: (params: InscribeParams) => inscribe(client, params),
    sendInscription: (params: SendInscriptionParams) => sendInscription(client, params),
  })
}
