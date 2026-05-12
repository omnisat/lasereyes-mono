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
  type CreateLaserEyesConfigOptions,
  createLaserEyesConfig,
  type LaserEyesConfig,
  type NetworkTransports,
} from './config'
export { createState, type LaserEyesState } from './state'
export {
  type CreateStorageOptions,
  createStorage,
  type Storage,
} from './storage'

// ============================================================================
// Typed clients — the bridge between core's state and the client package's
// typed surface. Phase 10 keystones.
// ============================================================================

export { getClient } from './client'
export { getWalletClient } from './wallet-client'

// ============================================================================
// Phase 9 actions live at `@omnisat/lasereyes-core/actions`.
// Adapters / connectors / detection live at their own subpaths:
//   - `@omnisat/lasereyes-core/connectors/<wallet>` for connector factories.
//   - `@omnisat/lasereyes-core/adapters/<wallet>` for adapter classes
//     and per-wallet `loadXxxWalletAdapter()` loaders.
//   - `@omnisat/lasereyes-core/detection` for `announceWallet`,
//     `listenForWalletAnnouncements`, `discoverConnectors`, and
//     `loadAllWallets`.
// Importing per-subpath lets consumers' bundlers drop wallets they
// don't use, instead of pulling all 12 wallet integrations in via a
// single top-level barrel.
// ============================================================================

// ============================================================================
// Provider standard + connector types
// ============================================================================

export type {
  ConnectionStatus,
  Connector,
  ConnectorConfig,
  ConnectorMetadata,
  ConnectResult,
  CreateConnectorFn,
} from './types/connector'
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

// ============================================================================
// Re-export commonly-used client types for convenience
// ============================================================================

export type {
  ChainNetwork,
  NetworkId,
  NetworkType,
} from '@omnisat/lasereyes-client'
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
  Account,
  AddressInfo,
  AddressPurpose,
  WalletAccount,
} from '@omnisat/lasereyes-client/wallet'

// ============================================================================
// Wallet constants (BINANCE, UNISAT, XVERSE, …) and other non-network constants
// ============================================================================

export * from './constants'
