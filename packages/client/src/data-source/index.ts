/**
 * Composable chain data source primitives and capability contracts.
 *
 * @remarks
 * This module exports:
 * - The factory ({@link createChainDataSource}) and combinator
 *   ({@link mergeDataSources}) for assembling data sources.
 * - The capability interfaces vendors implement
 *   ({@link BaseCapability}, {@link OrdCapability}, {@link InscriptionCapability},
 *   {@link RuneCapability}, {@link Brc20Capability}, {@link AlkaneCapability}).
 *
 * @module data-source
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
export { createChainDataSource } from './create'
export { mergeDataSources } from './merge'
