/**
 * Signer types for transaction and message signing.
 *
 * @remarks
 * The signer is responsible for cryptographic signing only. Address knowledge
 * lives on the {@link Account}; signing capability lives here. Different
 * implementations can target browser-extension wallets, hardware wallets,
 * remote signers, or in-process keys.
 *
 * @module signer/types
 */

/**
 * Options for signing a PSBT.
 */
export interface SignPsbtOptions {
  /** Whether to finalize the PSBT after signing. */
  finalize?: boolean
  /**
   * Whether to ask the signer to broadcast the transaction after finalization.
   *
   * @remarks
   * Honored only by signers that wrap a wallet provider with a built-in
   * broadcast endpoint (e.g. `bitcoin_pushPsbt`). Most local signers ignore
   * this and require an explicit broadcast call afterwards.
   */
  broadcast?: boolean
  /**
   * Specific inputs to sign. If omitted, the signer signs every input it can.
   */
  inputsToSign?: Array<{ index: number; address: string }>
}

/**
 * Result of signing a PSBT.
 *
 * @remarks
 * Always carries the signed PSBT in both hex and base64. `txId` is populated
 * only when the signer broadcasts; `txHex` only when the PSBT is fully
 * finalized.
 */
export interface SignedPsbt {
  /** Signed PSBT, hex-encoded. */
  psbtHex: string
  /** Signed PSBT, base64-encoded. */
  psbtBase64: string
  /** Transaction ID, present only if the signer broadcast the finalized tx. */
  txId?: string
  /** Raw transaction hex, present only if the PSBT was fully finalized. */
  txHex?: string
}

/**
 * Message-signing protocols supported by the standard signer interface.
 *
 * @remarks
 * - `'ecdsa'`: legacy ECDSA message signing (Bitcoin Core compatible).
 * - `'bip322'`: BIP-322 generic message signing (works with any address type).
 */
export type MessageSigningProtocol = 'ecdsa' | 'bip322'

/**
 * Options for signing a message.
 */
export interface SignMessageOptions {
  /**
   * Address to sign with. Falls back to the account's payment address when
   * omitted.
   */
  address?: string
  /** Signing protocol; defaults to `'ecdsa'`. */
  protocol?: MessageSigningProtocol
}

/**
 * Signer interface.
 *
 * @remarks
 * Implementations handle the cryptographic operations, typically by delegating
 * to a wallet provider, hardware device, or local key. The signer is
 * passed to {@link createWalletClient} via `config.signer` and reached by
 * the actions installed by {@link walletBtcActions}.
 *
 * @example
 * ```ts
 * const signer: Signer = {
 *   async signPsbt(psbt, options) {
 *     const signed = await window.unisat.signPsbt(psbt, options)
 *     return { psbtHex: signed, psbtBase64: ... }
 *   },
 *   async signMessage(message, options) {
 *     return window.unisat.signMessage(message, options?.protocol)
 *   },
 * }
 * ```
 */
export interface Signer {
  /**
   * Sign a Partially Signed Bitcoin Transaction (PSBT).
   *
   * @param psbt - PSBT to sign, hex- or base64-encoded.
   * @param options - Signing options.
   * @throws Error if signing or finalization fails or the user rejects.
   */
  signPsbt(psbt: string, options?: SignPsbtOptions): Promise<SignedPsbt>

  /**
   * Sign an arbitrary message.
   *
   * @param message - The message to sign.
   * @param options - Signing options including address and protocol.
   * @returns Signature string (encoding depends on protocol).
   * @throws Error if signing fails or the user rejects.
   */
  signMessage(message: string, options?: SignMessageOptions): Promise<string>
}
