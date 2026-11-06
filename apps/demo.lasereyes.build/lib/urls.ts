export const MEMPOOL_SPACE_URL = 'https://mempool.space'
export const MEMPOOL_SPACE_TESTNET_URL = 'https://mempool.space/testnet'
export const MEMPOOL_SPACE_TESTNET4_URL = 'https://mempool.space/testnet4'
export const MEMPOOL_SPACE_SIGNET_URL = 'https://mempool.space/signet'
export const MEMPOOL_SPACE_FRACTAL_MAINNET_URL = 'https://mempool.fractalbitcoin.io'
export const MEMPOOL_SPACE_FRACTAL_TESTNET_URL = 'https://mempool-testnet.fractalbitcoin.io'

/**
 * Resolve a mempool.space base URL from a LaserEyes network id
 * (`'mainnet'`, `'testnet'`, …).
 */
export const getMempoolSpaceUrl = (network: string) => {
  switch (network) {
    case 'testnet':
      return MEMPOOL_SPACE_TESTNET_URL
    case 'testnet4':
      return MEMPOOL_SPACE_TESTNET4_URL
    case 'signet':
      return MEMPOOL_SPACE_SIGNET_URL
    case 'fractal-mainnet':
      return MEMPOOL_SPACE_FRACTAL_MAINNET_URL
    case 'fractal-testnet':
      return MEMPOOL_SPACE_FRACTAL_TESTNET_URL
    default:
      return MEMPOOL_SPACE_URL
  }
}
