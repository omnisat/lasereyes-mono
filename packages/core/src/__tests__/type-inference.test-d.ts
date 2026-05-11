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
 *    union, transports record shape, and connectorFns tuple identity.
 * 7. **New action or changed action signature** — update §7 (Phase 9
 *    actions). Each action assertion captures: `<const config>` threading,
 *    parameter types, return type. `switchNetwork` is the showcase for
 *    per-arg narrowing; if any future action narrows args/return based
 *    on the threaded config, add a parallel showcase block.
 *
 * @module __tests__/type-inference
 */

import type { ChainDataSource, ChainNetwork, NetworkId } from '@omnisat/lasereyes-client'
import { MAINNET, ProviderErrorCode, ProviderRpcError, TESTNET4 } from '@omnisat/lasereyes-client'
import { createDataSource as createMempoolDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
import { createDataSource as createSandshrewDataSource } from '@omnisat/lasereyes-client/vendors/sandshrew'
import type { Account } from '@omnisat/lasereyes-client/wallet'
import { describe, expectTypeOf, it } from 'vitest'

// — Config + state —
import { createLaserEyesConfig, type NetworkTransports } from '../config'
import type { LaserEyesState } from '../state'
import type { Storage } from '../storage'

// — Phase 9 actions —
import {
  broadcastPsbt,
  broadcastTransaction,
  connect,
  type ConnectArgs,
  disconnect,
  dispose,
  getAddressUtxos,
  getAlkanesBalances,
  getBalance,
  getBrc20Balances,
  getClient,
  getInscriptions,
  getRecommendedFees,
  getRunesBalances,
  getTransaction,
  initialize,
  sendBitcoin,
  signMessage,
  signPsbt,
  switchNetwork,
} from '../actions'

// — Phase 10 keystone —
import { getWalletClient } from '../wallet-client'

// — Domain types referenced in action signatures —
import type {
  AlkaneBalance,
  Brc20Balance,
  FeeEstimate,
  Inscription,
  PaginatedResult,
  RuneBalance,
  Transaction,
  UTXO,
} from '@omnisat/lasereyes-client'
import type { SignedPsbt, SignMessageOptions, SignPsbtOptions } from '@omnisat/lasereyes-client/wallet'

// — Adapters (built-in) —
import { BaseAdapter, type BitcoinProviderAdapter } from '../adapters/base'
import { KeplrAdapter, loadKeplrWalletAdapter } from '../adapters/keplr'
import { LeatherAdapter, loadLeatherWalletAdapter } from '../adapters/leather'
import { MagicEdenAdapter, loadMagicEdenWalletAdapter } from '../adapters/magic-eden'
import { OkxAdapter, loadOkxWalletAdapter } from '../adapters/okx'
import { OpNetAdapter, loadOpNetWalletAdapter } from '../adapters/op-net'
import { OrangeAdapter, loadOrangeWalletAdapter } from '../adapters/orange'
import { OylAdapter, loadOylWalletAdapter } from '../adapters/oyl'
import { PhantomAdapter, loadPhantomWalletAdapter } from '../adapters/phantom'
import { SparrowAdapter, loadSparrowWalletAdapter } from '../adapters/sparrow'
import { TokeoAdapter, loadTokeoWalletAdapter } from '../adapters/tokeo'
import { loadUnisatWalletAdapter, UnisatAdapter } from '../adapters/unisat'
import { XverseAdapter } from '../adapters/xverse'

// — Connectors —
import { createConnector } from '../connectors/create'
import { injected, type InjectedConnectorTarget } from '../connectors/injected'
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

// — Connector + provider types —
import type {
  ConnectionStatus,
  Connector,
  ConnectorConfig,
  ConnectResult,
  CreateConnectorFn,
} from '../types/connector'
import type { BitcoinProvider, ProviderCapabilities } from '../types/provider'

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
declare const target: InjectedConnectorTarget
declare const config: ConnectorConfig
declare const c: Connector
declare const announcement: WalletAnnouncement
declare const switchNetworkFn: (networkId: NetworkId) => Promise<ChainNetwork>

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
    expectTypeOf(caps).toMatchTypeOf<{ [networkId: string]: { [methodName: string]: unknown } }>()
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

  it('unisatLike accepts Omit<InjectedConnectorTarget, "adapter">', () => {
    expectTypeOf(unisatLike)
      .parameter(0)
      .toEqualTypeOf<Omit<InjectedConnectorTarget, 'adapter'>>()
  })
})

// ============================================================================
// 4. Connector interface
// ============================================================================

