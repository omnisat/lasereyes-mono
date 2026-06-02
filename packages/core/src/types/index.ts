/**
 * Type re-exports for the core package.
 *
 * @module types
 */

export type {
  ConnectionStatus,
  Connector,
  ConnectorConfig,
  ConnectorMetadata,
  ConnectResult,
  CreateConnectorFn,
} from './connector'
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
} from './provider'
export {
  createMethodCapability,
  describeType,
  ProviderErrorCode,
  ProviderRpcError,
} from './provider'
