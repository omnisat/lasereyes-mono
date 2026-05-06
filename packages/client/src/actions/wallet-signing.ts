/**
 * Signing actions for wallet clients.
 *
 * @remarks
 * These actions provide PSBT and message signing capabilities. The signer functions
 * are provided at action creation time rather than stored on the client.
 *
 * @module actions/wallet-signing
 */

import type {
  Account,
  ActionGroup,
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
  WalletClient,
  WalletClientConfig,
} from '../types'

/**
 * Signs a PSBT using the provided signer.
 *
 * @param _client - The wallet client
 * @param signer - The signer implementation
 * @param psbt - The PSBT to sign
 * @param options - Signing options
 * @returns The signed PSBT
 */
export async function signPsbt<
  config extends WalletClientConfig<account, dsMethods>,
  account extends Account,
  clientActions extends ActionGroup,
  dsMethods extends ActionGroup
>(
  _client: WalletClient<config, account, clientActions, dsMethods>,
  signer: Signer,
  psbt: string,
  options?: SignPsbtOptions
) {
  return signer.signPsbt(psbt, options)
}

/**
 * Signs a message using the provided signer.
 *
 * @param client - The wallet client
 * @param signer - The signer implementation
 * @param message - The message to sign
 * @param options - Signing options
 * @returns The signed message
 */
export async function signMessage<
  config extends WalletClientConfig<account, dsMethods>,
  account extends Account,
  clientActions extends ActionGroup,
  dsMethods extends ActionGroup
>(
  client: WalletClient<config, account, clientActions, dsMethods>,
  signer: Signer,
  message: string,
  options?: SignMessageOptions
): Promise<string> {
  // Use provided address or default to payment address
  const address = options?.address ?? client.config.account.getAddress('payment')

  return signer.signMessage(message, {
    ...options,
    address,
  })
}

/**
 * Creates a signing action group factory.
 *
 * @remarks
 * Adds PSBT and message signing capabilities to a wallet client. The signer is
 * passed to this factory and used to create the signing actions.
 *
 * @param signer - The signer implementation providing signing capabilities
 * @returns A factory function that produces {@link SigningActions}
 *
 * @example
 * ```ts
 * import { createWalletClient } from '@omnisat/lasereyes-client/wallet'
 * import { signingActions } from '@omnisat/lasereyes-client/wallet'
 *
 * // Create signer (e.g., wallet extension wrapper)
 * const signer = {
 *   signPsbt: async (opts) => window.unisat.signPsbt(opts.psbt),
 *   signMessage: async (msg, opts) => window.unisat.signMessage(msg, opts?.address)
 * }
 *
 * const walletClient = createWalletClient({ network, dataSource, account })
 *   .extend(signingActions(signer))
 *
 * // Sign PSBT
 * const signed = await walletClient.signPsbt(psbtHex, { finalize: true })
 *
 * // Sign message
 * const sig = await walletClient.signMessage('Hello Bitcoin!')
 * ```
 */
export function signingActions(signer: Signer) {
  return <
    config extends WalletClientConfig<account, dsMethods>,
    account extends Account,
    clientActions extends ActionGroup,
    dsMethods extends ActionGroup
  >(
    client: WalletClient<config, account, clientActions, dsMethods>
  ) => ({
    async signPsbt(psbt: string, options?: Omit<SignPsbtOptions, 'psbt'>): Promise<SignedPsbt> {
      return signPsbt(client, signer, psbt, options)
    },
    async signMessage(message: string, options?: SignMessageOptions): Promise<string> {
      return signMessage(client, signer, message, options)
    },
  })
}