describe('Connector interface', () => {
  it('connect() resolves to ConnectResult { account: Account, networkId: NetworkId }', () => {
    expectTypeOf(c.connect).returns.resolves.toEqualTypeOf<ConnectResult>()
    expectTypeOf<ConnectResult['account']>().toEqualTypeOf<Account>()
    expectTypeOf<ConnectResult['networkId']>().toEqualTypeOf<NetworkId>()
  })

  it('getAccount returns Account (singular, not AddressInfo[])', () => {
    expectTypeOf(c.getAccount).returns.toEqualTypeOf<Promise<Account>>()
  })

  it('getProvider returns BitcoinProvider | null', () => {
    expectTypeOf(c.getProvider).returns.toEqualTypeOf<BitcoinProvider | null>()
  })

  it('switchNetwork (optional) returns Promise<ChainNetwork>', () => {
    // The method is optional, so its type is `(...) => Promise<ChainNetwork> | undefined`.
    // We assert structural compatibility: a non-undefined switchNetwork has the right signature.
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
// Three threaded generics — `chains`, `transports`, `connectorFns` — preserve
// literal-typed information so Phase 10's keystone (`getWalletClient` /
// `getClient`) can hand callers a precisely-typed result on a per-chain
// basis. The default-generic case lets call sites that don't need precision
// pass `LaserEyesConfig` (no type args) directly.
// ============================================================================

// Module-level fixtures (declare's must live here, not inside `it()` bodies).
declare const memMainnet: ReturnType<typeof createMempoolDataSource>
declare const memTestnet4: ReturnType<typeof createMempoolDataSource>
declare const sandshrewMainnet: ReturnType<typeof createSandshrewDataSource>

describe('createLaserEyesConfig', () => {
  it('preserves the chains tuple as a literal-typed readonly tuple', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET, TESTNET4],
      transports: {
        mainnet: [memMainnet],
        testnet4: [memTestnet4],
      },
    })

    expectTypeOf<typeof config.chains>().toEqualTypeOf<
      readonly [typeof MAINNET, typeof TESTNET4]
    >()
  })

  it("transports keys are constrained to the chains' ID literals", () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET, TESTNET4],
      transports: {
        mainnet: [memMainnet],
        testnet4: [memTestnet4],
      },
    })

    type TransportKeys = keyof typeof config.transports
    expectTypeOf<TransportKeys>().toEqualTypeOf<'mainnet' | 'testnet4'>()
  })

  it('per-chain transport tuples preserve element identity', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      transports: {
        mainnet: [sandshrewMainnet, memMainnet],
      },
    })

    // The mainnet transports retain their element types in declared order.
    expectTypeOf<typeof config.transports.mainnet>().toEqualTypeOf<
      readonly [typeof sandshrewMainnet, typeof memMainnet]
    >()
  })

  it('connectorFns tuple preserves identity (each factory typed individually)', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      connectors: [unisat(), xverse()],
      transports: {
        mainnet: [memMainnet],
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
      transports: { mainnet: [memMainnet] },
    })

    expectTypeOf<typeof config.state>().toMatchTypeOf<LaserEyesState>()
    expectTypeOf<typeof config.storage>().toMatchTypeOf<Storage>()
    expectTypeOf<typeof config.connectors>().toMatchTypeOf<readonly Connector[]>()
    expectTypeOf<typeof config.autoReconnect>().toEqualTypeOf<boolean>()
  })

  it('connectors arg is optional (defaults to empty tuple)', () => {
    const config = createLaserEyesConfig({
      chains: [MAINNET],
      transports: { mainnet: [memMainnet] },
    })

    // The tuple is empty when no connectors are passed.
    expectTypeOf<typeof config.connectorFns>().toMatchTypeOf<readonly []>()
  })

  // NOTE: TS structural subtyping permits *extra* keys in `transports`
  // when inferred from a generic constraint position (`transports extends
  // NetworkTransports<chains>`). Only fresh-literal-to-named-type
  // assignment triggers excess-property checks. Extra transport keys are
  // harmless at runtime — `getClient(config, { chainId })` only reads the
  // key matching `chainId`. We don't test for a rejection that TS won't
  // produce.

  it('rejects transports missing a chain ID present in `chains`', () => {
    createLaserEyesConfig({
      chains: [MAINNET, TESTNET4],
      // @ts-expect-error — `transports` must include both 'mainnet' and 'testnet4'.
      transports: {
        mainnet: [memMainnet],
      },
    })
  })

  it('rejects an empty chains tuple at the type level', () => {
    // `chains` requires a non-empty readonly tuple. Verified via direct
    // assignability check (testing this at the call site is brittle —
    // TS reports the missing-transports error first and masks the chains
    // check).
    type EmptyChains = readonly []
    type ValidChains = readonly [ChainNetwork, ...ChainNetwork[]]
    expectTypeOf<EmptyChains extends ValidChains ? true : false>().toEqualTypeOf<false>()
  })

  // NOTE on the default-generic form:
  //
  // Earlier drafts of this contract included a test asserting that a typed
  // `LaserEyesConfig<chains, transports, connectorFns>` is assignable to
  // the default-generic `LaserEyesConfig` (no type args). That test failed
  // — and correctly so. The default-generic `transports` resolves to
  // `Record<NetworkId, readonly ChainDataSource<any>[]>` which requires
  // ALL 8 chain IDs as keys; a typed config with just `mainnet` + `testnet4`
  // doesn't satisfy that.
  //
  // wagmi has the same shape and handles it the same way: Phase 9 actions
  // are generic over the config (`<config extends LaserEyesConfig<any, any,
  // any>>(args: { config: config; ... })`) rather than taking the default-
  // generic form. The default-generic `LaserEyesConfig` is for hover /
  // documentation; it's not a parameter type that accepts arbitrary configs.
})

