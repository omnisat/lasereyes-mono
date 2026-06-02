/**
 * Main entry — read-only primitives, public actions, chains, errors, types.
 *
 * @remarks
 * For account-aware operations (wallet client, signing, send-btc) import
 * from the `/wallet` subpath. Protocol actions live at `/runes`, `/brc20`,
 * `/inscriptions`. Vendor backends live at `/backends/<name>`.
 *
 * @module @omnisat/lasereyes-client
 */

// Read-only public actions — both the bare action functions (compose
// directly with a `Client`) and the `publicActions()` factory (extend a
// `Client` with the methods).
export {
  broadcastTransaction,
  getAddressBalance,
  getAddressUtxos,
  getOutputValue,
  getRecommendedFees,
  getTransaction,
  type PublicBtcActions,
  publicActions,
  waitForTransaction,
} from './actions/public'
export type {
  ChainBackendFactory,
  ChainBackendMethodsOf,
  MergedCapabilities,
} from './backends/primitives'
// Backends
export {
  combineBackends,
  createChainBackend,
  mergeChainBackends,
} from './backends/primitives'
export type { ChainNetwork, NetworkId, NetworkType } from './chains'
// Chains
export {
  defineChain,
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  fractalMainnet,
  fractalTestnet,
  getNetwork,
  getNetworkType,
  localnet,
  MAINNET,
  mainnet,
  NETWORKS,
  OYLNET,
  oylnet,
  REGTEST,
  regtest,
  resolveNetwork,
  SIGNET,
  signet,
  TESTNET,
  TESTNET4,
  testnet,
  testnet4,
} from './chains'
// Client (read-only) factory + types
export { createClient } from './client'
export type { Client, ClientConfig } from './client/types'
// Constants
export { ALKANES, BRC20, BTC, RUNES } from './constants/protocols'

// Errors
export {
  CapabilityNotFoundError,
  ChainBackendError,
  InsufficientFundsError,
  LaserEyesClientError,
  NetworkMismatchError,
  NetworkNotConfiguredError,
  ProviderErrorCode,
  ProviderRpcError,
  PsbtBuildError,
} from './errors'

// getAction — override-aware action dispatch. Used internally by composed
// actions; exposed for users (and the core package) doing their own
// composition.
export { getAction } from './lib/get-action'

// Types
export type {
  ActionGroup,
  // Protocol domain types — alkane
  AlkaneBalance,
  // Capabilities
  AlkaneCapability,
  AlkaneOutpoint,
  BaseCapability,
  // Protocol domain types — brc20
  Brc20Balance,
  Brc20Capability,
  Brc20Info,
  ChainBackend,
  ChainBackendContext,
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
