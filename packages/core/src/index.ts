/**
 * `@omnisat/lasereyes-core` — wagmi-shaped Bitcoin wallet integration.
 *
 * @remarks
 * The core package owns:
 * - {@link LaserEyesConfig} — the value bundle (chains, connectors, transports, state, storage)
 * - {@link createLaserEyesConfig} — the factory
 * - Reactive state atoms ({@link LaserEyesState})
 * - Phase 9 free-function actions over the config
 * - Wallet adapters and connectors (EIP-1193-shaped)
 * - EIP-6963-style discovery
 *
 * Read/write data operations are typed through the client package's
 * action layer — `getClient(config)` builds a bare `Client` for
 * composing with bare actions imported from `@omnisat/lasereyes-client`.
 *
 * @module @omnisat/lasereyes-core
 */

// ============================================================================
// Config + state
// ============================================================================

export {
  createLaserEyesConfig,
  type CreateLaserEyesConfigOptions,
  type LaserEyesConfig,
  type NetworkTransports,
} from './config'
export { createState, type LaserEyesState } from './state'
export {
  createStorage,
  type CreateStorageOptions,
  type Storage,
} from './storage'

// ============================================================================
// Read-only typed client (used by data actions; also a public surface)
// ============================================================================

export { getClient } from './client'

// ============================================================================
// Phase 9 free-function actions over config
// ============================================================================

export * from './actions'

// ============================================================================
// Adapters + connectors + discovery
// ============================================================================

export * from './adapters'
export * from './connectors'
export * from './detection'

// ============================================================================
// Provider standard + connector types
// ============================================================================

export type {
  BitcoinProvider,
  BitcoinProviderEvent,
  BitcoinRpcMethod,
  ConnectInfo,
  DisconnectInfo,
  MethodCapability,
  NetworkCapabilities,
  ProviderCapabilities,
  ProviderMessage,
  TypeDescriptor,
} from './types/provider'
export {
  createMethodCapability,
  describeType,
  ProviderErrorCode,
  ProviderRpcError,
} from './types/provider'

export type {
  ConnectionStatus,
  Connector,
  ConnectorConfig,
  ConnectorMetadata,
  ConnectResult,
  CreateConnectorFn,
} from './types/connector'

// ============================================================================
// Re-export commonly-used client types for convenience
// ============================================================================

export {
  defineChain,
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  NETWORKS,
  OYLNET,
  REGTEST,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '@omnisat/lasereyes-client'
export type {
  ChainNetwork,
  NetworkId,
  NetworkType,
} from '@omnisat/lasereyes-client'
export type {
  Account,
  AddressInfo,
  AddressPurpose,
  WalletAccount,
} from '@omnisat/lasereyes-client/wallet'

// ============================================================================
// Wallet constants (BINANCE, UNISAT, XVERSE, …) and other non-network constants
// ============================================================================

export * from './constants'
