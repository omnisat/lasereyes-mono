/**
 * `LaserEyesConfig` — the wagmi-shaped registry that replaces the old
 * `LaserEyesCore` class.
 *
 * @remarks
 * A LaserEyes config is a value, not a class. It bundles:
 * - the chains your app supports (as a typed tuple)
 * - the connectors users can connect with (each retains its factory identity)
 * - the per-chain transports (data sources, in priority order)
 * - the reactive state atoms
 * - the storage layer for persisted state (auto-reconnect, etc.)
 *
 * Operations are free functions in `actions/*` that take a config and any
 * necessary args.
 *
 * Three threaded generics — `chains`, `transports`, `connectorFns` —
 * preserve literal-typed information (chain IDs, per-chain capability
 * sets, per-connector identity) so the keystone {@link getWalletClient}
 * (Phase 10) can hand callers a precisely-typed wallet client without
 * extra ceremony at the call site. All three default to permissive
 * variants so call sites that don't need precision can pass
 * `LaserEyesConfig` (no type args) directly.
 *
 * @module config
 */

import type { ChainDataSource, ChainNetwork } from '@omnisat/lasereyes-client'
import { createState, type LaserEyesState } from './state'
import { createStorage, type Storage } from './storage'
import type { Connector, CreateConnectorFn } from './types/connector'

/**
 * Per-network data-source configuration parameterized by the chains tuple.
 *
 * @remarks
 * Each chain ID maps to an array of {@link ChainDataSource}s in priority
 * order: index 0 is highest priority, later entries are fallbacks. The
 * runtime fold is performed by `mergeDataSources`; the type-level fold
 * (intersection of capabilities) is `MergedCapabilities` in the client
 * package.
 */
export type NetworkTransports<
  chains extends readonly [ChainNetwork, ...ChainNetwork[]] = readonly [
    ChainNetwork,
    ...ChainNetwork[],
  ],
> = Record<chains[number]['id'], readonly ChainDataSource<any>[]>

/**
 * The fully-resolved config produced by {@link createLaserEyesConfig}.
 *
 * @typeParam chains - The tuple of chains this config knows about.
 * @typeParam transports - The per-chain data-source map. Each chain ID maps
 *   to an array of `ChainDataSource`s in priority order.
 * @typeParam connectorFns - The connector factory identities, preserved so
 *   downstream consumers can refer back to specific connectors.
 */
export interface LaserEyesConfig<
  chains extends readonly [ChainNetwork, ...ChainNetwork[]] = readonly [
    ChainNetwork,
    ...ChainNetwork[],
  ],
  transports extends NetworkTransports<chains> = NetworkTransports<chains>,
  connectorFns extends readonly CreateConnectorFn[] = readonly CreateConnectorFn[],
> {
  /** Bitcoin chains this config knows about, in declaration order. */
  readonly chains: chains
  /** Connector factory identities the user explicitly registered. */
  readonly connectorFns: connectorFns
  /** Connectors instantiated from `connectorFns`, indexed in declaration order. */
  readonly connectors: readonly Connector[]
  /** Per-network data sources, in priority order. */
  readonly transports: transports
  /** Reactive state atoms. */
  readonly state: LaserEyesState
  /** Persisted-state storage. */
  readonly storage: Storage
  /** App name surfaced to wallets at connect time. */
  readonly appName?: string
  /** App icon URL surfaced to wallets at connect time. */
  readonly appIcon?: string
  /** Whether to attempt auto-reconnect on initialize. Default `true`. */
  readonly autoReconnect: boolean
}

/**
 * Options accepted by {@link createLaserEyesConfig}.
 */
export interface CreateLaserEyesConfigOptions<
  chains extends readonly [ChainNetwork, ...ChainNetwork[]],
  transports extends NetworkTransports<chains>,
  connectorFns extends readonly CreateConnectorFn[],
