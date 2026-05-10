/**
 * Main entry — read-only primitives, public actions, chains, errors, types.
 *
 * @remarks
 * For account-aware operations (wallet client, signing, send-btc) import
 * from the `/wallet` subpath. Protocol actions live at `/runes`, `/brc20`,
 * `/inscriptions`. Vendor data sources live at `/vendors/<name>`.
 *
 * @module @omnisat/lasereyes-client
 */

// Read-only public actions — both the bare action functions (compose
// directly with a `Client`) and the `publicActions()` factory (extend a
// `Client` with the methods).
export {
  broadcastTransaction,
  getBalance,
  getOutputValue,
  getRecommendedFees,
  getTransaction,
  getUtxos,
  publicActions,
  waitForTransaction,
} from './actions/public'

// Chains
export {
  defineChain,
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  getNetwork,
  getNetworkType,
  MAINNET,
  NETWORKS,
  OYLNET,
  REGTEST,
  resolveNetwork,
  SIGNET,
  TESTNET,
  TESTNET4,
} from './chains'
export type { ChainNetwork, NetworkId, NetworkType } from './chains'

// Client (read-only) factory + types
export { createClient } from './client'
export type { Client, ClientConfig } from './client/types'

// Constants
export { ALKANES, BRC20, BTC, RUNES } from './constants/protocols'

// Data sources
export { createChainDataSource, mergeDataSources } from './data-source'
export type { DsMethodsOf, MergedCapabilities } from './data-source'

// Errors
export {
  CapabilityNotFoundError,
  DataSourceError,
  InsufficientFundsError,
  LaserEyesClientError,
  NetworkMismatchError,
  ProviderErrorCode,
  ProviderRpcError,
  PsbtBuildError,
} from './errors'

// Types
export type {
  ActionGroup,
  // Capabilities
  AlkaneCapability,
  // Protocol domain types — alkane
  AlkaneBalance,
  AlkaneOutpoint,
  BaseCapability,
  // Protocol domain types — brc20
  Brc20Balance,
  Brc20Capability,
  Brc20Info,
  ChainDataSource,
  DataSourceContext,
  FeeEstimate,
  FormattedUTXO,
  // Protocol domain types — inscription
  Inscription,
  InscriptionCapability,
  InscriptionInfo,
  OrdAddressInfo,
  OrdCapability,
  OrdOutput,
  OrdOutputWrapper,
  PaginatedResult,
  PaginationParams,
  // Protocol domain types — rune
  RuneBalance,
  RuneCapability,
  RuneInfo,
  RuneOutpoint,
  // Transaction / UTXO
  Transaction,
  UTXO,
} from './types'
