/**
 * Bridge from a `BitcoinProvider`-shaped provider to a {@link Signer}.
 *
 * @remarks
 * The client package doesn't depend on the core package (which owns the
 * `BitcoinProvider` standard) — instead, this bridge accepts any object
 * structurally satisfying {@link ProviderLike}. Every
 * `BitcoinProvider` satisfies it; so do test doubles and custom
 * provider-shaped objects.
 *
 * The resulting `Signer` routes:
 *
 * - `signPsbt(psbt, options)` → `provider.request('bitcoin_signPsbt', { psbt, …options })`
 * - `signMessage(message, options)` → `provider.request('bitcoin_signMessage', { message, …options })`
 *
 * The return shapes follow the canonical {@link SignedPsbt} (Phase 0
 * decision) and `string`, respectively. Adapter authors are expected to
 * return those shapes from the underlying RPC.
 *
 * @module signer/from-provider
 *
 * @example
 * ```ts
 * import { providerSigner } from '@omnisat/lasereyes-client/wallet'
 *
 * const signer = providerSigner(connector.getProvider()!)
 * const walletClient = createWalletClient({ network, dataSource, account, signer })
 * ```
 */

import type { SignedPsbt, Signer, SignMessageOptions, SignPsbtOptions } from './types'

/**
 * The minimal provider shape this bridge needs.
 *
 * @remarks
 * Structurally identical to the `request` method of `BitcoinProvider` in
 * the core package, but defined here so the client package stays free of
 * a core-package dependency. Any object exposing a compatible `request`
 * method satisfies this — including every `BitcoinProvider` instance.
 */
export interface ProviderLike {
  request(method: string, params?: { [key: string]: unknown }): Promise<unknown>
}

/**
 * Wrap a `BitcoinProvider`-shaped object as a {@link Signer}.
 *
 * @param provider - The provider to wrap. Must implement `request(method, params?)`.
 * @returns A `Signer` that dispatches signing operations through the provider's
 *   RPC method namespace.
 */
export function providerSigner(provider: ProviderLike): Signer {
  return {
    async signPsbt(psbt: string, options?: SignPsbtOptions): Promise<SignedPsbt> {
      const result = await provider.request('bitcoin_signPsbt', {
        psbt,
        ...options,
      })
      return result as SignedPsbt
    },
    async signMessage(message: string, options?: SignMessageOptions): Promise<string> {
      const result = await provider.request('bitcoin_signMessage', {
        message,
        ...options,
      })
      return result as string
    },
  }
}
