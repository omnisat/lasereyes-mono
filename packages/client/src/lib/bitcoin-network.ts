import type { NetworkId } from '../chains'

export interface BitcoinNetwork {
  bech32: string
  pubKeyHash: number
  scriptHash: number
  wif: number
}

const BITCOIN_NETWORK: BitcoinNetwork = {
  bech32: 'bc',
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128,
}

const BITCOIN_TEST_NETWORK: BitcoinNetwork = {
  bech32: 'tb',
  pubKeyHash: 111,
  scriptHash: 196,
  wif: 239,
}

export const getBitcoinNetwork = (network: NetworkId): BitcoinNetwork => {
  if (network === 'testnet' || network === 'testnet4' || network === 'signet') {
    return BITCOIN_TEST_NETWORK
  }
  return BITCOIN_NETWORK
}
