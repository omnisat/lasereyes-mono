/**
 * Type-inference contract for the core package.
 *
 * @remarks
 * Run via `vitest typecheck`. This file contains no runtime assertions —
 * each `it` block exists purely so its body is typechecked. If a future
 * change breaks a contract here, `vitest typecheck` fails in CI.
 *
 * # Maintenance rules
 *
 * **Any change to a public type or signature in this package must come
 * with a corresponding update to this file.** Specifically:
 *
 * 1. **New adapter** → add a check that `loadXxxWalletAdapter()` returns
 *    `BitcoinProviderAdapter | null` and that the adapter class extends
 *    `BaseAdapter`.
 * 2. **New connector factory** → add a check under `Connector factories`
 *    that the factory returns `CreateConnectorFn` and that calling it
 *    with a `ConnectorConfig` yields a `Connector`.
 * 3. **Changed `BitcoinProvider.request` signature** → update the
 *    positional-shape assertion.
 * 4. **Changed `Connector` interface** (added/renamed methods, changed
 *    Account vs AddressInfo shape) → update the relevant per-method
 *    assertions.
 * 5. **New `discoverConnectors` parameter or return shape** → update
 *    the discovery section.
 * 6. **Changed `LaserEyesConfig` / `createLaserEyesConfig` signature** —
 *    update the `LaserEyesConfig` section: literal preservation, chain-ID
 *    union, backends record shape, and connectorFns tuple identity.
 * 7. **New action or changed action signature** — update §7 (Phase 9
 *    actions). Each action assertion captures: `<const config>` threading,
 *    parameter types, return type. `switchNetwork` is the showcase for
 *    per-arg narrowing; if any future action narrows args/return based
 *    on the threaded config, add a parallel showcase block.
 *
 * @module __tests__/type-inference
 */

// — Domain types referenced in action signatures —
import type {
  AlkaneBalance,
  Brc20Balance,
  ChainBackend,
  ChainNetwork,
  FeeEstimate,
  Inscription,
  NetworkId,
  PaginatedResult,
  RuneBalance,
  Transaction,
  UTXO,
} from '@omnisat/lasereyes-client'
import {
  combineBackends,
  MAINNET,
  ProviderErrorCode,
  ProviderRpcError,
  TESTNET4,
} from '@omnisat/lasereyes-client'
import type { mempool } from '@omnisat/lasereyes-client/vendors/mempool'
import type { sandshrew } from '@omnisat/lasereyes-client/vendors/sandshrew'
import type {
  Account,
  SignedPsbt,
  SignMessageOptions,
  SignPsbtOptions,
  WalletAccount,
} from '@omnisat/lasereyes-client/wallet'
import { describe, expectTypeOf, it } from 'vitest'
// — Phase 9 actions —
import {
  broadcastPsbt,
  broadcastTransaction,
  type ConnectArgs,
  connect,
  disconnect,
  dispose,
  getAddressBalance,
  getAddressUtxos,
  getAlkanesBalances,
  getBrc20Balances,
  getClient,
  getInscriptions,
  getRecommendedFees,
  getRunesBalances,
  getTransaction,
  initialize,
  sendBtc,
  signMessage,
  signPsbt,
  switchNetwork,
} from '../actions'
// — Adapters (built-in) —
import type { BaseAdapter, BitcoinProviderAdapter } from '../adapters/base'
import { type KeplrAdapter, loadKeplrWalletAdapter } from '../adapters/keplr'
import { type LeatherAdapter, loadLeatherWalletAdapter } from '../adapters/leather'
import { loadMagicEdenWalletAdapter, type MagicEdenAdapter } from '../adapters/magic-eden'
import { loadOkxWalletAdapter, type OkxAdapter } from '../adapters/okx'
import { loadOpNetWalletAdapter, type OpNetAdapter } from '../adapters/op-net'
import { loadOrangeWalletAdapter, type OrangeAdapter } from '../adapters/orange'
import { loadOylWalletAdapter, type OylAdapter } from '../adapters/oyl'
import { loadPhantomWalletAdapter, type PhantomAdapter } from '../adapters/phantom'
import { loadSparrowWalletAdapter, type SparrowAdapter } from '../adapters/sparrow'
import { loadTokeoWalletAdapter, type TokeoAdapter } from '../adapters/tokeo'
import { loadUnisatWalletAdapter, type UnisatAdapter } from '../adapters/unisat'
import type { XverseAdapter } from '../adapters/xverse'
// — Config + state —
import { createLaserEyesConfig, type LaserEyesConfig, type NetworkBackendsParams } from '../config'
// — Connectors —
import { createConnector } from '../connectors/create'
import { type InjectedConnectorOptions, injected } from '../connectors/injected'
import { keplr } from '../connectors/keplr'
import { leather } from '../connectors/leather'
import { magicEden } from '../connectors/magic-eden'
import { okx } from '../connectors/okx'
import { opNet } from '../connectors/op-net'
import { orange } from '../connectors/orange'
import { oyl } from '../connectors/oyl'
import { phantom } from '../connectors/phantom'
import { sparrow } from '../connectors/sparrow'
import { tokeo } from '../connectors/tokeo'
import { binance, unisat, unisatLike, wizz } from '../connectors/unisat'
import { xverse } from '../connectors/xverse'
// — Detection —
import {
  announceWallet,
  listenForWalletAnnouncements,
  type WalletAnnouncement,
} from '../detection/announcements'
import { connectorFromAnnouncement, discoverConnectors } from '../detection/discovery'
import type { LaserEyesState } from '../state'
import type { Storage } from '../storage'
// — Connector + provider types —
import type {
  ConnectionStatus,
  Connector,
  ConnectorConfig,
  ConnectResult,
  CreateConnectorFn,
} from '../types/connector'
import type { BitcoinProvider, ProviderCapabilities } from '../types/provider'
// — Phase 10 keystone —
import { getWalletClient } from '../wallet-client'

