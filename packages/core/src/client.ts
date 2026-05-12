/**
 * `getClient(config, opts?)` — bare typed client for a chain.
 *
 * @remarks
 * Returns a `Client` (from `@omnisat/lasereyes-client`) wrapping the
 * resolved data source for the chain. The client is **bare** — no action
 * groups extended on top — because the bare action functions
 * (`getBalance`, `getTransaction`, etc., re-exported from the client
 * package) take a `Client` as their first argument and add nothing to
 * the client's surface.
 *
 * Phase 9 actions consume `getClient` via the bare-action pattern:
 *
 * ```ts
 * import { getBalance as clientGetBalance } from '@omnisat/lasereyes-client'
 *
 * export async function getBalance(config, address) {
 *   // …provider-first attempt…
 *   return clientGetBalance(getClient(config), address)
 * }
 * ```
 *
 * This keeps the typed client surface composable: callers that want
 * methods can still do `getClient(config).extend(publicActions())` and
 * call `client.getBalance(address)` themselves. Phase 9 actions don't
 * pre-extend because they import the underlying free functions.
 *
 * Pairs with Phase 10's `getWalletClient(config, opts?)` for the
 * account-aware (write/sign) path.
 *
 * @example
 * ```ts
 * import { getClient } from '@omnisat/lasereyes-core'
 * import { getBalance, publicActions } from '@omnisat/lasereyes-client'
 *
 * // Compose with a bare action:
 * const balance = await getBalance(getClient(config), 'bc1q...')
 *
 * // Or extend explicitly:
 * const ext = getClient(config).extend(publicActions())
 * await ext.getBalance('bc1q...')
 * ```
 *
 * @module client
 */

import type { BaseCapability, ChainNetwork } from '@omnisat/lasereyes-client'
import { type ChainDataSource, createClient } from '@omnisat/lasereyes-client'
import type { LaserEyesConfig } from './config'
import { resolveDataSource } from './internal'

/**
 * Build a bare typed read-only client for one of the chains in the config.
 *
 * @remarks
 * Threads `<const config>` so a typed config flows through. The
 * `chainId` is constrained to chains the config carries; out-of-config
 * IDs are rejected at compile time.
 *
 * Internally:
 * 1. Reads `chainId` (defaults to the active network: `state.$networkId.get()`).
 * 2. Looks up the chain object in `config.chains`.
 * 3. Folds `config.transports[chainId]` via `mergeDataSources` (encapsulated
 *    in {@link resolveDataSource}).
 * 4. Returns `createClient({ network, dataSource })` — bare, no extensions.
 *
 * The data source is cast to `ChainDataSource<BaseCapability>` so the
 * returned `Client` satisfies the constraint of bare action functions
 * (`getBalance`, `getTransaction`, …) which require `BaseCapability`
 * methods at minimum. Phase 10 will introduce a more precise variant
 * that preserves per-chain capability sets in the return type.
 *
 * @throws {Error} If `chainId` is not in `config.chains`.
 * @throws {Error} If no transports are configured for `chainId`.
 */
export function getClient<const config extends LaserEyesConfig<any, any, any>>(
  config: config,
  options?: { chainId?: config['chains'][number]['id'] }
) {
  const id = (options?.chainId ?? config.state.$connection.get().networkId) as string
  const network = (config.chains as readonly ChainNetwork[]).find(c => c.id === id)
  if (!network) {
    throw new Error(`Chain '${id}' not in config.chains`)
  }
  const dataSource = resolveDataSource(config, id) as ChainDataSource<BaseCapability>
  return createClient({ network, dataSource })
}
