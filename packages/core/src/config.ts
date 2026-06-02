/**
 * `LaserEyesConfig` — the wagmi-shaped registry that replaces the old
 * `LaserEyesCore` class.
 *
 * @remarks
 * A LaserEyes config is a value, not a class. It bundles:
 * - the chains your app supports (as a typed tuple)
 * - the connectors users can connect with (each retains its factory identity)
 * - the per-chain backends (one resolved backend per network)
 * - the reactive state atoms
 * - the storage layer for persisted state (auto-reconnect, etc.)
 *
 * Operations are free functions in `actions/*` that take a config and any
 * necessary args.
 *
 * Three threaded generics — `chains`, `backends`, `connectorFns` —
 * preserve literal-typed information (chain IDs, per-chain capability
 * sets, per-connector identity) so the keystone {@link getWalletClient}
 * (Phase 10) can hand callers a precisely-typed wallet client without
 * extra ceremony at the call site. All three default to permissive
 * variants so call sites that don't need precision can pass
 * `LaserEyesConfig` (no type args) directly.
 *
 * @module config
 */

import type {
  ChainBackend,
  ChainBackendFactory,
  ChainNetwork,
  Client,
} from '@omnisat/lasereyes-client'
import { createState, type LaserEyesState } from './state'
import { createStorage, type Storage } from './storage'
import type { Connector, CreateConnectorFn } from './types/connector'

/**
 * Optional user-supplied client factory.
 *
 * @remarks
 * When set on a {@link LaserEyesConfig}, `getClient(config, …)` calls
 * this factory instead of the default `createClient({ network,
 * backend })` construction. The factory wins unconditionally —
 * including when a wallet is connected. Use it to inject caching
 * wrappers, instrumentation, or a fully-custom client implementation.
 *
 * @param params.chain - The resolved chain for the requested chainId.
 * @param params.backend - The backend the default path would have
 *   used (`config.backends[chainId]`). Use it, ignore it,
 *   or compose with your own.
 */
export type ClientFactory = (params: {
  chain: ChainNetwork
  backend: ChainBackend<any>
}) => Client<any, any, any>

/**
 * Per-network backend configuration parameterized by the chains tuple.
 *
 * @remarks
 * Each chain ID maps to a single {@link ChainBackendFactory} — the external
 * service backing that chain's reads. To use several services for one chain
 * (with fallback), compose them into one backend via `combineBackends(…)`
 * from `@omnisat/lasereyes-client`. The network is injected from the map key
 * when `createLaserEyesConfig` builds the config, so a backend declaration
 * (`mempool()`) carries no network of its own.
 */
export type NetworkBackendsParams<
  chains extends readonly [ChainNetwork, ...ChainNetwork[]] = readonly [
    ChainNetwork,
    ...ChainNetwork[],
  ],
> = {
  // `<any>` is the *constraint* (ChainBackend is invariant in its
  // capability set, so a concrete `ChainBackendFactory<BaseCapability>`
  // wouldn't satisfy a `ChainBackendFactory<ActionGroup>` gate). The precise
  // capability set is recovered from the concrete factory in
  // {@link NetworkBackends} via `ReturnType`.
  [K in chains[number]['id']]: ChainBackendFactory<any>
}

/**
 * The resolved form of {@link NetworkBackendsParams}: each chain ID maps to
 * the concrete {@link ChainBackend} its backend factory produced.
 */
export type NetworkBackends<
  chains extends readonly [ChainNetwork, ...ChainNetwork[]],
  params extends NetworkBackendsParams<chains>,
> = {
  [K in chains[number]['id']]: ReturnType<params[K]>
}

/**
 * The fully-resolved config produced by {@link createLaserEyesConfig}.
 *
 * @typeParam chains - The tuple of chains this config knows about.
 * @typeParam backends - The per-chain backend map. Each chain ID maps to a
 *   single `ChainBackend` (compose several via `combineBackends`).
 * @typeParam connectorFns - The connector factory identities, preserved so
 *   downstream consumers can refer back to specific connectors.
 */
export interface LaserEyesConfig<
  chains extends readonly [ChainNetwork, ...ChainNetwork[]] = readonly [
    ChainNetwork,
    ...ChainNetwork[],
  ],
  backends extends NetworkBackendsParams<chains> = NetworkBackendsParams<chains>,
  connectorFns extends readonly CreateConnectorFn[] = readonly CreateConnectorFn[],
