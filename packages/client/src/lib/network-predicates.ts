import type { NetworkId } from '../chains'

export const isTestnetNetwork = (network: NetworkId) => {
  return network === 'testnet' || network === 'testnet4' || network === 'signet'
}

export const isMainnetNetwork = (network: NetworkId) => {
  return network === 'mainnet' || network === 'fractal-mainnet' || network === 'fractal-testnet'
}
