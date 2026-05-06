/**
 * Shared internal helpers for the maestro vendor.
 *
 * @module vendors/maestro/shared
 * @internal
 */

import type { NetworkId } from '../../chains'
import { DataSourceError } from '../../errors'
import { getMaestroUrl } from '../../lib/urls'
import type { MaestroConfig } from './config'

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
    throw new DataSourceError(`Maestro API error: HTTP ${response.status}`, 'maestro')
  }
  return response.json()
}

/**
 * Issue a POST against the maestro API.
 */
export async function maestroPost(
  apiUrl: string,
  apiKey: string,
  endpoint: string,
  body: unknown
) {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new DataSourceError(`Maestro API error: HTTP ${response.status}`, 'maestro')
  }
  return response.json()
}