// ============================================================================
// Top-level fixtures (declare's must live here, not inside `it()` bodies)
// ============================================================================

declare const provider: BitcoinProvider
declare const adapter: BaseAdapter
declare const u: UnisatAdapter
declare const x: XverseAdapter
declare const l: LeatherAdapter
declare const ok: OkxAdapter
declare const oy: OylAdapter
declare const me: MagicEdenAdapter
declare const ph: PhantomAdapter
declare const or: OrangeAdapter
declare const op: OpNetAdapter
declare const sp: SparrowAdapter
declare const to: TokeoAdapter
declare const ke: KeplrAdapter
declare const caps: ProviderCapabilities
declare const target: InjectedConnectorOptions
declare const config: ConnectorConfig
declare const c: Connector
declare const announcement: WalletAnnouncement
declare const switchNetworkFn: (networkId: NetworkId) => Promise<NetworkId>

// ============================================================================
// 1. BitcoinProvider standard
// ============================================================================

describe('BitcoinProvider', () => {
  it('request is positional: (method, params?)', () => {
    expectTypeOf(provider.request).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(provider.request)
      .parameter(1)
      .toEqualTypeOf<{ [key: string]: unknown } | undefined>()
    expectTypeOf(provider.request).returns.toEqualTypeOf<Promise<unknown>>()
  })

  it('exposes EventEmitter on/removeListener', () => {
    expectTypeOf(provider.on).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(provider.removeListener).parameter(0).toEqualTypeOf<string>()
  })
})

describe('ProviderRpcError', () => {
  it('constructed with code/message/data', () => {
    const err = new ProviderRpcError(ProviderErrorCode.USER_REJECTED, 'rejected', { x: 1 })
    expectTypeOf(err.code).toEqualTypeOf<number>()
    expectTypeOf(err.message).toEqualTypeOf<string>()
    expectTypeOf(err.data).toEqualTypeOf<unknown>()
  })

  it('ProviderErrorCode covers EIP-1193 + JSON-RPC standard codes', () => {
    expectTypeOf(ProviderErrorCode.USER_REJECTED).toEqualTypeOf<ProviderErrorCode>()
    expectTypeOf(ProviderErrorCode.METHOD_NOT_FOUND).toEqualTypeOf<ProviderErrorCode>()
  })
})

// ============================================================================
// 2. Adapters
// ============================================================================

