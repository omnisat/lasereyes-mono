/**
 * Signer interface for transaction and message signing.
 *
 * @remarks
 * The Signer is responsible for actual cryptographic signing operations. It is
 * injected into wallet clients and used by signing actions. Different implementations
 * can support browser extension wallets, hardware wallets, or multi-sig coordinators.
 *
 * @module types/signer
 */

/**
 * Options for signing a PSBT.
 */
export interface SignPsbtOptions {
  /** Whether to finalize the PSBT after signing */
  finalize?: boolean
  /** Specific inputs to sign (optional, signs all by default) */
  inputsToSign?: Array<{ index: number; address: string }>
}

/**
 * Result of signing a PSBT.
 */
export interface SignedPsbt<finalize extends boolean = false> {
  /** Signed PSBT in base64 format */
  psbt: string
  /** Raw transaction hex if finalized */
  txHex: finalize extends true ? string : never
}

/**
 * Options for signing a message.
 */
export interface SignMessageOptions {
  /** Address to use for signing (if different from default) */
  address?: string
  /** Signing protocol to use */
  protocol?: 'BIP-322' | 'ECDSA'
}

/**
 * Signer interface for wallet operations.
 *
 * @remarks
 * Implementations of this interface handle the actual signing logic, typically
 * by delegating to a wallet provider (browser extension, hardware device, etc.).
 * The signer is passed to wallet clients and used by signing actions.
 *
 * @example
 * ```ts
 * // Example signer implementation
 * const signer: Signer = {
 *   async signPsbt(options) {
 *     const signed = await window.unisat.signPsbt(options.psbt)
 *     return { psbtHex: signed }
 *   },
 *   async signMessage(message, options) {
 *     return await window.unisat.signMessage(message, options?.address)
 *   }
 * }
 * ```
 */
export interface Signer {
  /**
   * Sign a Partially Signed Bitcoin Transaction (PSBT).
   *
   * @param psbt - PSBT to sign (hex or base64 encoded)
   * @param options - Signing options
   * @returns Signed PSBT and optionally transaction hex if finalized
   * @throws {Error} If signing/finalizing fails or is rejected by user
   */
  signPsbt<optionsT extends SignPsbtOptions>(psbt: string, options?: optionsT): Promise<SignedPsbt<NonNullable<optionsT['finalize']>>>

  /**
   * Sign an arbitrary message with a Bitcoin address.
   *
   * @param message - Message to sign
   * @param options - Signing options including address and protocol
   * @returns Signature string
   * @throws {Error} If signing fails or is rejected by user
   */
  signMessage(message: string, options?: SignMessageOptions): Promise<string>
}
