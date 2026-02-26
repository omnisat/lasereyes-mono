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
export interface Network {
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
export const MAINNET: Network = {
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
export const TESTNET: Network = {
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
export const TESTNET4: Network = {
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
export const SIGNET: Network = {
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
export const FRACTAL_MAINNET: Network = {
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
export const FRACTAL_TESTNET: Network = {
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
export const OYLNET: Network = {
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
export const REGTEST: Network = {
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
export const NETWORKS: Record<string, Network> = {
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
export function getNetwork(id: NetworkId): Network | undefined {
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

// ============================================================================
// Legacy wallet-specific network enums (for adapters)
// These will be used by adapters to translate wallet-specific network names
// ============================================================================

export enum FractalNetwork {
  MAINNET = 'fractal_mainnet',
  TESTNET = 'fractal_testnet',
}

export enum CmdruidNetwork {
  MAINNET = 'main',
  TESTNET = 'testnet',
  SIGNET = 'signet',
}

export enum LeatherNetwork {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export enum UnisatNetwork {
  MAINNET = 'BITCOIN_MAINNET',
  TESTNET = 'BITCOIN_TESTNET',
  TESTNET4 = 'BITCOIN_TESTNET4',
  SIGNET = 'BITCOIN_SIGNET',
  FRACTAL_MAINNET = 'FRACTAL_BITCOIN_MAINNET',
  FRACTAL_TESTNET = 'FRACTAL_BITCOIN_TESTNET',
}

export enum BinanceNetwork {
  MAINNET = 'livenet',
  TESTNET = 'testnet',
  SIGNET = 'signet',
}

export enum KeplrChain {
  BITCOIN_MAINNET = 'BITCOIN_MAINNET',
  BITCOIN_TESTNET = 'BITCOIN_TESTNET',
  BITCOIN_SIGNET = 'BITCOIN_SIGNET',
}

export enum OpNetwork {
  MAINNET = 'livenet',
  TESTNET = 'testnet',
}

export enum XverseNetwork {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
  SIGNET = 'Signet',
  FRACTAL_MAINNET = 'fractal mainnet',
  FRACTAL_TESTNET = 'fractal testnet',
  TESTNET4 = 'Testnet4',
}

export enum OkxNetwork {
  MAINNET = 'livenet',
  TESTNET = 'testnet',
}

export enum WizzNetwork {
  MAINNET = 'livenet',
  TESTNET = 'testnet',
  TESTNET4 = 'testnet4',
  SIGNET = 'signet',
}

export enum OrangeNetwork {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet',
}

/**
 * @deprecated Use NetworkId type instead
 */
export enum BaseNetwork {
  MAINNET = 'mainnet',
  SIGNET = 'signet',
  TESTNET = 'testnet',
  TESTNET4 = 'testnet4',
  REGTEST = 'regtest',
  FRACTAL_MAINNET = 'fractal-mainnet',
  FRACTAL_TESTNET = 'fractal-testnet',
  OYLNET = 'oylnet',
}