describe('Adapters', () => {
  it('all built-in adapters extend BaseAdapter and implement BitcoinProviderAdapter', () => {
    expectTypeOf(u).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(x).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(l).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(ok).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(oy).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(me).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(ph).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(or).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(op).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(sp).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(to).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(ke).toMatchTypeOf<BaseAdapter>()
    expectTypeOf(u).toMatchTypeOf<BitcoinProviderAdapter>()
  })

  it('every adapter has positional request(method, params?)', () => {
    expectTypeOf(adapter.request).parameter(0).toEqualTypeOf<string>()
    expectTypeOf(adapter.request)
      .parameter(1)
      .toEqualTypeOf<{ [key: string]: unknown } | undefined>()
    expectTypeOf(adapter.request).returns.toEqualTypeOf<Promise<unknown>>()
  })

  it('adapter loaders return BitcoinProviderAdapter | null', () => {
    expectTypeOf(loadUnisatWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadLeatherWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadOkxWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadOylWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadMagicEdenWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadPhantomWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadOrangeWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadOpNetWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadSparrowWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadTokeoWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
    expectTypeOf(loadKeplrWalletAdapter).returns.toEqualTypeOf<BitcoinProviderAdapter | null>()
  })

  it('ProviderCapabilities is a per-network method matrix', () => {
    expectTypeOf(caps).toMatchTypeOf<{
      [networkId: string]: { [methodName: string]: unknown }
    }>()
  })
})

// ============================================================================
// 3. Connector factories
// ============================================================================

describe('Connector factories', () => {
  it('createConnector returns CreateConnectorFn (identity helper)', () => {
    const fn = createConnector(() => ({}) as Connector)
    expectTypeOf(fn).toEqualTypeOf<CreateConnectorFn>()
  })

  it('injected({ target }) returns CreateConnectorFn', () => {
    const fn = injected(target)
    expectTypeOf(fn).toEqualTypeOf<CreateConnectorFn>()
  })

  it('every per-wallet factory returns CreateConnectorFn', () => {
    expectTypeOf(unisat).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(binance).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(wizz).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(xverse).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(leather).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(okx).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(oyl).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(magicEden).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(phantom).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(orange).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(opNet).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(sparrow).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(tokeo).returns.toEqualTypeOf<CreateConnectorFn>()
    expectTypeOf(keplr).returns.toEqualTypeOf<CreateConnectorFn>()
  })

  it('CreateConnectorFn(config) yields a Connector', () => {
    const fn = unisat()
    const built = fn(config)
    expectTypeOf(built).toEqualTypeOf<Connector>()
  })

  it('unisatLike accepts an identity + raw-window extractor', () => {
    // unisatLike wraps the raw window object in `UnisatAdapter` for you,
    // so callers pass an `extract` (raw fetcher) rather than the full
    // `getProvider` (which would already need to know about adapters).
    expectTypeOf(unisatLike).parameter(0).toMatchTypeOf<{
      id: string
      name: string
      extract: (window: Window & typeof globalThis) => unknown | null | undefined
    }>()
  })
})

// ============================================================================
// 4. Connector interface
// ============================================================================

describe('Connector interface', () => {
  it('connect() resolves to ConnectResult { account: WalletAccount, networkId: NetworkId }', () => {
    expectTypeOf(c.connect).returns.resolves.toEqualTypeOf<ConnectResult>()
    expectTypeOf<ConnectResult['account']>().toEqualTypeOf<WalletAccount>()
    expectTypeOf<ConnectResult['networkId']>().toEqualTypeOf<NetworkId>()
  })

  it('getAccount returns WalletAccount (with getAddress/getPublicKey methods)', () => {
    expectTypeOf(c.getAccount).returns.toEqualTypeOf<Promise<WalletAccount>>()
  })

  it('getProvider returns BitcoinProvider | null', () => {
    expectTypeOf(c.getProvider).returns.toEqualTypeOf<BitcoinProvider | null>()
  })

  it('switchNetwork (optional) returns Promise<NetworkId>', () => {
    // The adapter normalizes the wallet's native chain identifier into a
    // spec NetworkId — the action layer trusts that value rather than
    // looking up by the originally-requested id.
    expectTypeOf<NonNullable<typeof c.switchNetwork>>().toMatchTypeOf<typeof switchNetworkFn>()
  })

  it('event handlers use Account-singular semantics', () => {
    expectTypeOf(c.onAccountChanged).parameter(0).toEqualTypeOf<Account>()
    expectTypeOf(c.onNetworkChanged).parameter(0).toEqualTypeOf<NetworkId>()
    expectTypeOf(c.onConnect).parameter(0).toEqualTypeOf<ConnectResult>()
    expectTypeOf(c.onDisconnect).returns.toEqualTypeOf<void>()
  })

  it('ConnectionStatus is the four-state union', () => {
    expectTypeOf<ConnectionStatus>().toEqualTypeOf<
      'disconnected' | 'connecting' | 'connected' | 'reconnecting'
    >()
  })
})

// ============================================================================
// 5. Discovery
// ============================================================================

describe('Discovery', () => {
  it('listenForWalletAnnouncements returns a cleanup fn', () => {
    expectTypeOf(listenForWalletAnnouncements)
      .parameter(0)
      .toEqualTypeOf<(announcement: WalletAnnouncement) => void>()
    expectTypeOf(listenForWalletAnnouncements).returns.toEqualTypeOf<() => void>()
  })

  it('announceWallet takes a WalletAnnouncement and returns void', () => {
    expectTypeOf(announceWallet).parameter(0).toEqualTypeOf<WalletAnnouncement>()
    expectTypeOf(announceWallet).returns.toEqualTypeOf<void>()
  })

  it('connectorFromAnnouncement(a) returns a Connector', () => {
    expectTypeOf(connectorFromAnnouncement(announcement)).toEqualTypeOf<Connector>()
  })

  it('discoverConnectors expects { explicit, onChange } and returns a cleanup fn', () => {
    expectTypeOf(discoverConnectors).parameter(0).toEqualTypeOf<{
      explicit: Connector[]
      onChange: (connectors: Map<string, Connector>) => void
    }>()
    expectTypeOf(discoverConnectors).returns.toEqualTypeOf<() => void>()
  })
})

// ============================================================================
// 6. createLaserEyesConfig — wagmi-shaped generic registry
//
// Three threaded generics — `chains`, `backends`, `connectorFns` — preserve
// literal-typed information so Phase 10's keystone (`getWalletClient` /
// `getClient`) can hand callers a precisely-typed result on a per-chain
// basis. The default-generic case lets call sites that don't need precision
// pass `LaserEyesConfig` (no type args) directly.
// ============================================================================

// Module-level fixtures (declare's must live here, not inside `it()` bodies).
declare const memMainnet: ReturnType<typeof mempool>
declare const memTestnet4: ReturnType<typeof mempool>
declare const sandshrewMainnet: ReturnType<typeof sandshrew>

describe('createLaserEyesConfig', () => {
  it('preserves the chains tuple as a literal-typed readonly tuple', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET, TESTNET4],
      backends: {
        mainnet: memMainnet,
        testnet4: memTestnet4,
      },
    })

    expectTypeOf<typeof config.chains>().toEqualTypeOf<readonly [typeof MAINNET, typeof TESTNET4]>()
  })

  it("backends keys are constrained to the chains' ID literals", () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET, TESTNET4],
      backends: {
        mainnet: memMainnet,
        testnet4: memTestnet4,
      },
    })

    type BackendKeys = keyof typeof config.backends
    expectTypeOf<BackendKeys>().toEqualTypeOf<'mainnet' | 'testnet4'>()
  })

  it('a chain backend resolves to the backend its factory produces', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      backends: {
        // sandshrew (full caps) primary, mempool (base) fallback — folded
        // into one backend by combineBackends.
        mainnet: combineBackends(sandshrewMainnet, memMainnet),
      },
    })

    // The resolved backend is a single ChainBackend, not an array, and it
    // carries sandshrew's full capability surface.
    expectTypeOf<typeof config.backends.mainnet>().toMatchTypeOf<ChainBackend<any>>()
  })

  it('connectorFns tuple preserves identity (each factory typed individually)', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      connectors: [unisat(), xverse()],
      backends: {
        mainnet: memMainnet,
      },
    })

    // Tuple length is preserved — `connectorFns[0]` is the unisat factory
    // and `connectorFns[1]` is the xverse factory.
    expectTypeOf<typeof config.connectorFns>().toMatchTypeOf<
      readonly [ReturnType<typeof unisat>, ReturnType<typeof xverse>]
    >()
  })

  it('returns a config exposing state, storage, and the resolved connectors', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      backends: { mainnet: memMainnet },
    })

    expectTypeOf<typeof config.state>().toMatchTypeOf<LaserEyesState>()
    expectTypeOf<typeof config.storage>().toMatchTypeOf<Storage>()
    expectTypeOf<typeof config.connectors>().toMatchTypeOf<readonly Connector[]>()
    expectTypeOf<typeof config.autoReconnect>().toEqualTypeOf<boolean>()
  })

  it('accepts an optional `client` factory of shape ({chain, backend}) => Client', async () => {
    const { createClient } = await import('@omnisat/lasereyes-client')
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      backends: { mainnet: memMainnet },
      client: ({ chain, backend }) => createClient({ network: chain, backend }),
    })
    expectTypeOf<NonNullable<typeof config.client>>().parameter(0).toMatchTypeOf<{
      chain: ChainNetwork
      backend: ChainBackend<any>
    }>()
  })

  it('omitting `client` is legal — it defaults to undefined', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      backends: { mainnet: memMainnet },
    })
    expectTypeOf<typeof config.client>().toEqualTypeOf<
      typeof config.client extends infer T ? T : never
    >()
    // The field is optional; the type allows undefined.
    expectTypeOf<undefined extends typeof config.client ? true : false>().toEqualTypeOf<true>()
  })

  it('connectors arg is optional (defaults to empty tuple)', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      backends: { mainnet: memMainnet },
    })

    // The tuple is empty when no connectors are passed.
    expectTypeOf<typeof config.connectorFns>().toMatchTypeOf<readonly []>()
  })

  // NOTE: TS structural subtyping permits *extra* keys in `backends`
  // when inferred from a generic constraint position (`backends extends
  // NetworkBackends<chains>`). Only fresh-literal-to-named-type
  // assignment triggers excess-property checks. Extra backend keys are
  // harmless at runtime — `getClient(config, { chainId })` only reads the
  // key matching `chainId`. We don't test for a rejection that TS won't
  // produce.

  it('rejects backends missing a chain ID present in `chains`', () => {
    createLaserEyesConfig({
      chains: [MAINNET, TESTNET4],
      // @ts-expect-error — `backends` must include both 'mainnet' and 'testnet4'.
      backends: {
        mainnet: memMainnet,
      },
    })
  })

  it('rejects an empty chains tuple at the type level', () => {
    // `chains` requires a non-empty readonly tuple. Verified via direct
    // assignability check (testing this at the call site is brittle —
    // TS reports the missing-backends error first and masks the chains
    // check).
    type EmptyChains = readonly []
    type ValidChains = readonly [ChainNetwork, ...ChainNetwork[]]
    expectTypeOf<EmptyChains extends ValidChains ? true : false>().toEqualTypeOf<false>()
  })

  it('a typed config is assignable to bare `LaserEyesConfig` (the action bound)', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET, TESTNET4],
      backends: { mainnet: memMainnet, testnet4: memTestnet4 },
    })

    // `LaserEyesConfig` is parameterized by the RESOLVED backend map with a
    // loose `Record<string, ChainBackend>` default, so bare `LaserEyesConfig`
    // is a permissive supertype that accepts a subset-chain config. This is
    // what lets every action use `<const config extends LaserEyesConfig>` —
    // no `LaserEyesConfig<any, any, any>` needed.
    //
    // (Pre-fix this failed: the default `backends` field was an all-NetworkId
    // -keys map, so a config with only mainnet + testnet4 wasn't assignable.)
    expectTypeOf(config).toMatchTypeOf<LaserEyesConfig>()

    function actionBound<const C extends LaserEyesConfig>(c: C): C {
      return c
    }
    actionBound(config)
  })

  it('keeps precise per-chain backend caps on the resolved config', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      backends: { mainnet: memMainnet },
    })
    // The loose default applies only to bare `LaserEyesConfig`; a concrete
    // config keeps each backend's precise capability set, so the
    // BaseCapability method is reachable.
    expectTypeOf(config.backends.mainnet.btcGetBalance).toBeFunction()
  })
})

