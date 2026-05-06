/**
 * Wallet-aware BTC actions for account-based operations.
 *
 * @remarks
 * Type pattern: **strict factory + strict action**.
 * - Each action *function* (`sendBtc`, `getBalance`, `getUtxos`) declares
 *   its precise requirements via generic constraints. This makes the
 *   functions usable directly: `await sendBtc(client, params)`.
 * - The factory `walletBtcActions()` mirrors those constraints on its
 *   client parameter, so `client.extend(walletBtcActions())` fails at
 *   compile time if the client doesn't already have what the actions
 *   need.
 *
 * **Ordering:** `sendBtc` depends on `signPsbt`. Therefore extend
 * `signingActions(signer)` *before* `walletBtcActions()`. The compiler
 * enforces this:
 *
 * ```ts
 * createWalletClient({...})
 *   .extend(signingActions(signer))   // first — provides signPsbt
 *   .extend(walletBtcActions())       // second — uses it
 * ```
 *
 * @module actions/wallet-btc
 */

import type { Account, AddressPurpose, WalletAccount } from '../account/types'
import type { WalletClient, WalletClientConfig } from '../client/wallet-types'
import type { ActionGroup, BaseCapability } from '../data-source/capabilities'
import { buildSendBtcPsbt } from '../lib/psbt-builders'
import type { SignedPsbt, SignPsbtOptions } from '../signer/types'
import type { PaginatedResult, UTXO } from '../types'

/**
 * Parameters for sending BTC using a wallet client.
 */
export interface SendBtcParams {
  /** Recipient's Bitcoin address. */
  to: string
  /** Amount to send in satoshis. */
  amount: number
  /** Fee rate in sat/vB (defaults to 7). */
  feeRate?: number
}

/**
 * The required shape of `signPsbt` on a client `sendBtc` is called against.
 *
 * @remarks
 * Used both by the strict `sendBtc` action function and by the
 * {@link walletBtcActions} factory so the constraint is stated once.
 */
type RequiredSigningActions = {
  signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
}

// ============================================================================
// Strict actions
// ============================================================================

/**
 * Sends BTC from the wallet account to a recipient.
 *
 * @remarks
 * Uses the account's payment address for funding and change. Requires a
 * {@link WalletAccount} (for public-key access) and a `signPsbt` action on
 * the client.
 *
 * @throws {Error} If signing fails to produce a finalized transaction.
 * @throws {PsbtBuildError} If PSBT construction fails.
 * @throws {InsufficientFundsError} If the available UTXOs cannot cover amount + fee.
 */
export async function sendBtc<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends RequiredSigningActions,
>(
  client: WalletClient<Config, WalletAccount, Actions, DS>,
  params: SendBtcParams
): Promise<string> {
  const { to, amount, feeRate = 7 } = params

  const paymentAddr = client.config.account.getAddress('payment')
  const paymentPubkey = client.config.account.getPublicKey('payment')

  const { data: utxos } = await client.config.dataSource.btcGetAddressUtxos(paymentAddr)

  const { psbtHex } = buildSendBtcPsbt({
    utxos,
    toAddress: to,
    amount,
    changeAddress: paymentAddr,
    feeRate,
    network: client.config.network.type,
    publicKey: paymentPubkey,
  })

  const signed = await client.signPsbt(psbtHex, { finalize: true, broadcast: false })

  if (!signed.txHex) {
    throw new Error('Signer did not return transaction hex')
  }

  return client.config.dataSource.btcBroadcastTransaction(signed.txHex)
}

/**
 * Gets the BTC balance for the wallet account's payment address.
 *
 * @remarks
 * Read-only. Works with any account type. Requires `btcGetBalance` on the
 * data source.
 */
export async function getBalance<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetBalance'>,
>(client: WalletClient<Config, A, Actions, DS>): Promise<string> {
  const address = client.config.account.getAddress('payment')
  return client.config.dataSource.btcGetBalance(address)
}

/**
 * Gets UTXOs for the wallet account's specified address purpose.
 *
 * @remarks
 * Read-only. Works with any account type. Requires `btcGetAddressUtxos` on
 * the data source.
 */
export async function getUtxos<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos'>,
>(
  client: WalletClient<Config, A, Actions, DS>,
  purpose: AddressPurpose = 'payment'
): Promise<PaginatedResult<UTXO>> {
  const address = client.config.account.getAddress(purpose)
  return client.config.dataSource.btcGetAddressUtxos(address)
}

// ============================================================================
// Strict factory — mirrors the strict-action constraints
// ============================================================================

/**
 * Action-group factory for account-aware BTC operations.
 *
 * @remarks
 * Adds `sendBtc`, `getBalance`, and `getUtxos` to a wallet client. The
 * factory's client constraint matches what the underlying actions need:
 * a {@link WalletAccount}, base capability methods on the data source,
 * and a `signPsbt` action already on the client (provided by
 * {@link signingActions}).
 *
 * Apply *after* `signingActions(signer)`:
 *
 * ```ts
 * createWalletClient({ network, dataSource, account })
 *   .extend(signingActions(signer))
 *   .extend(walletBtcActions())
 * ```
 *
 * Calling sites then look like:
 * ```ts
 * await client.sendBtc({ to: 'bc1q...', amount: 10000 })
 * const balance = await client.getBalance()
 * const { data: utxos } = await client.getUtxos('payment')
 * ```
 */
export function walletBtcActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction' | 'btcGetBalance'>,
    Actions extends RequiredSigningActions,
  >(
    client: WalletClient<Config, WalletAccount, Actions, DS>
  ) => ({
    sendBtc: (params: SendBtcParams) => sendBtc(client, params),
    getBalance: () => getBalance(client),
    getUtxos: (purpose?: AddressPurpose) => getUtxos(client, purpose),
  })
}
