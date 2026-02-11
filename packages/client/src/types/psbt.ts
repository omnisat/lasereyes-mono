export interface PsbtResult {
  psbtBase64: string
  psbtHex: string
}

export type SignPsbtCallback = (params: {
  psbtHex: string
  psbtBase64: string
  finalize?: boolean
  broadcast?: boolean
}) => Promise<{ signedPsbtHex?: string; signedPsbtBase64?: string; txId?: string } | undefined>

export enum AddressType {
  P2PKH = 0,
  P2TR = 1,
  P2SH_P2WPKH = 2,
  P2WPKH = 3,
}