describe('NetworkBackends', () => {
  it('keys constrained by the chains tuple', () => {
    type T = NetworkBackendsParams<readonly [typeof MAINNET, typeof TESTNET4]>
    expectTypeOf<keyof T>().toEqualTypeOf<'mainnet' | 'testnet4'>()
  })

  it('values are a single backend factory (network) => ChainBackend', () => {
    type T = NetworkBackendsParams<readonly [typeof MAINNET]>
    // One backend per chain — a factory, not an array (compose several with
    // combineBackends).
    expectTypeOf<T['mainnet']>().toMatchTypeOf<(network: any) => ChainBackend<any>>()
    expectTypeOf<T['mainnet']>().toBeFunction()
  })

  it('default generic permits any chain ID', () => {
    // The default param `readonly [ChainNetwork, ...ChainNetwork[]]` makes
    // keys typed as `NetworkId` (the open string union), so a permissive
    // call site doesn't need to thread chains through.
    type Default = NetworkBackendsParams
    expectTypeOf<keyof Default>().toEqualTypeOf<NetworkId>()
  })
})

// ============================================================================
// 7. Phase 9 actions — signatures and return shapes
//
// Every action threads `<const config extends LaserEyesConfig<any, any, any>>`.
// `switchNetwork` is the showcase for per-arg narrowing.
// ============================================================================

