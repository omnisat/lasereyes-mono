/**
 * Signer module — types and (later) bridge factories.
 *
 * @remarks
 * The signer is the cryptographic-signing capability injected into a
 * {@link createWalletClient | WalletClient} via {@link signingActions}.
 *
 * @module signer
 */

export type {
  MessageSigningProtocol,
  SignedPsbt,
  Signer,
  SignMessageOptions,
  SignPsbtOptions,
} from './types'
