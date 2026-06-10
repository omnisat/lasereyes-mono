'use client'

import { useStore } from '@nanostores/react'
import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import { switchNetwork as switchNetworkAction } from '@omnisat/lasereyes-core/actions'
import { useCallback } from 'react'
import { useConfig } from '../providers/context'
import type { ConfigNetworkId, ConfigParameter, ResolvedRegister } from '../types'

/** Result of {@link useNetwork}, narrowed to the config's chains. */
export interface UseNetworkResult<config extends LaserEyesConfig = ResolvedRegister['config']> {
  /** Active network id — the configured chains' id union. */
  network: ConfigNetworkId<config>
  /**
   * The configured chains, in declaration order — handy for rendering a network
   * switcher without reaching for `useConfig().chains`. Each entry carries its
   * `id` (the literal union) and the rest of the `ChainNetwork` shape.
   */
  chains: config['chains']
  /**
   * Ask the wallet to switch networks; resolves to the network it landed on.
   * `networkId` is restricted to the configured chains (passing an unconfigured
   * id is a compile error), mirroring the core action.
   */
  switchNetwork: (networkId: ConfigNetworkId<config>) => Promise<unknown>
}

/**
 * Read the active network and switch it.
 *
 * @remarks
 * `switchNetwork` dispatches the core action, which asks the connected wallet to
 * change chains and verifies it landed on a supported one before committing.
 * Both `network` and `switchNetwork`'s argument are narrowed to the configured
 * chains' id union (via `Register` or an explicit `{ config }`).
 *
 * @param parameters - Optional `{ config }` override.
 *
 * @example
 * ```tsx
 * const { network, chains, switchNetwork } = useNetwork()
 * {chains.map(c => (
 *   <button key={c.id} disabled={c.id === network} onClick={() => switchNetwork(c.id)}>
 *     {c.id}
 *   </button>
 * ))}
 * ```
 */
export function useNetwork<config extends LaserEyesConfig = ResolvedRegister['config']>(
  parameters: ConfigParameter<config> = {}
): UseNetworkResult<config> {
  const config = useConfig(parameters)
  const network = useStore(config.state.$connection).networkId as ConfigNetworkId<config>
  const switchNetwork = useCallback(
    (networkId: ConfigNetworkId<config>) => switchNetworkAction(config, networkId),
    [config]
  )
  return { network, chains: config.chains, switchNetwork }
}