// Module-level fixtures for the action tests.
declare const memMain: ReturnType<typeof mempool>
declare const memT4: ReturnType<typeof mempool>

// A precisely-typed config used for narrowing tests.
const _typedConfig = createLaserEyesConfig({
  chains: [MAINNET, TESTNET4],
  backends: {
    mainnet: memMain,
    testnet4: memT4,
  },
})

// A loosely-typed config used to verify the default-generic `LaserEyesConfig`
// shape is still accepted by every action (regression guard).
declare const _looseConfig: ReturnType<typeof createLaserEyesConfig>

describe('Phase 9 — Lifecycle actions', () => {
  it('initialize: (config) => Promise<void>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof initialize>[0]>()
    expectTypeOf(initialize(_typedConfig)).resolves.toEqualTypeOf<void>()
  })

  it('dispose: (config) => void (sync)', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof dispose>[0]>()
    expectTypeOf(dispose(_typedConfig)).toEqualTypeOf<void>()
  })

  it('connect: (config, { connectorId }) => Promise<ConnectResult>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof connect>[0]>()
    expectTypeOf(connect).parameter(1).toEqualTypeOf<ConnectArgs>()
    expectTypeOf<ConnectArgs>().toEqualTypeOf<{ connectorId: string }>()
    expectTypeOf(connect(_typedConfig, { connectorId: 'unisat' })).resolves.toMatchTypeOf<{
      account: Account
      networkId: NetworkId
    }>()
  })

  it('disconnect: (config) => Promise<void>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof disconnect>[0]>()
    expectTypeOf(disconnect(_typedConfig)).resolves.toEqualTypeOf<void>()
  })

  // ────────────────────────────────────────────────────────────────────────
  // switchNetwork — the threading-discipline showcase.
  //
  // The threaded `config` generic narrows `networkId` to the chains the
  // config carries, AND narrows the return type to the SPECIFIC chain
  // matching the passed networkId.
  // ────────────────────────────────────────────────────────────────────────
  describe('switchNetwork (threading showcase)', () => {
    it('networkId is constrained to chains the config carries', () => {
      type Param = Parameters<typeof switchNetwork<typeof _typedConfig, 'mainnet'>>[1]
      expectTypeOf<Param>().toEqualTypeOf<'mainnet'>()
    })

    it('return type narrows to the specific chain matching the passed id', () => {
      // `switchNetwork(config, 'mainnet')` should return `Promise<typeof MAINNET>`
      // (precisely, not `Promise<ChainNetwork>` and not the union of all chains).
      const promise = switchNetwork(_typedConfig, 'mainnet')
      expectTypeOf(promise).resolves.toEqualTypeOf<typeof MAINNET>()

      const t4Promise = switchNetwork(_typedConfig, 'testnet4')
      expectTypeOf(t4Promise).resolves.toEqualTypeOf<typeof TESTNET4>()
    })

    it('rejects networkIds not in the config chains tuple', () => {
      // @ts-expect-error — 'signet' is not in `chains[number]['id']`.
      switchNetwork(_typedConfig, 'signet')

      // @ts-expect-error — 'fractal-mainnet' is not in `chains[number]['id']`.
      switchNetwork(_typedConfig, 'fractal-mainnet')

      // @ts-expect-error — completely-unknown chain ID.
      switchNetwork(_typedConfig, 'totally-fake-chain')
    })

    it('falls back to ChainNetwork when the config is default-generic', () => {
      // When the config is loosely typed, `Extract<chains[number], { id: id }>`
      // collapses to `never` (because `ChainNetwork.id: NetworkId` is wider
      // than the literal `id`). The return type's conditional `extends never`
      // branch fires, giving `Promise<ChainNetwork>` — a sane fallback
      // instead of `Promise<never>`.
      const result = switchNetwork(_looseConfig, 'mainnet')
      expectTypeOf(result).resolves.toEqualTypeOf<ChainNetwork>()

      // Loose config still permits any NetworkId (no rejection).
      switchNetwork(_looseConfig, 'testnet4')
      switchNetwork(_looseConfig, 'signet')
      switchNetwork(_looseConfig, 'fractal-mainnet')
    })
  })
})

