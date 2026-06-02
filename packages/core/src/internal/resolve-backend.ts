/**
 * Internal: resolve the backend for a chain.
 *
 * @remarks
 * Looks up `config.backends[chainId]` — the single, already-resolved
 * {@link ChainBackend} for the chain. Composition of several services
 * into one backend (with fallback) happens up-front via `combineBackends`
 * at `createLaserEyesConfig` time, so there's nothing to fold here.
 *
 * Phase 10's keystone (`getClient(config, opts?)`) wraps this helper to
 * return a typed `Client`. For Phase 9 actions that just need backend
 * methods (read-fallback paths), this lower-level helper is enough.
 *
 * @internal
 */

import type { ChainBackend } from '@omnisat/lasereyes-client'
import type { LaserEyesConfig } from '../config'

/**
 * Resolve the backend for a chain.
 *
 * @param config - The LaserEyes config.
 * @param chainId - Optional chain ID. Defaults to the active network.
 * @returns The `ChainBackend` for the chain.
 *
 * @throws {Error} If no backend is configured for `chainId`.
 */
export function resolveChainBackend(config: LaserEyesConfig, chainId?: string): ChainBackend<any> {
  const id = chainId ?? config.state.$connection.get().networkId
  const backend = config.backends[id]
  if (!backend) {
    throw new Error(`No backend configured for chain '${id}'`)
  }
  return backend
}
