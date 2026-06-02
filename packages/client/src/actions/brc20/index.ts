/**
 * BRC-20 protocol actions.
 *
 * @remarks
 * Two factories:
 *
 * - {@link brc20Actions} — read-only. Wraps {@link Brc20Capability} methods.
 * - {@link brc20WriteActions} — write. Adds deploy / mint / transfer.
 *   Requires the backend to expose `Brc20Capability` *and* the client
 *   to already carry `signPsbt`. Bodies are stubbed; type surface is final.
 *
 * @module actions/brc20
 */

import type { WalletAccount } from '../../account/types'
import type { ActionGroup, BaseCapability, Brc20Capability } from '../../backends/capabilities'
import type { Client, ClientConfig } from '../../client/types'
import type { WalletClient, WalletClientConfig } from '../../client/wallet-types'
import type { SignedPsbt, SignPsbtOptions } from '../../signer/types'
import type { Brc20Balance, Brc20Info, PaginatedResult, PaginationParams } from '../../types'

// ============================================================================
// Read action signatures
// ============================================================================

export async function getBrc20Balances<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<Brc20Capability, 'brc20GetAddressBalances'>,
>(
  client: Client<Config, DS, Actions>,
  address: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<Brc20Balance>> {
  return client.config.backend.brc20GetAddressBalances(address, pagination)
}

export async function getBrc20ByTicker<
  Config extends ClientConfig<DS>,
  Actions extends ActionGroup,
  DS extends Pick<Brc20Capability, 'brc20GetByTicker'>,
>(client: Client<Config, DS, Actions>, ticker: string): Promise<Brc20Info> {
  return client.config.backend.brc20GetByTicker(ticker)
}

// ============================================================================
// Write action signatures (stubbed)
// ============================================================================

/** Parameters for deploying a BRC-20 token. */
export interface DeployBrc20Params {
  ticker: string
  /** Maximum supply, as a decimal string. */
  max: string
  /** Maximum amount per mint, as a decimal string. Optional. */
  limit?: string
  /** Decimal places. Defaults to 18 per BRC-20 convention. */
  decimals?: number
  /** Fee rate in sat/vB. */
  feeRate?: number
}

/** Parameters for minting BRC-20 tokens. */
export interface MintBrc20Params {
  ticker: string
  /** Amount to mint, as a decimal string. */
  amount: string
  /** Fee rate in sat/vB. */
  feeRate?: number
}

/** Parameters for transferring BRC-20 tokens. */
export interface TransferBrc20Params {
  ticker: string
  /** Recipient address. */
  to: string
  /** Amount to transfer, as a decimal string. */
  amount: string
  /** Fee rate in sat/vB. */
  feeRate?: number
}

/**
 * Build, sign, and broadcast a BRC-20 deploy inscription. Stubbed.
 *
 * @todo Implement: build the deploy inscription content
 *   (`{"p":"brc-20","op":"deploy","tick":…,"max":…,"lim":…}`),
 *   commit + reveal via PSBT, broadcast.
 */
export async function deployBrc20<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends {
    signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  },
>(
  _client: WalletClient<Config, WalletAccount, Actions, DS>,
  _params: DeployBrc20Params
): Promise<string> {
  // TODO(deployBrc20): implementation deferred — type surface is locked.
  throw new Error('deployBrc20: not implemented')
}

/**
 * Build, sign, and broadcast a BRC-20 mint inscription. Stubbed.
 *
 * @todo Implement: build the mint inscription content
 *   (`{"p":"brc-20","op":"mint","tick":…,"amt":…}`),
 *   commit + reveal via PSBT, broadcast.
 */
export async function mintBrc20<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends {
    signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  },
>(
  _client: WalletClient<Config, WalletAccount, Actions, DS>,
  _params: MintBrc20Params
): Promise<string> {
  // TODO(mintBrc20): implementation deferred — type surface is locked.
  throw new Error('mintBrc20: not implemented')
}

/**
 * Build, sign, and broadcast a BRC-20 transfer (inscribe + send). Stubbed.
 *
 * @todo Implement: two-step BRC-20 transfer flow —
 *   1) Inscribe a transfer-marker (`{"p":"brc-20","op":"transfer","tick":…,"amt":…}`)
 *      to the sender's ordinals address.
 *   2) Spend that inscription UTXO to `params.to`.
 *   Both steps need PSBTs signed via `client.signPsbt`, then broadcast.
 */
export async function transferBrc20<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends {
    signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  },
>(
  _client: WalletClient<Config, WalletAccount, Actions, DS>,
  _params: TransferBrc20Params
): Promise<string> {
  // TODO(transferBrc20): implementation deferred — type surface is locked.
  throw new Error('transferBrc20: not implemented')
}

// ============================================================================
// Factories
// ============================================================================

// ============================================================================
// Named action surfaces — method shapes installed by the factories below.
// ============================================================================

/**
 * The method surface added to a client by {@link brc20Actions}.
 */
export type PublicBrc20Actions = {
  getBrc20Balances: (
    address: string,
    pagination?: PaginationParams
  ) => Promise<PaginatedResult<Brc20Balance>>
  getBrc20ByTicker: (ticker: string) => Promise<Brc20Info>
}

/**
 * The method surface added to a wallet client by {@link brc20WriteActions}.
 *
 * @remarks
 * Implementation is stubbed; type surface is final.
 */
export type WalletBrc20Actions = {
  deployBrc20: (params: DeployBrc20Params) => Promise<string>
  mintBrc20: (params: MintBrc20Params) => Promise<string>
  transferBrc20: (params: TransferBrc20Params) => Promise<string>
}

/**
 * Action-group factory bundling read-only BRC-20 operations.
 *
 * @example
 * ```ts
 * import { brc20Actions } from '@omnisat/lasereyes-client/brc20'
 *
 * const client = createClient({ network, backend }).extend(brc20Actions())
 * const balances = await client.getBrc20Balances('bc1q...')
 * ```
 */
export function brc20Actions() {
  return <Config extends ClientConfig<DS>, DS extends Brc20Capability, Actions extends ActionGroup>(
    client: Client<Config, DS, Actions>
  ): PublicBrc20Actions => ({
    getBrc20Balances: (address: string, pagination?: PaginationParams) =>
      getBrc20Balances(client, address, pagination),
    getBrc20ByTicker: (ticker: string) => getBrc20ByTicker(client, ticker),
  })
}

/**
 * Action-group factory bundling write BRC-20 operations (stubbed).
 *
 * @remarks
 * Requires `signPsbt` already extended on the client.
 */
export function brc20WriteActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
    Actions extends {
      signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
    },
  >(
    client: WalletClient<Config, WalletAccount, Actions, DS>
  ): WalletBrc20Actions => ({
    deployBrc20: (params: DeployBrc20Params) => deployBrc20(client, params),
    mintBrc20: (params: MintBrc20Params) => mintBrc20(client, params),
    transferBrc20: (params: TransferBrc20Params) => transferBrc20(client, params),
  })
}
