/**
 * Lifecycle: switch the active wallet's network.
 *
 * @module actions/switchNetwork
 */

import type { ChainNetwork } from '@omnisat/lasereyes-client'
import { NetworkNotConfiguredError } from '@omnisat/lasereyes-client'
import type { LaserEyesConfig } from '../config'
import { invalidateClientCache, resolveConnector } from '../internal'

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
 *   backends: { mainnet: mempool(), testnet4: mempool() },
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
  const config extends LaserEyesConfig,
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

  // Verify the wallet landed on a chain we support BEFORE committing
  // the change to state. If it didn't, throw — the wallet has moved off
  // its previous chain regardless, but the `networkChanged` event
  // handler will pick that up on its own; state stays consistent with
  // what the action promises to return.
  const supported = config.chains as readonly ChainNetwork[]
  const resolved = supported.find(c => c.id === resolvedId)
  if (!resolved) {
    throw new NetworkNotConfiguredError(
      resolvedId,
      supported.map(c => c.id)
    )
  }

  // Drop any cached client for both chains — old one's wallet client is
  // stale, new one might have a read-only client cached from before
  // connect that needs to be replaced with a wallet client.
  const prev = config.state.$connection.get().networkId
  if (prev) invalidateClientCache(config, prev)
  invalidateClientCache(config, resolvedId)

  config.state.$connection.setKey('networkId', resolvedId)
  connector.onNetworkChanged?.(resolvedId)

  return resolved as Extract<config['chains'][number], { id: id }>
}
