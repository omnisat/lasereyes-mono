/**
 * Wallet-aware BTC actions.
 *
 * @remarks
 * **Scope.** Bundles the primitive wallet operations: signing
 * (`signPsbt`, `signMessage`, `broadcastPsbt`) and base BTC operations
 * (`sendBtc`, `getAccountBalance`, `getAccountUtxos`). Signing primitives are
 * cross-cutting (also used by `runeWriteActions`, `brc20WriteActions`,
 * `inscriptionWriteActions`) but live here as part of the "base wallet"
 * surface — there's no separate `signingActions` factory anymore.
 *
 * **Type-level rule.** Free actions constrain only on `dsMethods` (the
 * backend capabilities they reach for at the leaf). Action-presence
 * on the client is a runtime concern dispatched by {@link getAction}.
 *
 * **Composition rule.** Composed action bodies call other actions via
 * {@link getAction}, never reaching `client.config.backend.btcXxx(...)`
 * directly except in leaf actions. User overrides extended onto the client
 * cascade through all composition layers automatically.
 *
 * **Signer runtime contract.** `signPsbt` / `signMessage` /
 * `broadcastPsbt` read the signer from `client.config.signer` — pass it
 * to {@link createWalletClient} via `config.signer`. They throw a clear
 * runtime error if the signer is absent.
 *
 * @module actions/wallet
 */

import type { Account, AddressPurpose, WalletAccount } from '../../account/types'
import type { ActionGroup, BaseCapability } from '../../backends/capabilities'
import type { WalletClient, WalletClientConfig } from '../../client/wallet-types'
import { buildSendBtcPsbt } from '../../lib/build-send-btc-psbt'
import { getAction } from '../../lib/get-action'
import type { SignedPsbt, Signer, SignMessageOptions, SignPsbtOptions } from '../../signer/types'
import type { PaginatedResult, UTXO } from '../../types'
import { broadcastTransaction, getAddressBalance, getAddressUtxos } from '../public'

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

// ============================================================================
// Signer helper
// ============================================================================

function requireSigner(signer: Signer | undefined): Signer {
  if (!signer) {
    throw new Error(
      'No signer configured on wallet client. Pass `signer` to ' +
        '`createWalletClient({...})` or, in core, ensure the active ' +
        "connector's provider is available."
    )
  }
  return signer
}

// ============================================================================
// Strict actions — `dsMethods` constrained, no `Actions` constraint
// ============================================================================

/**
 * Sign a PSBT using the wallet client's signer.
 *
 * @throws {Error} If `client.config.signer` is `undefined` at runtime.
 */
export async function signPsbt<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends ActionGroup,
>(
  client: WalletClient<Config, A, Actions, DS>,
  psbt: string,
  options?: SignPsbtOptions
): Promise<SignedPsbt> {
  const signer = requireSigner(client.config.signer)
  return signer.signPsbt(psbt, options)
}

/**
 * Sign a message using the wallet client's signer.
 *
 * @remarks
 * If `options.address` is omitted, falls back to the account's payment
 * address.
 *
 * @throws {Error} If `client.config.signer` is `undefined` at runtime.
 */
export async function signMessage<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends ActionGroup,
>(
  client: WalletClient<Config, A, Actions, DS>,
  message: string,
  options?: SignMessageOptions
): Promise<string> {
  const signer = requireSigner(client.config.signer)
  const address = options?.address ?? client.config.account.getAddress('payment')
  return signer.signMessage(message, { ...options, address })
}

/**
 * Sign a PSBT (with finalization) and broadcast the resulting transaction
 * through the configured backend.
 *
 * @remarks
 * Internally composes via {@link getAction}, so overrides on `signPsbt` or
 * `broadcastTransaction` cascade automatically.
 *
 * @returns The transaction ID once broadcast succeeds.
 * @throws {Error} If `client.config.signer` is `undefined`, or if the
 *   signer fails to produce a finalized transaction.
 */
export async function broadcastPsbt<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends Pick<BaseCapability, 'btcBroadcastTransaction'>,
>(
  client: WalletClient<Config, A, Actions, DS>,
  psbt: string,
  options?: Omit<SignPsbtOptions, 'finalize' | 'broadcast'>
): Promise<string> {
  const sign = getAction(client, signPsbt, 'signPsbt')
  const broadcast = getAction(client, broadcastTransaction, 'broadcastTransaction')

  const signed = await sign(psbt, { ...options, finalize: true })
  if (!signed.txHex) {
    throw new Error('Signer did not return transaction hex')
  }
  return broadcast(signed.txHex)
}

