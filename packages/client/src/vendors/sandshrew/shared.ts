/**
 * Shared internal helpers for the sandshrew vendor.
 *
 * @module vendors/sandshrew/shared
 * @internal
 */

import type { NetworkId } from '../../chains'
import type { SandshrewConfig } from './config'

const SANDSHREW_URL_MAINNET = 'https://mainnet.sandshrew.io/v2'
const SANDSHREW_URL_SIGNET = 'https://signet.sandshrew.io/v2'
const SANDSHREW_URL_TESTNET = 'https://testnet.sandshrew.io/v2'
const SANDSHREW_URL_OYLNET = 'https://oylnet.oyl.gg/v2'

const SANDSHREW_LASEREYES_KEY = 'lasereyes'

const getSandshrewUrl = (network: NetworkId) => {
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

/**
 * Resolve the (url, key) pair to use for a given network.
 *
 * @remarks
 * Precedence: per-network override → testnet/mainnet fallback override →
 * built-in URL with the configured API key (or the LaserEyes default).
 */
export function resolveUrl(
  network: NetworkId,
  config?: SandshrewConfig
): { url: string; key: string } {
  if (config?.networks?.[network]) {
    return {
      url: config.networks[network].apiUrl,
      key: config.networks[network].apiKey,
    }
  }
  const isTestnet =
    network === 'testnet' ||
    network === 'testnet4' ||
    network === 'signet' ||
    network === 'fractal-testnet'
  const fallbackNet = isTestnet ? 'signet' : 'mainnet'
  if (config?.networks?.[fallbackNet]) {
    return {
      url: config.networks[fallbackNet].apiUrl,
      key: config.networks[fallbackNet].apiKey,
    }
  }
  return {
    url: getSandshrewUrl(network),
    key: config?.apiKey || SANDSHREW_LASEREYES_KEY,
  }
}
