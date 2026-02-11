import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  OYLNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import { BaseNetwork, type NetworkType } from '../types'

export const SANDSHREW_URL_MAINNET = 'https://mainnet.sandshrew.io/v2'
export const SANDSHREW_URL_SIGNET = 'https://signet.sandshrew.io/v2'
export const SANDSHREW_URL_TESTNET = 'https://testnet.sandshrew.io/v2'
export const SANDSHREW_URL_OYLNET = 'https://oylnet.oyl.gg/v2'

export const SANDSHREW_LASEREYES_KEY = 'lasereyes'

export const MAESTRO_API_URL_MAINNET = 'https://xbt-mainnet.gomaestro-api.org/v0'
export const MAESTRO_API_URL_TESTNET4 = 'https://xbt-testnet.gomaestro-api.org/v0'

export const MEMPOOL_SPACE_URL = 'https://mempool.space'
export const MEMPOOL_SPACE_URL_TESTNET = 'https://mempool.space/testnet'
export const MEMPOOL_SPACE_URL_TESTNET4 = 'https://mempool.space/testnet4'
export const MEMPOOL_SPACE_URL_SIGNET = 'https://mempool.space/signet'
export const MEMPOOL_SPACE_URL_FRACTAL_MAINNET = 'https://mempool.fractalbitcoin.io'
export const MEMPOOL_SPACE_URL_FRACTAL_TESTNET = 'https://mempool-testnet.fractalbitcoin.io'

export const getMempoolSpaceUrl = (network: NetworkType) => {
  switch (network) {
    case TESTNET:
      return MEMPOOL_SPACE_URL_TESTNET
    case TESTNET4:
      return MEMPOOL_SPACE_URL_TESTNET4
    case SIGNET:
      return MEMPOOL_SPACE_URL_SIGNET
    case FRACTAL_MAINNET:
      return MEMPOOL_SPACE_URL_FRACTAL_MAINNET
    case FRACTAL_TESTNET:
      return MEMPOOL_SPACE_URL_FRACTAL_TESTNET
    default:
      return MEMPOOL_SPACE_URL
  }
}

export const getMaestroUrl = (network: NetworkType) => {
  return network === BaseNetwork.TESTNET4 ? MAESTRO_API_URL_TESTNET4 : MAESTRO_API_URL_MAINNET
}

export const getSandshrewUrl = (network: NetworkType) => {
  switch (network) {
    case OYLNET:
      return SANDSHREW_URL_OYLNET
    case TESTNET:
      return SANDSHREW_URL_TESTNET
    case SIGNET:
      return SANDSHREW_URL_SIGNET
    default:
      return SANDSHREW_URL_MAINNET
  }
}
