import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import { BaseNetwork, type BaseNetworkType, type NetworkType } from '../types'


export const SANDSHREW_URL: string = 'https://mainnet.sandshrew.io/v1/'
export const SANDSHREW_URL_TESTNET: string = 'https://signet.sandshrew.io/v1/'

export const SANDSHREW_LASEREYES_KEY: string = "lasereyes"
export const MAESTRO_API_KEY_MAINNET: string = "VIOi9IApvUkDFWBQ7I9oHsfUMWOIfDeO"
export const MAESTRO_API_KEY_TESTNET4: string = "bVG4GSXShooC9f67hq5YQWAJfZyRPrEN"

export const MAESTRO_API_URL_MAINNET: string = "https://xbt-mainnet.gomaestro-api.org/v0"
export const MAESTRO_API_URL_TESTNET4: string = "https://xbt-testnet.gomaestro-api.org/v0"

export const MEMPOOL_SPACE_URL = 'https://mempool.space'
export const MEMPOOL_SPACE_URL_TESTNET = 'https://mempool.space/testnet'
export const MEMPOOL_SPACE_URL_TESTNET4 = 'https://mempool.space/testnet4'
export const MEMPOOL_SPACE_URL_SIGNET = 'https://mempool.space/signet'
export const MEMPOOL_SPACE_URL_FRACTAL_MAINNET =
  'https://mempool.fractalbitcoin.io'
export const MEMPOOL_SPACE_URL_FRACTAL_TESTNET =
  'https://mempool-testnet.fractalbitcoin.io'

export const UNISAT_CONTENT_URL_MAINNET: string = "https://static.unisat.io/content"
export const UNISAT_CONTENT_URL_TESTNET: string = "https://static-testnet.unisat.io/content"
export const UNISAT_CONTENT_URL_TESTNET4: string = "https://ordinals-testnet4.unisat.io/content"
export const UNISAT_CONTENT_URL_FRACTAL_MAINNET: string = "https://ordinals.fractalbitcoin.io/content"
export const UNISAT_CONTENT_URL_FRACTAL_TESTNET: string = "https://ordinals-testnet.fractalbitcoin.io/content"

export const UNISAT_PREVIEW_URL_MAINNET: string = "https://static.unisat.io/preview"
export const UNISAT_PREVIEW_URL_TESTNET: string = "https://static-testnet.unisat.io/preview"
export const UNISAT_PREVIEW_URL_TESTNET4: string = "https://ordinals-testnet4.unisat.io/preview"
export const UNISAT_PREVIEW_URL_FRACTAL_MAINNET: string = "https://ordinals.fractalbitcoin.io/preview"
export const UNISAT_PREVIEW_URL_FRACTAL_TESTNET: string = "https://ordinals-testnet.fractalbitcoin.io/preview"


export const getMempoolSpaceUrl = (network: NetworkType) =>
  network === TESTNET
    ? MEMPOOL_SPACE_URL_TESTNET
    : network === TESTNET4
      ? MEMPOOL_SPACE_URL_TESTNET4
      : network === SIGNET
        ? MEMPOOL_SPACE_URL_SIGNET
        : network === FRACTAL_MAINNET
          ? MEMPOOL_SPACE_URL_FRACTAL_MAINNET
          : network === FRACTAL_TESTNET
            ? MEMPOOL_SPACE_URL_FRACTAL_TESTNET
            : MEMPOOL_SPACE_URL

export const getMaestroUrl = (network: NetworkType, baseNetwork?: BaseNetworkType) => {
  if (baseNetwork) {
    return baseNetwork === BaseNetwork.MAINNET
      ? MAESTRO_API_URL_MAINNET
      : MAESTRO_API_URL_TESTNET4
  }
  return network === BaseNetwork.TESTNET4
    ? MAESTRO_API_URL_TESTNET4
    : MAESTRO_API_URL_MAINNET
}

export const getSandshrewUrl = (network: NetworkType, baseNetwork?: BaseNetworkType) => {
  if (baseNetwork) {
    return baseNetwork === BaseNetwork.MAINNET
      ? SANDSHREW_URL
      : SANDSHREW_URL_TESTNET
  }
  return network === BaseNetwork.TESTNET || 
         network === BaseNetwork.TESTNET4 || 
         network === BaseNetwork.SIGNET ||
         network === BaseNetwork.FRACTAL_TESTNET
    ? SANDSHREW_URL_TESTNET
    : SANDSHREW_URL
}

export const getUnisatContentUrl = (network: NetworkType) => {
  return network === TESTNET
    ? UNISAT_CONTENT_URL_TESTNET
    : network === TESTNET4
      ? UNISAT_CONTENT_URL_TESTNET4
      : network === SIGNET
        ? UNISAT_CONTENT_URL_TESTNET
        : network === FRACTAL_MAINNET
          ? UNISAT_CONTENT_URL_FRACTAL_MAINNET
          : network === FRACTAL_TESTNET
            ? UNISAT_CONTENT_URL_FRACTAL_TESTNET
            : UNISAT_CONTENT_URL_MAINNET
}

export const getUnisatPreviewUrl = (network: NetworkType) => {
  return network === TESTNET
    ? UNISAT_PREVIEW_URL_TESTNET
    : network === TESTNET4
      ? UNISAT_PREVIEW_URL_TESTNET4
      : network === SIGNET
        ? UNISAT_PREVIEW_URL_TESTNET
        : network === FRACTAL_MAINNET
          ? UNISAT_PREVIEW_URL_FRACTAL_MAINNET
          : network === FRACTAL_TESTNET
            ? UNISAT_PREVIEW_URL_FRACTAL_TESTNET
            : UNISAT_PREVIEW_URL_MAINNET
}

