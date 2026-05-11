/**
 * Signer module — types and provider-bridge factory.
 *
 * @remarks
 * The signer is the cryptographic-signing capability injected into a
 * {@link createWalletClient | WalletClient} via `config.signer` (or,
 * historically, via {@link signingActions}). {@link providerSigner} wraps
 * any `BitcoinProvider`-shaped object as a `Signer`, which is the bridge
 * the core package's keystone uses to plug a connector's provider into
 * the client.
 *
 * @module signer
 */

export { providerSigner, type ProviderLike } from './from-provider'
export type {
  MessageSigningProtocol,
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
} from './types'
