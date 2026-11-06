/**
 * Composable chain backend primitives and capability contracts.
 *
 * @remarks
 * This module exports:
 * - The factory ({@link createChainBackend}) and combinator
 *   ({@link mergeChainBackends}) for assembling backends.
 * - The lazy backend factory ({@link ChainBackendFactory}) and its
 *   combinator ({@link combineBackends}).
 * - The capability interfaces vendors implement
 *   ({@link BaseCapability}, {@link OrdCapability}, {@link InscriptionCapability},
 *   {@link RuneCapability}, {@link Brc20Capability}, {@link AlkaneCapability}).
 *
 * @module backends/primitives
 */

export type {
  ActionGroup,
  AlkaneCapability,
  BaseCapability,
  Brc20Capability,
  InscriptionCapability,
  OrdAddressInfo,
  OrdCapability,
  RuneCapability,
} from './capabilities'
export { createChainBackend } from './create'
export type { ChainBackendFactory } from './factory'
export { combineBackends } from './factory'
export { mergeChainBackends } from './merge'
export type { ChainBackendMethodsOf, MergedCapabilities } from './merged'