// ============================================================================
// 7a. `getClient(config, opts?)` — read-only typed client
//
// Pulled in from Phase 10.2 to support the bare-action pattern in Phase 9
// reads. Returns a bare `Client` (no action groups extended) so callers
// compose it with the bare action functions from `@omnisat/lasereyes-client`:
//   `clientGetBalance(getClient(config), address)`.
// ============================================================================

describe('Phase 9 — getClient', () => {
  it('returns a bare Client when called with default options', () => {
    const client = getClient(_typedConfig)
    // Bare client has `config` and `extend` reachable.
    expectTypeOf(client.config.network).toMatchTypeOf<{ id: string }>()
    expectTypeOf(client.extend).toMatchTypeOf<Function>()
  })

  it('accepts an optional chainId narrowed to the config chains', () => {
    getClient(_typedConfig)
    getClient(_typedConfig, { chainId: 'mainnet' })
    getClient(_typedConfig, { chainId: 'testnet4' })

    // @ts-expect-error — 'signet' is not in the config chain ID union.
    getClient(_typedConfig, { chainId: 'signet' })
  })

  it('default-generic config accepts any NetworkId', () => {
    getClient(_looseConfig)
    getClient(_looseConfig, { chainId: 'mainnet' })
    getClient(_looseConfig, { chainId: 'signet' })
  })

  it('composes with bare action functions imported from the client package', async () => {
    // Locks in the architectural pattern: bare action + bare client.
    // The data actions in `actions/data.ts` use exactly this composition.
    const client = getClient(_typedConfig)

    // Imports here exercise the same paths Phase 9 actions use.
    const { getAddressBalance: clientGetAddressBalance } = await import('@omnisat/lasereyes-client')
    expectTypeOf(clientGetAddressBalance(client, 'bc1q…')).resolves.toEqualTypeOf<string>()
  })
})

// ============================================================================
// Phase 10 — `getWalletClient` keystone
//
// Wagmi-faithful: returns a bare WalletClient by default (no `.extend()`
// calls), or delegates entirely to `connector.getClient` when present.
// Threads `<const config>` so chainId is narrowed to the config's chain
// tuple.
// ============================================================================