/**
 * Sends BTC from the wallet account to a recipient.
 *
 * @remarks
 * Composes through {@link getAction} for `getAccountUtxos`, `signPsbt`, and
 * `broadcastTransaction`, so user overrides on any sub-action cascade
 * automatically.
 *
 * Requires a {@link WalletAccount} (needs the payment public key for PSBT
 * construction) and that the client's backend exposes
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

  const getUtxos_ = getAction(client, getAccountUtxos, 'getAccountUtxos')
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
 * Read-only. Works with any account type. Resolves the address from
 * `account.getAddress(purpose)` and delegates to {@link getAddressBalance}
 * — mirrors `getAccountUtxos` → {@link getAddressUtxos}.
 */
export async function getAccountBalance<
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
  return getAddressBalance(client, address)
}

/**
 * Gets UTXOs for an account's specified address purpose (defaults to
 * `'payment'`).
 *
 * @remarks
 * Read-only. Works with any account type. The action takes an explicit
 * `account` so composed actions can target arbitrary accounts (not only
 * `client.config.account`), keeping the call-site shape uniform between
 * free function and client method. Resolves the address and delegates to
 * {@link getAddressUtxos}.
 */
export async function getAccountUtxos<
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
  return getAddressUtxos(client, address)
}

// ============================================================================
// Named action surface — the canonical method shapes that `walletBtcActions()`
// installs on a wallet client. Declared as a type alias so it can be `Pick`'d
// from when constraining `.extend()` (viem-style `ExtendableProtectedActions`).
// ============================================================================

/**
 * The method surface added to a wallet client by {@link walletBtcActions}.
 *
 * @remarks
 * Method shapes — `client` already removed. Free-function counterparts in
 * this module take `client` as the first argument.
 */
export type WalletBtcActions = {
  signPsbt: (psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>
  signMessage: (message: string, options?: SignMessageOptions) => Promise<string>
  broadcastPsbt: (
    psbt: string,
    options?: Omit<SignPsbtOptions, 'finalize' | 'broadcast'>
  ) => Promise<string>
  sendBtc: (params: SendBtcParams) => Promise<string>
  getAccountBalance: (account?: WalletAccount, purpose?: AddressPurpose) => Promise<string>
  getAccountUtxos: (
    account: WalletAccount,
    purpose?: AddressPurpose
  ) => Promise<PaginatedResult<UTXO>>
}

// ============================================================================
// Strict factory
// ============================================================================

/**
 * Action-group factory bundling all base wallet operations: signing
 * primitives + account-aware BTC reads/writes.
 *
 * @remarks
 * Installs `signPsbt`, `signMessage`, `broadcastPsbt`, `sendBtc`,
 * `getAccountBalance`, and `getAccountUtxos` in a single extend pass. No ordering
 * footgun — the signing actions ship with the same factory as the BTC
 * ones, so protocol-write factories (`runeWriteActions`, `brc20WriteActions`,
 * `inscriptionWriteActions`) that require `signPsbt` to be present on the
 * client are satisfied by extending this factory.
 *
 * @example
 * ```ts
 * createWalletClient({ network, backend, account, signer })
 *   .extend(walletBtcActions())
 *
 * await walletClient.signPsbt(psbtHex, { finalize: true })
 * await walletClient.sendBtc({ to: 'bc1q…', amount: 10000 })
 * ```
 *
 * The factory-method shapes mirror the free-function shapes minus the
 * `client` parameter, so direct free-function callers and method callers
 * see the same call surface.
 */
export function walletBtcActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<
      BaseCapability,
      'btcGetAddressUtxos' | 'btcBroadcastTransaction' | 'btcGetBalance'
    >,
    Actions extends ActionGroup,
  >(
    client: WalletClient<Config, WalletAccount, Actions, DS>
  ): WalletBtcActions => ({
    signPsbt: (psbt, options) => signPsbt(client, psbt, options),
    signMessage: (message, options) => signMessage(client, message, options),
    broadcastPsbt: (psbt, options) => broadcastPsbt(client, psbt, options),
    sendBtc: params => sendBtc(client, params),
    getAccountBalance: (account, purpose) => getAccountBalance(client, account, purpose),
    getAccountUtxos: (account, purpose) => getAccountUtxos(client, account, purpose),
  })
}
