/**
 * Wallet-aware BTC actions.
 *
 * @remarks
 * **Type-level rule.** Free actions constrain only on `dsMethods` (the
 * data-source capabilities they reach for at the leaf). Action-presence
 * on the client is a runtime concern dispatched by {@link getAction}.
 *
 * **Composition rule.** Composed action bodies call other actions via
 * {@link getAction}, never reaching `client.config.dataSource.btcXxx(...)`
 * directly except in leaf actions. User overrides extended onto the client
 * cascade through all composition layers automatically.
 *
 * **Factory rule.** The factory {@link walletBtcActions} keeps the
 * `Actions extends …` constraint so `.extend(walletBtcActions())` fails
 * to compile if `signPsbt` isn't already on the client. Defense in depth:
 * factory path enforces ordering at compile time; free-function path
 * relies on `getAction` runtime cascade + a clear missing-signer error.
 *
 * @module actions/wallet
 */

import type { Account, AddressPurpose, WalletAccount } from '../../account/types'
import type { WalletClient, WalletClientConfig } from '../../client/wallet-types'
import type { ActionGroup, BaseCapability } from '../../data-source/capabilities'
import { getAction } from '../../lib/get-action'
import { buildSendBtcPsbt } from '../../lib/psbt-builders'
import type { SignedPsbt, SignPsbtOptions } from '../../signer/types'
import type { PaginatedResult, UTXO } from '../../types'
import { broadcastTransaction, getUtxos as getUtxosByAddress } from '../public'
import { signPsbt } from '../signing'

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
 * The required shape of `signPsbt` on a client when composing through
 * {@link walletBtcActions}.
 *
 * @remarks
 * Kept here (rather than imported from signing) to keep the factory's
 * compile-time guard local to this file.
 */
type RequiredSigningActions = {
  signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
}

// ============================================================================
// Strict actions — `dsMethods` constrained, no `Actions` constraint
// ============================================================================

/**
 * Sends BTC from the wallet account to a recipient.
 *
 * @remarks
 * Composes through {@link getAction} for `getUtxos`, `signPsbt`, and
 * `broadcastTransaction`, so user overrides on any sub-action cascade
 * automatically.
 *
 * Requires a {@link WalletAccount} (needs the payment public key for PSBT
 * construction) and that the client's data source exposes
 * `btcGetAddressUtxos` and `btcBroadcastTransaction`. Signing-capability
 * is enforced at runtime by the {@link signPsbt} free function reading
 * `client.config.signer`.
 *
 * @throws {Error} If signing fails to produce a finalized transaction.
 * @throws {Error} If `client.config.signer` is absent.
 * @throws {PsbtBuildError} If PSBT construction fails.
 * @throws {InsufficientFundsError} If the available UTXOs cannot cover amount + fee.
 */
export async function sendBtc<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends ActionGroup,
>(
  client: WalletClient<Config, WalletAccount, Actions, DS>,
  params: SendBtcParams
): Promise<string> {
  const { to, amount, feeRate = 7 } = params

  const account = client.config.account
  const paymentAddr = account.getAddress('payment')
  const paymentPubkey = account.getPublicKey('payment')

  const getUtxos_ = getAction(client, getUtxos, 'getUtxos')
  const sign = getAction(client, signPsbt, 'signPsbt')
  const broadcast = getAction(client, broadcastTransaction, 'broadcastTransaction')

  const { data: utxos } = await getUtxos_(account, 'payment')

  const { psbtHex } = buildSendBtcPsbt({
    utxos,
    toAddress: to,
    amount,
    changeAddress: paymentAddr,
    feeRate,
    network: client.config.network.type,
    publicKey: paymentPubkey,
  })

  const signed = await sign(psbtHex, { finalize: true, broadcast: false })

  if (!signed.txHex) {
    throw new Error('Signer did not return transaction hex')
  }

  return broadcast(signed.txHex)
}

/**
 * Gets the BTC balance for an account's address (defaults to the payment
 * address).
 *
 * @remarks
 * Read-only. Works with any account type.
 */
export async function getBalance<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetBalance'>,
>(
  client: WalletClient<Config, A, Actions, DS>,
  account: A = client.config.account,
  purpose: AddressPurpose = 'payment'
): Promise<string> {
  const address = account.getAddress(purpose)
  return client.config.dataSource.btcGetBalance(address)
}

/**
 * Gets UTXOs for an account's specified address purpose (defaults to
 * `'payment'`).
 *
 * @remarks
 * Read-only. Works with any account type. The action takes an explicit
 * `account` so composed actions can target arbitrary accounts (not only
 * `client.config.account`), keeping the call-site shape uniform between
 * free function and client method.
 */
export async function getUtxos<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos'>,
>(
  client: WalletClient<Config, A, Actions, DS>,
  account: A,
  purpose: AddressPurpose = 'payment'
): Promise<PaginatedResult<UTXO>> {
  const address = account.getAddress(purpose)
  return getUtxosByAddress(client, address)
}

// ============================================================================
// Strict factory — preserves compile-time ordering enforcement
// ============================================================================

/**
 * Action-group factory for account-aware BTC operations.
 *
 * @remarks
 * Adds `sendBtc`, `getBalance`, and `getUtxos` to a wallet client. The
 * factory's `Actions extends RequiredSigningActions` constraint ensures
 * `signPsbt` is already on the client at extend time — enforced at compile
 * time. Apply *after* `signingActions()`:
 *
 * ```ts
 * createWalletClient({ network, dataSource, account, signer })
 *   .extend(signingActions())
 *   .extend(walletBtcActions())
 * ```
 *
 * The factory-method shapes mirror the free-function shapes minus the
 * `client` parameter — `getUtxos(account, purpose?)`, etc. — so direct
 * free-function callers and method callers see the same call surface.
 */
export function walletBtcActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<
      BaseCapability,
      'btcGetAddressUtxos' | 'btcBroadcastTransaction' | 'btcGetBalance'
    >,
    Actions extends RequiredSigningActions,
  >(
    client: WalletClient<Config, WalletAccount, Actions, DS>
  ) => ({
    sendBtc: (params: SendBtcParams) => sendBtc(client, params),
    getBalance: (account?: WalletAccount, purpose?: AddressPurpose) =>
      getBalance(client, account, purpose),
    getUtxos: (account: WalletAccount, purpose?: AddressPurpose) =>
      getUtxos(client, account, purpose),
  })
}
