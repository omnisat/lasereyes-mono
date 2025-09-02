import type { BitcoinNetwork } from "../network/types";
import type { MessageSigningProtocol } from "../shared/types";

export type BitcoinAccount = {
  publicKey: BitcoinPublicKey;
  address: BitcoinAddress;
}

export type MainnetBitcoinAddress = `1${string}` | `3${string}` | `bc1${string}`;

export type TestnetBitcoinAddress = `2${string}` | `bcrt${string}` | `tb1${string}`

export type BitcoinAddress = MainnetBitcoinAddress | TestnetBitcoinAddress | string

export type BitcoinPublicKey = `${string}`

export type InputToSign = {
  index: number
  address: BitcoinAddress
}
export type SignPSBTOptionsType = Partial<{
  broadcast: boolean
  finalize: boolean
  inputsToSign?: InputToSign[]
}>

export type SignPSBTReturnType = {
  txID?: string;
  signedPSBTHex: string;
  signedPSBTbase64: string;
}

export type RequestAccountsOptionsType = Partial<{
  network: BitcoinNetwork
}>

export type PushPSBTOptionsType = Partial<{
  // Force to bypass the user's wallet if provided
  skipWallet: boolean
  broadcastTxFn: (tx: string, network: BitcoinNetwork) => PromiseLike<string>
}>

export type SignMessageOptionsType = Partial<{
  protocol: MessageSigningProtocol
}>

export type SignMessageReturnType = {
  signedMessage: string;
  protocol: MessageSigningProtocol
}

// TODO: Shoudl we add an option to specify which kinds of addresses to return? (e.g 'segwit', 'native segwit', 'taproot')
export type GetAddressesOptionsType = unknown

export type SwitchNetworkOptionsType = unknown

export type GetNetworkOptionsType = unknown
