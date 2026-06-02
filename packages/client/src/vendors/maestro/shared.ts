/**
 * Shared internal helpers for the maestro vendor.
 *
 * @module vendors/maestro/shared
 * @internal
 */

import type { NetworkId } from '../../chains'
import { ChainBackendError } from '../../errors'
import type { MaestroConfig } from './config'

const MAESTRO_API_URL_MAINNET = 'https://xbt-mainnet.gomaestro-api.org/v0'
const MAESTRO_API_URL_TESTNET4 = 'https://xbt-testnet.gomaestro-api.org/v0'

const getMaestroUrl = (network: NetworkId) => {
  return network === 'testnet4' ? MAESTRO_API_URL_TESTNET4 : MAESTRO_API_URL_MAINNET
}

/**
 * Resolve the (apiUrl, apiKey) pair for a given network.
 */
export function resolveUrlAndKey(
  network: NetworkId,
  config: MaestroConfig
): { apiUrl: string; apiKey: string } {
  if (config.networks?.[network]) {
    return {
      apiUrl: config.networks[network].apiUrl,
      apiKey: config.networks[network].apiKey,
    }
  }
  return {
    apiUrl: getMaestroUrl(network),
    apiKey: network === 'testnet4' ? config.testnetApiKey || config.apiKey : config.apiKey,
  }
}

/**
 * Issue a GET against the maestro API.
 */
export async function maestroGet(apiUrl: string, apiKey: string, endpoint: string) {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
  })
  if (!response.ok) {
    throw new ChainBackendError(`Maestro API error: HTTP ${response.status}`, 'maestro')
  }
  return response.json()
}

/**
 * Issue a POST against the maestro API.
 */
export async function maestroPost(apiUrl: string, apiKey: string, endpoint: string, body: unknown) {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new ChainBackendError(`Maestro API error: HTTP ${response.status}`, 'maestro')
  }
  return response.json()
}