describe('NetworkTransports', () => {
  it('keys constrained by the chains tuple', () => {
    type T = NetworkTransports<readonly [typeof MAINNET, typeof TESTNET4]>
    expectTypeOf<keyof T>().toEqualTypeOf<'mainnet' | 'testnet4'>()
  })

  it('values are readonly arrays of ChainDataSource', () => {
    type T = NetworkTransports<readonly [typeof MAINNET]>
    expectTypeOf<T['mainnet']>().toMatchTypeOf<readonly ChainDataSource<any>[]>()
  })

  it('default generic permits any chain ID', () => {
    // The default param `readonly [ChainNetwork, ...ChainNetwork[]]` makes
    // keys typed as `NetworkId` (the open string union), so a permissive
    // call site doesn't need to thread chains through.
    type Default = NetworkTransports
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
declare const memMain: ReturnType<typeof createMempoolDataSource>
declare const memT4: ReturnType<typeof createMempoolDataSource>

// A precisely-typed config used for narrowing tests.
const _typedConfig = createLaserEyesConfig({
  chains: [MAINNET, TESTNET4],
  transports: {
    mainnet: [memMain],
    testnet4: [memT4],
  },
})

// A loosely-typed config used to verify the default-generic `LaserEyesConfig`
// shape is still accepted by every action (regression guard).
declare const _looseConfig: ReturnType<typeof createLaserEyesConfig>

describe('Phase 9 — Lifecycle actions', () => {
  it('initialize: (config) => Promise<void>', () => {
    expectTypeOf(initialize).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(initialize(_typedConfig)).resolves.toEqualTypeOf<void>()
  })

  it('dispose: (config) => void (sync)', () => {
    expectTypeOf(dispose).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(dispose(_typedConfig)).toEqualTypeOf<void>()
  })

  it('connect: (config, { connectorId }) => Promise<ConnectResult>', () => {
    expectTypeOf(connect).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(connect).parameter(1).toEqualTypeOf<ConnectArgs>()
    expectTypeOf<ConnectArgs>().toEqualTypeOf<{ connectorId: string }>()
    expectTypeOf(connect(_typedConfig, { connectorId: 'unisat' })).resolves.toMatchTypeOf<{
      account: Account
      networkId: NetworkId
    }>()
  })

  it('disconnect: (config) => Promise<void>', () => {
    expectTypeOf(disconnect).parameter(0).toMatchTypeOf<typeof _typedConfig>()
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
    const { getBalance: clientGetBalance } = await import('@omnisat/lasereyes-client')
    expectTypeOf(clientGetBalance(client, 'bc1q…')).resolves.toEqualTypeOf<string>()
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
    // Bare wallet client: `config` carries account + signer + network + dataSource.
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
    const { signingActions, walletBtcActions } = await import('@omnisat/lasereyes-client/wallet')
    const extended = wc.extend(signingActions()).extend(walletBtcActions())
    expectTypeOf(extended.sendBtc).toMatchTypeOf<Function>()
  })
})

describe('Phase 9 — Read actions (provider-first, client-fallback)', () => {
  it('getBalance: (config, address) => Promise<string>', () => {
    expectTypeOf(getBalance).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getBalance).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getBalance(_typedConfig, 'bc1q…')).resolves.toEqualTypeOf<string>()
  })

  it('getAddressUtxos: (config, address) => Promise<PaginatedResult<UTXO>>', () => {
    expectTypeOf(getAddressUtxos).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getAddressUtxos).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getAddressUtxos(_typedConfig, 'bc1q…')).resolves.toEqualTypeOf<
      PaginatedResult<UTXO>
    >()
  })
})

