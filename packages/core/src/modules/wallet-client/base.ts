export type Account = {
  publicKey: string;
  address: string;
}

export type MainnetBitcoinAddress = `1${string}` | `3${string}` | `bc1${string}`;

export type TestnetBitcoinAddress = `2${string}` | `bcrt${string}` | `tb1${string}`

export type BitcoinAddress = MainnetBitcoinAddress | TestnetBitcoinAddress

export type BitcoinNetwork = 'mainnet' | 'regtest'

export type TXID = `0x${string}`

export type SignPSBTReturnType = {}

export type SignMessageReturnType = {}

export interface BaseWalletClient {
  /** Returns a list of account addresses owned by the wallet or client. */
  getAddresses(): Promise<BitcoinAddress[]>;

  /** Returns the network currently connected to */
  getNetwork(): Promise<BitcoinNetwork>;

  requestAddresses(): Promise<BitcoinAddress[]>

  pushPSBT(): Promise<TXID>

  signPSBT(): Promise<SignPSBTReturnType>

  signMessage(): Promise<SignMessageReturnType>

  switchNetwork(): Promise<void>
}
