// Account types live in `../account/types` but are re-exported here for
// convenience: most action code imports `Account` / `WalletAccount` /
// `AddressInfo` together with `WalletClient` and friends.
export type { Account, AddressInfo, AddressPurpose, WalletAccount } from '../account/types'

// Capability interfaces and ActionGroup live in `../data-source/capabilities`
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
} from '../data-source/capabilities'

// Domain types — protocol payloads returned by capabilities and consumed by actions.
export * from './alkane'
export * from './brc20'
export * from './client'
export * from './data-source'
export * from './fees'
export * from './inscription'
export * from './psbt'
export * from './rune'
export * from './transaction'
export * from './utxo'
export * from './wallet-client'
