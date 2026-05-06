// Core primitives

// Actions
export { walletBtcActions } from './actions/wallet-btc'
export { signingActions } from './actions/wallet-signing'

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
