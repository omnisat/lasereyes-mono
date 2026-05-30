/**
 * Capability-merge type helpers.
 *
 * @remarks
 * These types fold a tuple of {@link ChainDataSource}s into a single
 * intersection of their `dsMethods`. They're the type-level companion to
 * {@link mergeDataSources} (the runtime fold) — letting callers write
 * `transports: [sandshrew(...), mempool(...)]` and recover the precise
 * combined capability set at the type level via
 * `MergedCapabilities<typeof transports>`.
 *
 * @module data-source/merged
 */

import type { ChainDataSource } from '../types/data-source'
import type { WithoutIndexSig } from '../types/utils'

/**
 * Pull the `dsMethods` parameter out of a {@link ChainDataSource}.
 *
 * @remarks
 * For a `ChainDataSource<BaseCapability & RuneCapability>`, returns
 * `BaseCapability & RuneCapability`. Returns `never` if `T` is not a
 * `ChainDataSource<...>`.
 */
export type DsMethodsOf<T> = T extends ChainDataSource<infer M> ? M : never

/**
 * Recursively fold a tuple of {@link ChainDataSource}s into a single
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
export type MergedCapabilitiesRaw<T extends readonly ChainDataSource<any>[]> = T extends readonly [
  infer H,
  ...infer R,
]
  ? R extends readonly ChainDataSource<any>[]
    ? (H extends ChainDataSource<any> ? DsMethodsOf<H> : {}) & MergedCapabilitiesRaw<R>
    : H extends ChainDataSource<any>
      ? DsMethodsOf<H>
      : {}
  : {}

/**
 * Fold a tuple of {@link ChainDataSource}s into a single, precise
 * intersection of their `dsMethods` — with the inherited index signature
 * stripped.
 *
 * @typeParam T - A tuple (or `readonly` tuple) of `ChainDataSource<...>`
 *   types, in priority order. `MergedCapabilities<T>` is the type-level
 *   equivalent of running `T.reduceRight(mergeDataSources)` at runtime
 *   (first source wins on overlap is a runtime concern; at the type
 *   level we just intersect the method records).
 *
 * @example
 * ```ts
 * declare const sandshrew: ChainDataSource<BaseCapability & RuneCapability>
 * declare const mempool:   ChainDataSource<BaseCapability>
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
export type MergedCapabilities<T extends readonly ChainDataSource<any>[]> = WithoutIndexSig<
  MergedCapabilitiesRaw<T>
>
