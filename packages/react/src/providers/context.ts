'use client'

import type { LaserEyesConfig } from '@omnisat/lasereyes-core'
import type { QueryContext } from '@omnisat/lasereyes-core/query'
import { createContext, useContext } from 'react'
import type { ConfigParameter, ResolvedRegister } from '../types'

/**
 * Value carried by {@link LaserEyesContext}: the user's `config` plus the
 * provider-scoped query cache. Both are stable for the provider's lifetime.
 */
export interface LaserEyesContextValue {
  /** The config built by `createLaserEyesConfig` and passed to the provider. */
  config: LaserEyesConfig
  /** Provider-scoped `@nanostores/query` cache (one per provider mount). */
  queryCtx: QueryContext
}

/**
 * React context holding the LaserEyes config + query cache. `null` until a
 * {@link LaserEyesProvider} mounts above the consumer.
 *
 * @internal Consumers use the hooks ({@link useConfig}, {@link useQueryContext}),
 * not this context directly.
 */
export const LaserEyesContext = createContext<LaserEyesContextValue | null>(null)

/**
 * The active {@link LaserEyesConfig}: the one passed via `parameters.config`,
 * else the nearest {@link LaserEyesProvider}'s.
 *
 * @remarks
 * The return type is the **concrete** config — either the explicitly-passed
 * one (its generics flow through) or the {@link ResolvedRegister} default
 * (precise when an app declared `Register`, else bare `LaserEyesConfig`).
 *
 * @param parameters - Optional `{ config }` override.
 * @throws {Error} If no config is passed AND no `LaserEyesProvider` is mounted.
 *
 * @example
 * ```ts
 * const config = useConfig()               // context / Register
 * const config = useConfig({ config: my }) // explicit override
 * ```
 */
export function useConfig<config extends LaserEyesConfig = ResolvedRegister['config']>(
  parameters: ConfigParameter<config> = {}
): config {
  const ctx = useContext(LaserEyesContext)
  const config = parameters.config ?? (ctx?.config as config | undefined)
  if (!config) {
    throw new Error('useConfig must be used within a LaserEyesProvider or be passed a `config`')
  }
  return config
}

/**
 * The provider-scoped query cache, or an explicit `override`. Hooks thread this
 * into every `getXxxQuery` / `xxxMutation` builder so all reads/writes share one
 * cache.
 *
 * @remarks
 * Pass an `override` (a `createQueryContext()` result) to drive a hook off a
 * cache other than the provider's — the read/write hooks forward their
 * `{ queryContext }` option here. When an override is given, no provider is
 * required.
 *
 * @param override - Optional query context to use instead of the provider's.
 * @throws {Error} If no override is given AND no `LaserEyesProvider` is mounted.
 *
 * @internal Used by the read/write hooks; rarely needed directly.
 */
export function useQueryContext(override?: QueryContext): QueryContext {
  const ctx = useContext(LaserEyesContext)
  const resolved = override ?? ctx?.queryCtx
  if (!resolved) {
    throw new Error(
      'useQueryContext must be used within a LaserEyesProvider or be passed a queryContext override'
    )
  }
  return resolved
}
