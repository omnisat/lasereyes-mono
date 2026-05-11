/**
 * Signing actions for wallet clients.
 *
 * @remarks
 * Reads the signer from `client.config.signer`. The factory
 * {@link signingActions} no longer takes a signer argument — provide the
 * signer to {@link createWalletClient} via `config.signer` instead. This
 * makes the free actions self-sufficient: any caller (factory, direct
 * invocation, `getAction` fallback) reaches the signer the same way.
 *
 * If `client.config.signer` is `undefined`, every action here throws a
 * clear runtime error. Type-level guards against that live on the factory
 * path: see {@link walletActions}'s `Actions extends RequiredSigningActions`
 * constraint, which forces `signingActions()` to be extended first.
 *
 * @module actions/signing
 */

import type { Account } from '../../account/types'
import type { WalletClient, WalletClientConfig } from '../../client/wallet-types'
import type { ActionGroup, BaseCapability } from '../../data-source/capabilities'
import { getAction } from '../../lib/get-action'
import type { SignedPsbt, Signer, SignMessageOptions, SignPsbtOptions } from '../../signer/types'
import { broadcastTransaction } from '../public'

// ============================================================================
// Internal helpers
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
// Strict actions
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
 * through the configured data source.
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

// ============================================================================
// Factory
// ============================================================================

/**
 * Action-group factory adding `signPsbt`, `signMessage`, and `broadcastPsbt`
 * to a wallet client.
 *
 * @remarks
 * The signer is read from `client.config.signer` — provide it when calling
 * {@link createWalletClient}. The factory no longer takes a signer
 * argument.
 *
 * @example
 * ```ts
 * const walletClient = createWalletClient({ network, dataSource, account, signer })
 *   .extend(signingActions())
 *
 * const signed = await walletClient.signPsbt(psbtHex, { finalize: true })
 * const sig = await walletClient.signMessage('Hello Bitcoin!')
 * const txId = await walletClient.broadcastPsbt(unsignedPsbtHex)
 * ```
 */
export function signingActions() {
  return <
    Config extends WalletClientConfig<A, DS>,
    A extends Account,
    Actions extends ActionGroup,
    DS extends Pick<BaseCapability, 'btcBroadcastTransaction'>,
  >(
    client: WalletClient<Config, A, Actions, DS>
  ) => ({
    signPsbt: (psbt: string, options?: SignPsbtOptions): Promise<SignedPsbt> =>
      signPsbt(client, psbt, options),
    signMessage: (message: string, options?: SignMessageOptions): Promise<string> =>
      signMessage(client, message, options),
    broadcastPsbt: (
      psbt: string,
      options?: Omit<SignPsbtOptions, 'finalize' | 'broadcast'>
    ): Promise<string> => broadcastPsbt(client, psbt, options),
  })
}
