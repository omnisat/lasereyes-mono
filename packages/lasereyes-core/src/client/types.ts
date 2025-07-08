import type { NetworkType, ProviderType } from '../types'
import type { BIP322, ECDSA } from '../constants/signing-protocol'

export * from './modules/types'

export type LaserEyesStoreType = {
  provider: ProviderType | undefined
  address: string
  paymentAddress: string
  publicKey: string
  paymentPublicKey: string
  connected: boolean
  isConnecting: boolean
  isInitializing: boolean
  accounts: string[]
  balance: bigint | undefined
  hasProvider: Record<ProviderType, boolean | undefined>
}

export interface SparrowWalletProvider {
  requestAccounts(network?: NetworkType): Promise<string[]>
  getPublicKey(network?: NetworkType): Promise<string>
  getNetwork(): Promise<NetworkType>
  switchNetwork(network: NetworkType): Promise<void | {
    address: string
    paymentAddress: string
    publicKey: string
  }>
  signMessage(message: string): Promise<string>
  signPsbt(psbtBase64: string): Promise<string>
}

export type SignMessageOptions = {
  toSignAddress?: string
  protocol?: typeof BIP322 | typeof ECDSA
}

export type LaserEyesSignPsbtOptions = {
  tx: string
  finalize?: boolean
  broadcast?: boolean
  inputsToSign?: InputToSign[]
}

export type LaserEyesSignPsbtsOptions = {
  psbts: { tx: string; inputsToSign?: InputToSign[] }[]
  finalize?: boolean
  broadcast?: boolean
}

export type InputToSign = {
  index: number
  address: string
}

export type WalletProviderSignPsbtOptions = {
  tx: string
  psbtHex: string
  psbtBase64: string
  finalize?: boolean
  broadcast?: boolean
  inputsToSign?: InputToSign[]
  network?: NetworkType
}

export type WalletProviderSignPsbtsOptions = {
  psbts: {
    tx: string
    psbtHex: string
    psbtBase64: string
    inputsToSign?: InputToSign[]
  }[]
  finalize?: boolean
  broadcast?: boolean
  network?: NetworkType
}

export type SignPsbtResponse =
  | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
  | undefined

export type SignPsbtsResponse =
  | {
      signedPsbts: {
        signedPsbtHex: string | undefined
        signedPsbtBase64: string | undefined
        txId?: string | undefined
      }[]
    }
  | undefined
