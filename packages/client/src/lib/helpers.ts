import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import type { NetworkType } from '../types'

export interface BitcoinNetwork {
  bech32: string
  pubKeyHash: number
  scriptHash: number
  wif: number
}

export const BITCOIN_NETWORK: BitcoinNetwork = {
  bech32: 'bc',
  pubKeyHash: 0,
  scriptHash: 5,
  wif: 128,
}

export const BITCOIN_TEST_NETWORK: BitcoinNetwork = {
  bech32: 'tb',
  pubKeyHash: 111,
  scriptHash: 196,
  wif: 239,
}

export const getBitcoinNetwork = (network: NetworkType): BitcoinNetwork => {
  if (network === TESTNET || network === TESTNET4 || network === SIGNET) {
    return BITCOIN_TEST_NETWORK
  }
  return BITCOIN_NETWORK
}

export function estimateTxSize(
  taprootInputCount: number,
  nonTaprootInputCount: number,
  outputCount: number
): number {
  const baseTxSize = 10
  const taprootInputSize = 57
  const nonTaprootInputSize = 41
  const outputSize = 34
  const totalInputSize =
    taprootInputCount * taprootInputSize + nonTaprootInputCount * nonTaprootInputSize
  const totalOutputSize = outputCount * outputSize
  return baseTxSize + totalInputSize + totalOutputSize
}

export const satoshisToBTC = (satoshis: number): string => {
  if (Number.isNaN(satoshis) || satoshis === undefined) return '--'
  const btcValue = satoshis / 100000000
  return btcValue.toFixed(8)
}

export const isTestnetNetwork = (network: NetworkType) => {
  return network === TESTNET || network === TESTNET4 || network === SIGNET
}

export const isMainnetNetwork = (network: NetworkType) => {
  return network === MAINNET || network === FRACTAL_MAINNET || network === FRACTAL_TESTNET
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
