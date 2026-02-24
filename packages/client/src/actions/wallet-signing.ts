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
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
  WalletClient,
} from '../types'

/**
 * Signing actions interface.
 */
export interface SigningActions {
  /** Sign a PSBT */
  signPsbt(psbt: string, options?: Omit<SignPsbtOptions, 'psbt'>): Promise<SignedPsbt>
  /** Sign a message */
  signMessage(message: string, options?: SignMessageOptions): Promise<string>
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
  return (client: WalletClient): SigningActions => ({
    async signPsbt(psbt: string, options?: Omit<SignPsbtOptions, 'psbt'>): Promise<SignedPsbt> {
      return signer.signPsbt({
        psbt,
        ...options,
      })
    },
    async signMessage(message: string, options?: SignMessageOptions): Promise<string> {
      // Use provided address or default to payment address
      const address = options?.address ?? client.account.getAddress('payment')

      return signer.signMessage(message, {
        ...options,
        address,
      })
    },
  })
}
