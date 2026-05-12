/**
 * Lifecycle: switch the active wallet's network.
 *
 * @module actions/switchNetwork
 */

import type { ChainNetwork } from '@omnisat/lasereyes-client'
import { UnsupportedNetworkError } from '@omnisat/lasereyes-client'
import type { LaserEyesConfig } from '../config'
import { resolveConnector } from '../internal'

/**
 * Switch the active wallet to a different network.
 *
 * @remarks
 * Threading discipline showcase — `networkId` is constrained to the chain
 * IDs the config carries, and the return type narrows to the *specific*
 * chain matching the passed `networkId`.
 *
 * @example
 * ```ts
 * const config = createLaserEyesConfig({
 *   chains: [MAINNET, TESTNET4],
 *   transports: { mainnet: [...], testnet4: [...] },
 * })
 *
 * const resolved = await switchNetwork(config, 'mainnet')
 * //    ^? Promise<typeof MAINNET>   (narrowed via Extract)
 *
 * await switchNetwork(config, 'signet')
 * //                          ^^^^^^^^ ❌ TS rejects — not in the chains tuple
 * ```
 *
 * @returns The resolved chain matching `networkId`.
 *
 * @throws {Error} If no wallet is connected, or the connector lacks
 *   `switchNetwork` support.
 */
export async function switchNetwork<
  const config extends LaserEyesConfig<any, any, any>,
  const id extends config['chains'][number]['id'],
>(
  config: config,
  networkId: id
): Promise<
  Extract<config['chains'][number], { id: id }> extends never
    ? ChainNetwork
    : Extract<config['chains'][number], { id: id }>
> {
  const connector = resolveConnector(config)
  if (!connector.switchNetwork) {
    throw new Error(`Connector '${connector.id}' does not support switchNetwork`)
  }

  // Trust the adapter's normalized return value — it's the adapter's
  // job to map the wallet's native chain identifier into a spec
  // {@link NetworkId}. Some wallets may even fall back to a different
  // chain than requested if the requested one isn't available; the
  // adapter reports what actually happened.
  const resolvedId = await connector.switchNetwork(networkId as never)
  config.state.$connection.setKey('networkId', resolvedId)
  connector.onNetworkChanged?.(resolvedId)

  const supported = config.chains as readonly ChainNetwork[]
  const resolved = supported.find(c => c.id === resolvedId)
  if (!resolved) {
    throw new UnsupportedNetworkError(
      resolvedId,
      supported.map(c => c.id)
    )
  }

  return resolved as Extract<config['chains'][number], { id: id }>
}
