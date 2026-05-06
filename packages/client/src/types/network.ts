/**
 * Network types and configuration for Bitcoin networks.
 *
 * @module types/network
 */

/**
 * Base network types (for address derivation and validation).
 * Only 3 fundamental types in Bitcoin.
 */
export type NetworkType = 'mainnet' | 'testnet' | 'regtest'

/**
 * Network IDs identify specific networks/chains.
 * Extensible to support custom networks.
 */
export type NetworkId =
  | 'mainnet'
  | 'testnet' // Legacy testnet3
  | 'testnet4'
  | 'signet'
  | 'fractal-mainnet'
  | 'fractal-testnet'
  | 'oylnet'
  | 'localnet'
  | 'regtest'
  | (string & {}) // Allow custom network IDs

/**
 * Network configuration with derivation parameters.
 */
export interface ChainNetwork {
  /** Network identifier */
  id: NetworkId

  /** Base network type */
  type: NetworkType

  /** Human-readable name */
  name: string

  /** Bech32 address prefix (e.g., 'bc' for mainnet, 'tb' for testnet) */
  bech32Prefix: string

  /** P2PKH address version byte */
  pubKeyHash: number

  /** P2SH address version byte */
  scriptHash: number

  /** WIF (Wallet Import Format) version byte */
  wif: number
}

/**
 * Bitcoin Mainnet
 */
export const MAINNET: ChainNetwork = {
  id: 'mainnet',
  type: 'mainnet',
  name: 'Bitcoin Mainnet',
  bech32Prefix: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
}

/**
 * Bitcoin Testnet (legacy testnet3)
 */
export const TESTNET: ChainNetwork = {
  id: 'testnet',
  type: 'testnet',
  name: 'Bitcoin Testnet',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

/**
 * Bitcoin Testnet4
 */
export const TESTNET4: ChainNetwork = {
  id: 'testnet4',
  type: 'testnet',
  name: 'Bitcoin Testnet4',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

/**
 * Bitcoin Signet
 */
export const SIGNET: ChainNetwork = {
  id: 'signet',
  type: 'testnet',
  name: 'Bitcoin Signet',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

/**
 * Fractal Mainnet
 */
export const FRACTAL_MAINNET: ChainNetwork = {
  id: 'fractal-mainnet',
  type: 'mainnet',
  name: 'Fractal Mainnet',
  bech32Prefix: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
}

/**
 * Fractal Testnet
 */
export const FRACTAL_TESTNET: ChainNetwork = {
  id: 'fractal-testnet',
  type: 'testnet',
  name: 'Fractal Testnet',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

/**
 * OYL Network
 */
export const OYLNET: ChainNetwork = {
  id: 'oylnet',
  type: 'testnet',
  name: 'OYL Network',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

/**
 * Local regtest
 */
export const REGTEST: ChainNetwork = {
  id: 'regtest',
  type: 'regtest',
  name: 'Bitcoin Regtest',
  bech32Prefix: 'bcrt',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
}

/**
 * Network registry
 */
export const NETWORKS: Record<string, ChainNetwork> = {
  mainnet: MAINNET,
  testnet: TESTNET,
  testnet4: TESTNET4,
  signet: SIGNET,
  'fractal-mainnet': FRACTAL_MAINNET,
  'fractal-testnet': FRACTAL_TESTNET,
  oylnet: OYLNET,
  regtest: REGTEST,
  localnet: REGTEST, // Alias
}

/**
 * Get network configuration by ID
 */
export function getNetwork(id: NetworkId): ChainNetwork | undefined {
  return NETWORKS[id]
}

/**
 * Get network type from network ID
 */
export function getNetworkType(id: NetworkId): NetworkType {
  const network = getNetwork(id)
  if (network) return network.type

  // Default inference from ID
  if (id.includes('mainnet')) return 'mainnet'
  if (id.includes('testnet') || id.includes('signet')) return 'testnet'
  if (id.includes('regtest') || id.includes('local')) return 'regtest'

  return 'mainnet' // Default fallback
}