describe('Phase 10 — getWalletClient', () => {
  it('returns a Promise<WalletClient<…>> with config + extend reachable', async () => {
    const wc = await getWalletClient(_typedConfig)
    // Bare wallet client: `config` carries account + signer + network + backend.
    expectTypeOf(wc.config.network).toMatchTypeOf<{ id: string }>()
    expectTypeOf(wc.config.account).toMatchTypeOf<Account>()
    expectTypeOf(wc.extend).toMatchTypeOf<Function>()
  })

  it('accepts an optional chainId narrowed to the config chains', () => {
    getWalletClient(_typedConfig)
    getWalletClient(_typedConfig, { chainId: 'mainnet' })
    getWalletClient(_typedConfig, { chainId: 'testnet4' })

    // @ts-expect-error — 'signet' is not in the config chain ID union.
    getWalletClient(_typedConfig, { chainId: 'signet' })
  })

  it('default-generic config accepts any NetworkId', () => {
    getWalletClient(_looseConfig)
    getWalletClient(_looseConfig, { chainId: 'mainnet' })
    getWalletClient(_looseConfig, { chainId: 'signet' })
  })

  it('returned wallet client composes with client-package action factories', async () => {
    // Locks in the architectural pattern: bare keystone client + factories
    // extended on top. Confirms the wallet client exposes the `.extend()`
    // chain required by the client package's factory signatures.
    const wc = await getWalletClient(_typedConfig)
    const { walletBtcActions } = await import('@omnisat/lasereyes-client/wallet')
    const extended = wc.extend(walletBtcActions())
    expectTypeOf(extended.sendBtc).toMatchTypeOf<Function>()
  })

  it('Connector.getClient hook shape — { client, chainId? } → WalletClient', () => {
    // Locks the override-hook signature. If this drifts (extra args, missing
    // client field, return-type change), the contract fails.
    type ConnectorInterface =
      NonNullable<ConstructorParameters<typeof Map>[0]> extends never ? never : never

    // Pull the type from the live Connector interface (re-exported from core).
    const _check: import('../types/connector').Connector['getClient'] = async ({ client }) => {
      // The hook receives a bare wallet client; returns one (extended or
      // not). Typecheck-only — no runtime call.
      return client
    }
    expectTypeOf(_check).toMatchTypeOf<
      | ((args: {
          client: import('@omnisat/lasereyes-client/wallet').WalletClient<any, any, any, any>
          chainId?: NetworkId
        }) =>
          | import('@omnisat/lasereyes-client/wallet').WalletClient<any, any, any, any>
          | Promise<import('@omnisat/lasereyes-client/wallet').WalletClient<any, any, any, any>>)
      | undefined
    >()
    // Reference the typedef to keep the import alive for tooling.
    void (null as unknown as ConnectorInterface)
  })
})

describe('Phase 9 — Read actions (provider-first, client-fallback)', () => {
  it('getAddressBalance: (config, address) => Promise<string>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getAddressBalance>[0]>()
    expectTypeOf(getAddressBalance).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getAddressBalance(_typedConfig, 'bc1q…')).resolves.toEqualTypeOf<string>()
  })

  it('getAddressUtxos: (config, address) => Promise<PaginatedResult<UTXO>>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getAddressUtxos>[0]>()
    expectTypeOf(getAddressUtxos).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getAddressUtxos(_typedConfig, 'bc1q…')).resolves.toEqualTypeOf<
      PaginatedResult<UTXO>
    >()
  })
})

describe('Phase 9 — Read actions (provider-only protocol reads)', () => {
  it('getInscriptions: (config, address, options?) => Promise<Inscription[]>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getInscriptions>[0]>()
    expectTypeOf(getInscriptions).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getInscriptions)
      .parameter(2)
      .toEqualTypeOf<{ offset?: number; limit?: number } | undefined>()
    expectTypeOf(getInscriptions(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<Inscription[]>()
  })

  it('getRunesBalances: (config, address) => Promise<RuneBalance[]>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getRunesBalances>[0]>()
    expectTypeOf(getRunesBalances).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getRunesBalances(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<RuneBalance[]>()
  })

  it('getBrc20Balances: (config, address) => Promise<Brc20Balance[]>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getBrc20Balances>[0]>()
    expectTypeOf(getBrc20Balances).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getBrc20Balances(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<Brc20Balance[]>()
  })

  it('getAlkanesBalances: (config, address) => Promise<AlkaneBalance[]>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getAlkanesBalances>[0]>()
    expectTypeOf(getAlkanesBalances).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getAlkanesBalances(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<
      AlkaneBalance[]
    >()
  })
})

describe('Phase 9 — Read actions (client-only)', () => {
  it('getRecommendedFees: (config, options?) => Promise<FeeEstimate>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getRecommendedFees>[0]>()
    expectTypeOf(getRecommendedFees(_typedConfig)).resolves.toEqualTypeOf<FeeEstimate>()
    // Optional chainId, narrowed to config chains
    expectTypeOf(
      getRecommendedFees(_typedConfig, { chainId: 'mainnet' })
    ).resolves.toEqualTypeOf<FeeEstimate>()
  })

  it('getTransaction: (config, txId, options?) => Promise<Transaction>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof getTransaction>[0]>()
    expectTypeOf(getTransaction).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getTransaction(_typedConfig, 'abc…')).resolves.toEqualTypeOf<Transaction>()
    expectTypeOf(
      getTransaction(_typedConfig, 'abc…', { chainId: 'testnet4' })
    ).resolves.toEqualTypeOf<Transaction>()
  })

  it('broadcastTransaction: (config, rawTx, options?) => Promise<string>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof broadcastTransaction>[0]>()
    expectTypeOf(broadcastTransaction).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(broadcastTransaction(_typedConfig, '02…')).resolves.toEqualTypeOf<string>()
    expectTypeOf(
      broadcastTransaction(_typedConfig, '02…', { chainId: 'mainnet' })
    ).resolves.toEqualTypeOf<string>()
  })

  // ────────────────────────────────────────────────────────────────────────
  // chainId narrowing — same shape as switchNetwork's parameter narrowing.
  // ────────────────────────────────────────────────────────────────────────
  describe('chainId narrowing on client-only reads', () => {
    it('rejects out-of-config chainIds on getRecommendedFees', () => {
      // @ts-expect-error — 'signet' is not in the config's chain ID union.
      getRecommendedFees(_typedConfig, { chainId: 'signet' })
      // @ts-expect-error — 'fractal-mainnet' not in chains.
      getRecommendedFees(_typedConfig, { chainId: 'fractal-mainnet' })
    })

    it('rejects out-of-config chainIds on getTransaction', () => {
      // @ts-expect-error — 'signet' not in chains.
      getTransaction(_typedConfig, 'tx', { chainId: 'signet' })
    })

    it('rejects out-of-config chainIds on broadcastTransaction', () => {
      // @ts-expect-error — 'signet' not in chains.
      broadcastTransaction(_typedConfig, '02…', { chainId: 'signet' })
    })

    it('accepts any NetworkId on a default-generic config', () => {
      // Loose configs accept any NetworkId — no narrowing.
      getRecommendedFees(_looseConfig, { chainId: 'mainnet' })
      getRecommendedFees(_looseConfig, { chainId: 'signet' })
      getTransaction(_looseConfig, 'tx', { chainId: 'fractal-mainnet' })
      broadcastTransaction(_looseConfig, '02…', { chainId: 'oylnet' })
    })
  })
})

