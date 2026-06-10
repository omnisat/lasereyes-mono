'use client'

/**
 * Type plumbing that threads a concrete {@link LaserEyesConfig}'s generics
 * through the hooks — the module-augmentation `Register` pattern.
 *
 * @remarks
 * React context can't carry the caller's type parameters, so a hook that reads
 * the provider's config sees only the bare, non-generic `LaserEyesConfig` and
 * erases the user's chains. Two escape hatches recover precision:
 *
 * 1. **{@link Register} augmentation.** Declaration-merge your config's type in
 *    once and every context-derived hook narrows by default — no per-call
 *    ceremony. This is the common case.
 * 2. **Per-call `config`.** Pass `{ config }` to any hook to override the
 *    context and flow *that* config's generics through the return types
 *    (multi-config apps, tests, SSR).
 *
 * @module types
 */

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import type { QueryContext } from '@omnisat/lasereyes-core/query'

/**
 * Module-augmentation seam for the app's config type (the `Register` pattern).
 *
 * @remarks
 * Declare it once, in app code, so every context-derived hook types precisely:
 *
 * ```ts
 * import { createLaserEyesConfig, MAINNET, TESTNET4 } from '@omnisat/lasereyes-core'
 * const config = createLaserEyesConfig({ chains: [MAINNET, TESTNET4], backends: { ... } })
 *
 * declare module '@omnisat/lasereyes-react' {
 *   interface Register {
 *     config: typeof config
 *   }
 * }
 * // now useNetwork().network is 'mainnet' | 'testnet4', not the open NetworkId
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: declaration-merge seam, intentionally empty
export interface Register {}

/**
 * The config type the hooks default to: the {@link Register}-augmented one if an
 * app declared it, else the bare {@link LaserEyesConfig}.
 */
export type ResolvedRegister = {
  config: Register extends { config: infer config extends LaserEyesConfig }
    ? config
    : LaserEyesConfig
}

/** A hook parameter bag carrying an optional per-call config override. */
export type ConfigParameter<config extends LaserEyesConfig = ResolvedRegister['config']> = {
  /**
   * Override the provider's config for this hook. The passed config's generics
   * flow through the return types. Defaults to the {@link ResolvedRegister}
   * config (context / `Register`).
   */
  config?: config | undefined
}

/** The configured chains' id union for a config — `config['chains'][number]['id']`. */
export type ConfigNetworkId<config extends LaserEyesConfig> = config['chains'][number]['id']

/** Options accepted by the read hooks (balance, utxos, fees, transaction). */
export type ReadHookOptions<config extends LaserEyesConfig = ResolvedRegister['config']> =
  ConfigParameter<config> & {
    /**
     * Read a chain other than the active one. Narrowed to the (effective)
     * config's chains; folds into the cache key so it caches separately.
     */
    chainId?: ConfigNetworkId<config> | undefined
    /** Gate the fetch. When `false`, the hook stays idle (no request). Default `true`. */
    enabled?: boolean | undefined
    /** Override the provider-scoped query cache (tests / SSR / multi-cache). */
    queryContext?: QueryContext | undefined
  }

/** Options accepted by the mutation hooks (send, sign, broadcast). */
export type MutationHookOptions<config extends LaserEyesConfig = ResolvedRegister['config']> =
  ConfigParameter<config> & {
    /** Override the provider-scoped query cache (tests / SSR / multi-cache). */
    queryContext?: QueryContext | undefined
  }

/**
 * Options accepted by the paginated read hooks (e.g. `useUtxos`). The hook owns
 * the cursor (it accumulates pages), so callers set `limit` but never `cursor`.
 */
export type PaginatedReadHookOptions<config extends LaserEyesConfig = ResolvedRegister['config']> =
  ReadHookOptions<config> & {
    /** Items per page. Changing it resets the accumulation. */
    limit?: number | undefined
  }
