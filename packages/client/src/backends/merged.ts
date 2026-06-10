/**
 * Capability-merge type helpers.
 *
 * @remarks
 * These types fold a tuple of {@link ChainBackend}s into a single
 * intersection of their `dsMethods`. They're the type-level companion to
 * {@link mergeChainBackends} (the runtime fold) — letting callers write
 * `backends: [sandshrew(...), mempool(...)]` and recover the precise
 * combined capability set at the type level via
 * `MergedCapabilities<typeof backends>`.
 *
 * @module backend/merged
 */

import type { ChainBackend } from '../types/backend'
import type { WithoutIndexSig } from '../types/utils'

/**
 * Pull the `dsMethods` parameter out of a {@link ChainBackend}.
 *
 * @remarks
 * For a `ChainBackend<BaseCapability & RuneCapability>`, returns
 * `BaseCapability & RuneCapability`. Returns `never` if `T` is not a
 * `ChainBackend<...>`.
 */
export type ChainBackendMethodsOf<T> = T extends ChainBackend<infer M> ? M : never

/**
 * Recursively fold a tuple of {@link ChainBackend}s into a single
 * intersection of their `dsMethods` (raw — index signature retained).
 *
 * @remarks
 * Used internally by {@link MergedCapabilities}. Prefer that wrapper at
 * call sites — this raw form leaks the inherited `[k: string]: AnyFn`
 * index signature from `ActionGroup`-extending capability interfaces,
 * which masks property-existence checks.
 *
 * @internal
 */
export type MergedCapabilitiesRaw<T extends readonly ChainBackend<any>[]> = T extends readonly [
  infer H,
  ...infer R,
]
  ? R extends readonly ChainBackend<any>[]
    ? (H extends ChainBackend<any> ? ChainBackendMethodsOf<H> : {}) & MergedCapabilitiesRaw<R>
    : H extends ChainBackend<any>
      ? ChainBackendMethodsOf<H>
      : {}
  : {}

/**
 * Fold a tuple of {@link ChainBackend}s into a single, precise
 * intersection of their `dsMethods` — with the inherited index signature
 * stripped.
 *
 * @typeParam T - A tuple (or `readonly` tuple) of `ChainBackend<...>`
 *   types, in priority order. `MergedCapabilities<T>` is the type-level
 *   equivalent of running `T.reduceRight(mergeChainBackends)` at runtime
 *   (first source wins on overlap is a runtime concern; at the type
 *   level we just intersect the method records).
 *
 * @example
 * ```ts
 * declare const sandshrew: ChainBackend<BaseCapability & RuneCapability>
 * declare const mempool:   ChainBackend<BaseCapability>
 *
 * type Combined = MergedCapabilities<readonly [typeof sandshrew, typeof mempool]>
 * //   ^? BaseCapability & RuneCapability
 *
 * declare const merged: Combined
 * merged.btcGetBalance('bc1q…')           // ✓ from BaseCapability
 * merged.runesGetAddressBalances('bc1q…') // ✓ from RuneCapability
 * ```
 *
 * @remarks
 * Used by the core package's `getClient` / `getWalletClient` keystone
 * (see core/wallet-client.ts) to give a precisely-typed merged capability
 * set to user code on a per-chain basis.
 */
export type MergedCapabilities<T extends readonly ChainBackend<any>[]> = WithoutIndexSig<
  MergedCapabilitiesRaw<T>
>