describe('Phase 9 — Wallet (write) actions', () => {
  it('sendBtc: (config, to, amount) => Promise<string>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof sendBtc>[0]>()
    expectTypeOf(sendBtc).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(sendBtc).parameter(2).toEqualTypeOf<number>()
    expectTypeOf(sendBtc(_typedConfig, 'bc1q…', 10000)).resolves.toEqualTypeOf<string>()
  })

  it('signPsbt: (config, psbt, options?) => Promise<SignedPsbt>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof signPsbt>[0]>()
    expectTypeOf(signPsbt).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(signPsbt).parameter(2).toEqualTypeOf<SignPsbtOptions | undefined>()
    expectTypeOf(signPsbt(_typedConfig, 'psbthex')).resolves.toEqualTypeOf<SignedPsbt>()
  })

  it('signMessage: (config, message, options?) => Promise<string>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof signMessage>[0]>()
    expectTypeOf(signMessage).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(signMessage).parameter(2).toEqualTypeOf<SignMessageOptions | undefined>()
    expectTypeOf(signMessage(_typedConfig, 'hello')).resolves.toEqualTypeOf<string>()
  })

  it('broadcastPsbt: (config, psbt) => Promise<string>', () => {
    expectTypeOf(_typedConfig).toMatchTypeOf<Parameters<typeof broadcastPsbt>[0]>()
    expectTypeOf(broadcastPsbt).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(broadcastPsbt(_typedConfig, 'psbthex')).resolves.toEqualTypeOf<string>()
  })
})

describe('Phase 9 — Threading discipline (regression guards)', () => {
  it('every action accepts a typed LaserEyesConfig (parameter covariance)', () => {
    // If a future refactor breaks the `<const config extends LaserEyesConfig<
    // any, any, any>>` threading, this block fails at the call sites.
    initialize(_typedConfig)
    dispose(_typedConfig)
    connect(_typedConfig, { connectorId: 'x' })
    disconnect(_typedConfig)
    switchNetwork(_typedConfig, 'mainnet')
    getAddressBalance(_typedConfig, 'bc1q…')
    getAddressUtxos(_typedConfig, 'bc1q…')
    getInscriptions(_typedConfig, 'bc1p…')
    getRunesBalances(_typedConfig, 'bc1p…')
    getBrc20Balances(_typedConfig, 'bc1p…')
    getAlkanesBalances(_typedConfig, 'bc1p…')
    getRecommendedFees(_typedConfig)
    getTransaction(_typedConfig, 'tx')
    broadcastTransaction(_typedConfig, '02…')
    sendBtc(_typedConfig, 'bc1q…', 1000)
    signPsbt(_typedConfig, 'psbt')
    signMessage(_typedConfig, 'hello')
    broadcastPsbt(_typedConfig, 'psbt')
  })

  it('every action accepts the default-generic LaserEyesConfig too (looseness)', () => {
    initialize(_looseConfig)
    dispose(_looseConfig)
    connect(_looseConfig, { connectorId: 'x' })
    disconnect(_looseConfig)
    switchNetwork(_looseConfig, 'mainnet')
    getAddressBalance(_looseConfig, 'bc1q…')
    getAddressUtxos(_looseConfig, 'bc1q…')
    getInscriptions(_looseConfig, 'bc1p…')
    getRunesBalances(_looseConfig, 'bc1p…')
    getBrc20Balances(_looseConfig, 'bc1p…')
    getAlkanesBalances(_looseConfig, 'bc1p…')
    getRecommendedFees(_looseConfig)
    getTransaction(_looseConfig, 'tx')
    broadcastTransaction(_looseConfig, '02…')
    sendBtc(_looseConfig, 'bc1q…', 1000)
    signPsbt(_looseConfig, 'psbt')
    signMessage(_looseConfig, 'hello')
    broadcastPsbt(_looseConfig, 'psbt')
  })
})
