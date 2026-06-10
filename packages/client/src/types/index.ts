// Account types live in `../account/types` but are re-exported here for
// convenience: most action code imports `Account` / `WalletAccount` /
// `AddressInfo` together with `WalletClient` and friends.
export type { Account, AddressInfo, AddressPurpose, WalletAccount } from '../account/types'
// Capability interfaces and ActionGroup live in `../backends/capabilities`
// but are re-exported here for action-code convenience.
export type {
  ActionGroup,
  AlkaneCapability,
  BaseCapability,
  Brc20Capability,
  InscriptionCapability,
  OrdAddressInfo,
  OrdCapability,
  RuneCapability,
} from '../backends/capabilities'
// Client and wallet-client types live in `../client/{types,wallet-types}` and
// are re-exported here for action-code convenience.
export type { Client, ClientConfig } from '../client/types'
export type { WalletClient, WalletClientConfig } from '../client/wallet-types'

// Domain types — protocol payloads returned by capabilities and consumed by actions.
export * from './alkane'
export * from './backend'
export * from './brc20'
export * from './fees'
export * from './inscription'
export * from './psbt'
export * from './rune'
export * from './transaction'
export * from './utxo'