> {
  /**
   * Bitcoin chains this config supports.
   *
   * @remarks
   * The first chain in the list becomes the default network. Pass chains
   * imported from `@omnisat/lasereyes-client` (e.g. `MAINNET`, `TESTNET4`).
   */
  chains: chains
  /**
   * Connector factories to register (e.g. `[unisat(), xverse()]`).
   *
   * @remarks
   * Wallets that announce themselves via the EIP-6963-style discovery
   * channel are merged with this list at runtime; `rdns` collisions are
   * resolved in favor of the explicit entry.
   */
  connectors?: connectorFns
  /**
   * Per-network data sources. Each network can have multiple data sources;
   * index 0 is highest priority, later entries are fallbacks.
   */
  transports: transports
  /**
   * Custom storage. Defaults to a `localStorage`-backed key-prefixed
   * storage when available, in-memory otherwise.
   */
  storage?: Storage
  /** App name surfaced to wallets at connect time. */
  appName?: string
  /** App icon URL surfaced to wallets at connect time. */
  appIcon?: string
  /** Disable auto-reconnect on initialize. Default: enabled. */
  autoReconnect?: boolean
}

/**
 * Build a {@link LaserEyesConfig}.
 *
 * @remarks
 * - Connector factories are invoked once with a `ConnectorConfig` derived
 *   from `appName` / `appIcon` / `chains`.
 * - The state atoms are seeded with the first chain in `chains` as the
 *   default network.
 * - Storage falls back to `localStorage` when available.
 *
 * Discovery (announced connectors merging with explicit ones) is wired
 * up by the `initialize(config)` action, not at construction.
 *
 * The `const` modifier on each generic preserves literal types — chain
 * IDs stay a string-literal union, the transports map keys stay typed
 * to those literals, and per-connector factory identity is preserved
 * across the readonly tuple.
 *
 * @example
 * ```ts
 * import { createLaserEyesConfig, unisat, xverse } from '@omnisat/lasereyes-core'
 * import { MAINNET, TESTNET4 } from '@omnisat/lasereyes-client'
 * import { createDataSource as mempool } from '@omnisat/lasereyes-client/vendors/mempool'
 *
 * const config = createLaserEyesConfig({
 *   chains: [MAINNET, TESTNET4],
 *   connectors: [unisat(), xverse()],
 *   transports: {
 *     mainnet: [mempool({ network: MAINNET })],
 *     testnet4: [mempool({ network: TESTNET4 })],
 *   },
 * })
 * // `config.chains` typed as `readonly [typeof MAINNET, typeof TESTNET4]`
 * // `config.transports` keys typed as `'mainnet' | 'testnet4'`
 * ```
 */
export function createLaserEyesConfig<
  const chains extends readonly [ChainNetwork, ...ChainNetwork[]],
  const transports extends NetworkTransports<chains>,
  const connectorFns extends readonly CreateConnectorFn[] = readonly [],
>(
  opts: CreateLaserEyesConfigOptions<chains, transports, connectorFns>
): LaserEyesConfig<chains, transports, connectorFns> {
  const chains = opts.chains
  const defaultChain = chains[0]
  const state = createState(defaultChain.id)
  const storage = opts.storage ?? createStorage()

  // Connector factories receive a config bag describing the app + chains.
  const connectorConfig = {
    appName: opts.appName,
    appIcon: opts.appIcon,
    networks: chains,
  }
  const connectorFns = (opts.connectors ?? ([] as unknown as connectorFns)) as connectorFns
  const connectors: Connector[] = (connectorFns as readonly CreateConnectorFn[]).map((fn) =>
    fn(connectorConfig)
  )

  // Seed the connector registry synchronously. Discovery merges in
  // announced connectors when `initialize(config)` runs.
  const initialRegistry: Record<string, Connector> = {}
  for (const c of connectors) initialRegistry[c.id] = c
  state.$connectors.set(initialRegistry)

  return {
    chains,
    connectorFns,
    connectors,
    transports: opts.transports,
    state,
    storage,
    appName: opts.appName,
    appIcon: opts.appIcon,
    autoReconnect: opts.autoReconnect ?? true,
  }
}
