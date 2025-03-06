import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import { NetworkType } from '../types'


export const SANDSHREW_URL: string = 'https://mainnet.sandshrew.io/v1/'

export const SANDSHREW_LASEREYES_KEY: string = "lasereyes"
export const MAESTRO_API_KEY_MAINNET: string = "VIOi9IApvUkDFWBQ7I9oHsfUMWOIfDeO"
export const MAESTRO_API_KEY_TESTNET4: string = "bVG4GSXShooC9f67hq5YQWAJfZyRPrEN"

export const MAESTRO_API_URL_MAINNET: string = "https://xbt-mainnet.gomaestro-api.org/v0"
export const MAESTRO_API_URL_TESTNET4: string = "https://xbt-testnet.gomaestro-api.org/v0"

export const MEMPOOL_SPACE_URL = 'https://mempool.space'
export const MEMPOOL_SPACE_TESTNET_URL = 'https://mempool.space/testnet'
export const MEMPOOL_SPACE_TESTNET4_URL = 'https://mempool.space/testnet4'
export const MEMPOOL_SPACE_SIGNET_URL = 'https://mempool.space/signet'
export const MEMPOOL_SPACE_FRACTAL_MAINNET_URL =
  'https://mempool.fractalbitcoin.io'
export const MEMPOOL_SPACE_FRACTAL_TESTNET_URL =
  'https://mempool-testnet.fractalbitcoin.io'

export const getMempoolSpaceUrl = (network: NetworkType) =>
  network === TESTNET
    ? MEMPOOL_SPACE_TESTNET_URL
    : network === TESTNET4
      ? MEMPOOL_SPACE_TESTNET4_URL
      : network === SIGNET
        ? MEMPOOL_SPACE_SIGNET_URL
        : network === FRACTAL_MAINNET
          ? MEMPOOL_SPACE_FRACTAL_MAINNET_URL
          : network === FRACTAL_TESTNET
            ? MEMPOOL_SPACE_FRACTAL_TESTNET_URL
            : MEMPOOL_SPACE_URL

export const getMaestroUrl = (network: NetworkType) =>
  network === TESTNET4
    ? MAESTRO_API_URL_TESTNET4
    : MAESTRO_API_URL_MAINNET

