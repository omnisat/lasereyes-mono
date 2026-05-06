/**
 * Shared internal helpers for the sandshrew vendor.
 *
 * @module vendors/sandshrew/shared
 * @internal
 */

import type { NetworkId } from '../../chains'
import { getSandshrewUrl, SANDSHREW_LASEREYES_KEY } from '../../lib/urls'
import type { SandshrewConfig } from './config'

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