describe('Phase 9 — Read actions (provider-only protocol reads)', () => {
  it('getInscriptions: (config, address, options?) => Promise<Inscription[]>', () => {
    expectTypeOf(getInscriptions).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getInscriptions).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getInscriptions).parameter(2).toEqualTypeOf<
      { offset?: number; limit?: number } | undefined
    >()
    expectTypeOf(getInscriptions(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<
      Inscription[]
    >()
  })

  it('getRunesBalances: (config, address) => Promise<RuneBalance[]>', () => {
    expectTypeOf(getRunesBalances).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getRunesBalances).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getRunesBalances(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<
      RuneBalance[]
    >()
  })

  it('getBrc20Balances: (config, address) => Promise<Brc20Balance[]>', () => {
    expectTypeOf(getBrc20Balances).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getBrc20Balances).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getBrc20Balances(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<
      Brc20Balance[]
    >()
  })

  it('getAlkanesBalances: (config, address) => Promise<AlkaneBalance[]>', () => {
    expectTypeOf(getAlkanesBalances).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getAlkanesBalances).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getAlkanesBalances(_typedConfig, 'bc1p…')).resolves.toEqualTypeOf<
      AlkaneBalance[]
    >()
  })
})

describe('Phase 9 — Read actions (client-only)', () => {
  it('getRecommendedFees: (config, options?) => Promise<FeeEstimate>', () => {
    expectTypeOf(getRecommendedFees).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getRecommendedFees(_typedConfig)).resolves.toEqualTypeOf<FeeEstimate>()
    // Optional chainId, narrowed to config chains
    expectTypeOf(
      getRecommendedFees(_typedConfig, { chainId: 'mainnet' })
    ).resolves.toEqualTypeOf<FeeEstimate>()
  })

  it('getTransaction: (config, txId, options?) => Promise<Transaction>', () => {
    expectTypeOf(getTransaction).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(getTransaction).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(getTransaction(_typedConfig, 'abc…')).resolves.toEqualTypeOf<Transaction>()
    expectTypeOf(
      getTransaction(_typedConfig, 'abc…', { chainId: 'testnet4' })
    ).resolves.toEqualTypeOf<Transaction>()
  })

  it('broadcastTransaction: (config, rawTx, options?) => Promise<string>', () => {
    expectTypeOf(broadcastTransaction).parameter(0).toMatchTypeOf<typeof _typedConfig>()
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
  it('sendBitcoin: (config, to, amount) => Promise<string>', () => {
    expectTypeOf(sendBitcoin).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(sendBitcoin).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(sendBitcoin).parameter(2).toEqualTypeOf<number>()
    expectTypeOf(sendBitcoin(_typedConfig, 'bc1q…', 10000)).resolves.toEqualTypeOf<string>()
  })

  it('signPsbt: (config, psbt, options?) => Promise<SignedPsbt>', () => {
    expectTypeOf(signPsbt).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(signPsbt).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(signPsbt).parameter(2).toEqualTypeOf<SignPsbtOptions | undefined>()
    expectTypeOf(signPsbt(_typedConfig, 'psbthex')).resolves.toEqualTypeOf<SignedPsbt>()
  })

  it('signMessage: (config, message, options?) => Promise<string>', () => {
    expectTypeOf(signMessage).parameter(0).toMatchTypeOf<typeof _typedConfig>()
    expectTypeOf(signMessage).parameter(1).toEqualTypeOf<string>()
    expectTypeOf(signMessage).parameter(2).toEqualTypeOf<SignMessageOptions | undefined>()
    expectTypeOf(signMessage(_typedConfig, 'hello')).resolves.toEqualTypeOf<string>()
  })

  it('broadcastPsbt: (config, psbt) => Promise<string>', () => {
    expectTypeOf(broadcastPsbt).parameter(0).toMatchTypeOf<typeof _typedConfig>()
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
    getBalance(_typedConfig, 'bc1q…')
    getAddressUtxos(_typedConfig, 'bc1q…')
    getInscriptions(_typedConfig, 'bc1p…')
    getRunesBalances(_typedConfig, 'bc1p…')
    getBrc20Balances(_typedConfig, 'bc1p…')
    getAlkanesBalances(_typedConfig, 'bc1p…')
    getRecommendedFees(_typedConfig)
    getTransaction(_typedConfig, 'tx')
    broadcastTransaction(_typedConfig, '02…')
    sendBitcoin(_typedConfig, 'bc1q…', 1000)
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
    getBalance(_looseConfig, 'bc1q…')
    getAddressUtxos(_looseConfig, 'bc1q…')
    getInscriptions(_looseConfig, 'bc1p…')
    getRunesBalances(_looseConfig, 'bc1p…')
    getBrc20Balances(_looseConfig, 'bc1p…')
    getAlkanesBalances(_looseConfig, 'bc1p…')
    getRecommendedFees(_looseConfig)
    getTransaction(_looseConfig, 'tx')
    broadcastTransaction(_looseConfig, '02…')
    sendBitcoin(_looseConfig, 'bc1q…', 1000)
    signPsbt(_looseConfig, 'psbt')
    signMessage(_looseConfig, 'hello')
    broadcastPsbt(_looseConfig, 'psbt')
  })
})