> {
  /** Bitcoin chains this config knows about, in declaration order. */
  readonly chains: chains
  /** Connector factory identities the user explicitly registered. */
  readonly connectorFns: connectorFns
  /** Connectors instantiated from `connectorFns`, indexed in declaration order. */
  readonly connectors: readonly Connector[]
  /** Per-network backend — the resolved backend for each chain. */
  readonly backends: NetworkBackends<chains, backends>
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
  /**
   * Optional user-supplied client factory. When set, `getClient(config, …)`
   * uses this unconditionally — including when a wallet is connected.
   * When unset, `getClient` defers to the connected wallet's client (if
   * any) and falls back to the default `createClient({ network,
   * backend })`.
   */
  readonly client?: ClientFactory
}

/**
 * Options accepted by {@link createLaserEyesConfig}.
 */
export interface CreateLaserEyesConfigOptions<
  chains extends readonly [ChainNetwork, ...ChainNetwork[]],
  backends extends NetworkBackendsParams<chains>,
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
   * Per-network backend — one {@link ChainBackendFactory} per chain. Use
   * `combineBackends(a, b, …)` to compose several services into a single
   * backend (first wins on overlap, the rest are fallbacks).
   */
  backends: backends
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
  /**
   * Custom client factory. When set, takes unconditional precedence over
   * the default `getClient` behavior (including the connected wallet's
   * client).
   *
   * @example
   * ```ts
   * createLaserEyesConfig({
   *   chains: [MAINNET],
   *   backends: { mainnet: mempool() },
   *   client: ({ chain, backend }) =>
   *     createClient({ network: chain, backend })
   *       .extend(publicActions())
   *       .extend(cacheActions()),
   * })
   * ```
   */
  client?: ClientFactory
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
 * IDs stay a string-literal union, the backends map keys stay typed
 * to those literals, and per-connector factory identity is preserved
 * across the readonly tuple.
 *
 * @example
 * ```ts
 * import { createLaserEyesConfig, unisat, xverse } from '@omnisat/lasereyes-core'
 * import { MAINNET, TESTNET4 } from '@omnisat/lasereyes-client'
 * import { mempool } from '@omnisat/lasereyes-client/vendors/mempool'
 * import { sandshrew } from '@omnisat/lasereyes-client/vendors/sandshrew'
 * import { combineBackends } from '@omnisat/lasereyes-client'
 *
 * const config = createLaserEyesConfig({
 *   chains: [MAINNET, TESTNET4],
 *   connectors: [unisat(), xverse()],
 *   backends: {
 *     mainnet: combineBackends(sandshrew({ apiKey: '…' }), mempool()),
 *     testnet4: mempool(),
 *   },
 * })
 * // `config.chains` typed as `readonly [typeof MAINNET, typeof TESTNET4]`
 * // `config.backends` keys typed as `'mainnet' | 'testnet4'`
 * ```
 */
export function createLaserEyesConfig<
  const chains extends readonly [ChainNetwork, ...ChainNetwork[]],
  const backends extends NetworkBackendsParams<chains>,
  const connectorFns extends readonly CreateConnectorFn[] = readonly [],
>(
  opts: CreateLaserEyesConfigOptions<chains, backends, connectorFns>
): LaserEyesConfig<chains, backends, connectorFns> {
  const chains = opts.chains
  const defaultChain = chains[0]
  const state = createState(defaultChain.id)
  const storage = opts.storage ?? createStorage()
  // Resolve each backend factory against its chain. We pass the full chain
  // object (not just the id) so custom `defineChain()` networks that aren't
  // in the built-in registry resolve correctly.
  const backends = Object.fromEntries(
    Object.entries(opts.backends).map(([key, factory]) => {
      const chain = chains.find(c => c.id === key) ?? (key as ChainNetwork['id'])
      return [key, (factory as ChainBackendFactory)(chain)]
    })
  ) as unknown as NetworkBackends<chains, backends>

  // Connector factories receive a config bag describing the app + chains.
  const connectorConfig = {
    appName: opts.appName,
    appIcon: opts.appIcon,
    networks: chains,
  }
  const connectorFns = (opts.connectors ?? ([] as unknown as connectorFns)) as connectorFns
  const connectors: Connector[] = (connectorFns as readonly CreateConnectorFn[]).map(fn =>
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
    backends,
    state,
    storage,
    appName: opts.appName,
    appIcon: opts.appIcon,
    autoReconnect: opts.autoReconnect ?? true,
    client: opts.client,
  }
}
