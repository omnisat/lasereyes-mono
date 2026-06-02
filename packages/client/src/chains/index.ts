/**
 * Bitcoin chain (network) definitions.
 *
 * @remarks
 * Chains are value objects: a `ChainNetwork` carries derivation parameters
 * (bech32 prefix, pubKeyHash, scriptHash, wif) along with an ID and a base
 * type. They are passed by value to {@link createClient} and friends.
 *
 * For the *string* network identifier alone, use {@link NetworkId}. Wherever
 * possible, prefer working with the chain object and reading `chain.id` over
 * importing a separate string constant.
 *
 * @module chains
 */

/**
 * Base network types for address derivation and validation.
 *
 * @remarks
 * Bitcoin has only three fundamental network types regardless of how many
 * named networks (testnet4, signet, fractal-*, etc.) exist on top.
 */
export type NetworkType = 'mainnet' | 'testnet' | 'regtest'

/**
 * String identifier for a specific network/chain.
 *
 * @remarks
 * Open string union so apps can register custom networks via
 * {@link defineChain}. Built-in IDs are listed explicitly to give autocomplete.
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
 *
 * @remarks
 * Pass by value to {@link createClient}, {@link createWalletClient}, and
 * {@link createChainBackend}. Construct custom chains via
 * {@link defineChain}.
 */
export interface ChainNetwork {
  /** Network identifier (e.g., `'mainnet'`, `'testnet4'`). */
  id: NetworkId
  /** Base network type for address derivation. */
  type: NetworkType
  /** Human-readable name. */
  name: string
  /** Bech32 address prefix (e.g., `'bc'` for mainnet, `'tb'` for testnet). */
  bech32Prefix: string
  /** P2PKH address version byte. */
  pubKeyHash: number
  /** P2SH address version byte. */
  scriptHash: number
  /** WIF (Wallet Import Format) version byte. */
  wif: number
}

/**
 * Define a new Bitcoin chain.
 *
 * @remarks
 * Use this to construct custom chain configurations. Returns a typed
 * {@link ChainNetwork} suitable for {@link createClient}.
 *
 * @example
 * ```ts
 * const myChain = defineChain({
 *   id: 'my-network',
 *   type: 'testnet',
 *   name: 'My Custom Network',
 *   bech32Prefix: 'tb',
 *   pubKeyHash: 0x6f,
 *   scriptHash: 0xc4,
 *   wif: 0xef,
 * })
 * ```
 */
export function defineChain<const T extends ChainNetwork>(chain: T): T {
  return chain
}

/** Bitcoin mainnet. */
export const MAINNET = defineChain({
  id: 'mainnet',
  type: 'mainnet',
  name: 'Bitcoin Mainnet',
  bech32Prefix: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
})

/** Bitcoin Testnet (legacy testnet3). */
export const TESTNET = defineChain({
  id: 'testnet',
  type: 'testnet',
  name: 'Bitcoin Testnet',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
})

/** Bitcoin Testnet4. */
export const TESTNET4 = defineChain({
  id: 'testnet4',
  type: 'testnet',
  name: 'Bitcoin Testnet4',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
})

/** Bitcoin Signet. */
export const SIGNET = defineChain({
  id: 'signet',
  type: 'testnet',
  name: 'Bitcoin Signet',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
})

/** Fractal Bitcoin mainnet. */
export const FRACTAL_MAINNET = defineChain({
  id: 'fractal-mainnet',
  type: 'mainnet',
  name: 'Fractal Mainnet',
  bech32Prefix: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
})

/** Fractal Bitcoin testnet. */
export const FRACTAL_TESTNET = defineChain({
  id: 'fractal-testnet',
  type: 'testnet',
  name: 'Fractal Testnet',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
})

/** OYL Network (development network). */
export const OYLNET = defineChain({
  id: 'oylnet',
  type: 'testnet',
  name: 'OYL Network',
  bech32Prefix: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
})

/** Local regtest. */
export const REGTEST = defineChain({
  id: 'regtest',
  type: 'regtest',
  name: 'Bitcoin Regtest',
  bech32Prefix: 'bcrt',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
})

export {
  MAINNET as mainnet,
  TESTNET as testnet,
  TESTNET4 as testnet4,
  SIGNET as signet,
  FRACTAL_MAINNET as fractalMainnet,
  FRACTAL_TESTNET as fractalTestnet,
  OYLNET as oylnet,
  REGTEST as regtest,
  REGTEST as localnet,
}

/**
 * Registry of built-in chains by ID.
 *
 * @remarks
 * Apps that work with multiple chains commonly look up chains by ID via
 * {@link getNetwork}. Custom chains can be merged into this registry by
 * spreading: `{ ...NETWORKS, [myChain.id]: myChain }`.
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
 * Look up a built-in chain by ID.
 *
 * @returns The chain, or `undefined` if no chain matches the given ID.
 */
export function getNetwork(id: NetworkId): ChainNetwork | undefined {
  return NETWORKS[id]
}

/**
 * Normalize a network argument to a {@link ChainNetwork} value object.
 *
 * @remarks
 * Constructor-facing helper used by {@link createClient}, {@link createWalletClient},
 * {@link createChainBackend}, and the vendor `createBackend` factories.
 * Accepts either form so callers can write the ergonomic
 * `{ network: 'mainnet' }` *or* the canonical `{ network: MAINNET }` and
 * the resulting data structure always carries the full `ChainNetwork`.
 *
 * @param input - Either a built-in {@link NetworkId} string or a {@link ChainNetwork} value.
 * @returns The corresponding `ChainNetwork`.
 * @throws {Error} If `input` is a string with no entry in {@link NETWORKS}.
 *   Custom chains should be passed as `ChainNetwork` values produced by
 *   {@link defineChain}.
 */
export function resolveNetwork(input: NetworkId | ChainNetwork): ChainNetwork {
  if (typeof input !== 'string') return input
  const chain = NETWORKS[input]
  if (!chain) {
    throw new Error(
      `resolveNetwork: unknown network id "${input}". For custom chains, ` +
        'pass a ChainNetwork value produced by defineChain() instead of a string.'
    )
  }
  return chain
}

/**
 * Resolve the base network type for a network ID.
 *
 * @remarks
 * Falls back to substring inference for IDs not in {@link NETWORKS} so custom
 * chains generally don't need to register before being usable for type
 * resolution.
 */
export function getNetworkType(id: NetworkId): NetworkType {
  const network = getNetwork(id)
  if (network) return network.type

  if (id.includes('mainnet')) return 'mainnet'
  if (id.includes('testnet') || id.includes('signet')) return 'testnet'
  if (id.includes('regtest') || id.includes('local')) return 'regtest'

  return 'mainnet'
}
