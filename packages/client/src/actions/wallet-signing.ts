/**
 * Signing actions for wallet clients.
 *
 * @remarks
 * Wraps an injected {@link Signer} as a pair of methods (`signPsbt`,
 * `signMessage`) on a wallet client. The signer carries the cryptographic
 * keys; the client carries the addresses.
 *
 * Signing actions are independent of data-source capabilities — they
 * accept a wallet client of any data-source shape and any prior actions.
 * That said, they should generally be extended **before** higher-level
 * actions like `walletBtcActions()` that depend on `signPsbt`.
 *
 * @module actions/wallet-signing
 */

import type { Account } from '../account/types'
import type { WalletClient, WalletClientConfig } from '../client/wallet-types'
import type { ActionGroup } from '../data-source/capabilities'
import type { SignedPsbt, Signer, SignMessageOptions, SignPsbtOptions } from '../signer/types'

// ============================================================================
// Strict actions
// ============================================================================

/**
 * Sign a PSBT using the provided signer.
 *
 * @remarks
 * The client argument is unused at runtime (the signer carries everything
 * needed) but kept on the signature so signing actions read uniformly with
 * other client-bound actions.
 */
export async function signPsbt<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends ActionGroup,
>(
  _client: WalletClient<Config, A, Actions, DS>,
  signer: Signer,
  psbt: string,
  options?: SignPsbtOptions
): Promise<SignedPsbt> {
  return signer.signPsbt(psbt, options)
}

/**
 * Sign a message using the provided signer.
 *
 * @remarks
 * If `options.address` is omitted, falls back to the account's payment
 * address.
 */
export async function signMessage<
  Config extends WalletClientConfig<A, DS>,
  A extends Account,
  Actions extends ActionGroup,
  DS extends ActionGroup,
>(
  client: WalletClient<Config, A, Actions, DS>,
  signer: Signer,
  message: string,
  options?: SignMessageOptions
): Promise<string> {
  const address = options?.address ?? client.config.account.getAddress('payment')
  return signer.signMessage(message, { ...options, address })
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Action-group factory adding `signPsbt` and `signMessage` to a wallet client.
 *
 * @param signer - The signer implementation carrying signing capability.
 *
 * @example
 * ```ts
 * const signer: Signer = {
 *   signPsbt: async (psbt, opts) => ({ psbtHex: await window.unisat.signPsbt(psbt, opts), ... }),
 *   signMessage: async (msg, opts) => window.unisat.signMessage(msg, opts?.protocol),
 * }
 *
 * const walletClient = createWalletClient({ network, dataSource, account })
 *   .extend(signingActions(signer))
 *
 * const signed = await walletClient.signPsbt(psbtHex, { finalize: true })
 * const sig = await walletClient.signMessage('Hello Bitcoin!')
 * ```
 */
export function signingActions(signer: Signer) {
  return <
    Config extends WalletClientConfig<A, DS>,
    A extends Account,
    Actions extends ActionGroup,
    DS extends ActionGroup,
  >(
    client: WalletClient<Config, A, Actions, DS>
  ) => ({
    signPsbt: (psbt: string, options?: SignPsbtOptions): Promise<SignedPsbt> =>
      signPsbt(client, signer, psbt, options),
    signMessage: (message: string, options?: SignMessageOptions): Promise<string> =>
      signMessage(client, signer, message, options),
  })
}
