/** The result of building an unsigned PSBT, provided in both base64 and hex encodings. */
export interface PsbtResult {
  /** The unsigned PSBT encoded as a base64 string. */
  psbtBase64: string
  /** The unsigned PSBT encoded as a hex string. */
  psbtHex: string
}

/**
 * A callback function used to sign a PSBT via a wallet provider.
 *
 * @param params - The PSBT data and signing options
 * @param params.psbtHex - The PSBT to sign as a hex string
 * @param params.psbtBase64 - The PSBT to sign as a base64 string
 * @param params.finalize - Whether the wallet should finalize the PSBT after signing
 * @param params.broadcast - Whether the wallet should broadcast the transaction after signing
 * @returns The signed PSBT and/or broadcast transaction ID, or `undefined` if signing was cancelled
 */
export type SignPsbtCallback = (params: {
  psbtHex: string
  psbtBase64: string
  finalize?: boolean
  broadcast?: boolean
}) => Promise<{ signedPsbtHex?: string; signedPsbtBase64?: string; txId?: string } | undefined>

/**
 * Bitcoin address types used for PSBT input construction.
 *
 * @remarks
 * The address type determines which script and witness data structures are needed
 * when building PSBT inputs (e.g., P2SH-P2WPKH requires a redeem script).
 */
export enum AddressType {
  /** Pay-to-Public-Key-Hash (legacy). */
  P2PKH = 0,
  /** Pay-to-Taproot (SegWit v1). */
  P2TR = 1,
  /** Pay-to-Script-Hash wrapping Pay-to-Witness-Public-Key-Hash (nested SegWit). */
  P2SH_P2WPKH = 2,
  /** Pay-to-Witness-Public-Key-Hash (native SegWit v0). */
  P2WPKH = 3,
}
