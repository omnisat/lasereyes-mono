import { NetworkType, ProviderType } from '../types'

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
  requestAccounts(): Promise<string[]>
  getPublicKey(): Promise<string>
  getNetwork(): Promise<NetworkType>
  switchNetwork(network: NetworkType): Promise<void>
  signMessage(message: string): Promise<string>
  signPsbt(psbtBase64: string): Promise<string>
}

export type SignMessageOptions = {
  toSignAddress?: string
  protocol?: 'bip322' | 'ecdsa'
}
