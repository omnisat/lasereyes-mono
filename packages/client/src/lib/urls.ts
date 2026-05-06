import type { NetworkId } from '../chains'

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

export const getMempoolSpaceUrl = (network: NetworkId) => {
  switch (network) {
    case 'testnet':
      return MEMPOOL_SPACE_URL_TESTNET
    case 'testnet4':
      return MEMPOOL_SPACE_URL_TESTNET4
    case 'signet':
      return MEMPOOL_SPACE_URL_SIGNET
    case 'fractal-mainnet':
      return MEMPOOL_SPACE_URL_FRACTAL_MAINNET
    case 'fractal-testnet':
      return MEMPOOL_SPACE_URL_FRACTAL_TESTNET
    default:
      return MEMPOOL_SPACE_URL
  }
}

export const getMaestroUrl = (network: NetworkId) => {
  return network === 'testnet4' ? MAESTRO_API_URL_TESTNET4 : MAESTRO_API_URL_MAINNET
}

export const getSandshrewUrl = (network: NetworkId) => {
  switch (network) {
    case 'oylnet':
      return SANDSHREW_URL_OYLNET
    case 'testnet':
      return SANDSHREW_URL_TESTNET
    case 'signet':
      return SANDSHREW_URL_SIGNET
    default:
      return SANDSHREW_URL_MAINNET
  }
}
