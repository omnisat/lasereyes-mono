# Mental Model — `major-refactor`

This document captures the architectural intent behind the in-progress refactor on
the `major-refactor` branch. It exists so that, no matter what state the working
tree is in, we can recover the *shape* we're heading toward.

## TL;DR

We are porting **viem + wagmi + EIP-1193 + EIP-6963** to Bitcoin, specialized for
Bitcoin's address/PSBT/BIP-322 semantics.

The shift, in one line:

> **"objects-with-methods that mutate shared state" → "values + free functions
> composed through typed builders"**.

## Where we came from

The committed baseline (HEAD `0397a17`) was a textbook OO god-class architecture.

- **`LaserEyesClient`** (821 lines) eagerly instantiated 14 wallet provider
  classes, owned a `DataSourceManager` singleton, and exposed ~50 methods. Each
  method's pattern was: `lookup provider in $providerMap → try/catch on
  "not implemented" string`.
- **`WalletProvider`** (abstract base) held a backref to its parent
  `LaserEyesClient`, mutated the parent's nanostore, and called the singleton
  `DataSourceManager`. Tri-directional coupling: provider ↔ client ↔ data
  sources.
- **`DataSourceManager`** (635 lines, singleton) eagerly built mempool +
  sandshrew + maestro. Internal "find a source that implements this" fallback.
  `updateNetwork()` mutated internal state.
- **State** was a single flat `MapStore<LaserEyesStoreType>` with 11 fields:
  `provider`, `address`, `paymentAddress`, `publicKey`, `paymentPublicKey`,
  `balance`, `accounts`, `connected`, `isConnecting`, `isInitializing`,
  `hasProvider`.
- **Discovery** used a `MutationObserver` DOM-shake hack to detect when wallet
  injections appeared on `window`.
- **API style**: positional/options overloads, `error.message.includes('not
  implemented')` for capability discrimination, no type-level capabilities.

## Where we're going

Three independent axes, composed at runtime:

```
Chain          (value)        — the network identity
Transport      (capabilities) — how to talk to the chain (the data sources)
Wallet         (lifecycle)    — Connector → Adapter → BitcoinProvider
                                          → Account + Signer

Client       = Chain × Transport
WalletClient = Client × Account × Signer
Action       = (Client, args) → Promise<T>
Config       = Chain[] × Connector[] × Transport[][]   ← the wagmi-shaped registry
```

Every public symbol falls into exactly one of:
**chain, transport, connector, adapter, account, signer, client, action, config**.

No "manager". No "module". No "client god-class". That is the test for whether
something belongs in the public API.

## Inspirations, mapped

### viem — the typed client + actions layer

| viem | LaserEyes |
|---|---|
| `createClient({ transport, chain }).extend(actions)` | `createClient({ network, dataSource }).extend(actions)` |
| `createWalletClient({ account, transport })` | `createWalletClient({ account, dataSource, network })` |
| `publicActions()`, `walletActions()` factories | `publicActions()` / `walletBtcActions()`, `signingActions(signer)` |
| `fallback([alchemy(), infura()])` (transport-level) | `mergeDataSources(primary, secondary)` |
| `Client<Transport, Chain, Account, RpcSchema, Extended>` accumulating via `.extend()` | `Client<Config, dsMethods, clientActions>` accumulating via `.extend()` |
| `LocalAccount` / `JsonRpcAccount` | `WalletAccount` / `ReadOnlyAccount` |

### wagmi — the connector + config + state layer

| wagmi | LaserEyes |
|---|---|
| `createConfig({ chains, connectors, transports })` | `createLaserEyesConfig({ chains, connectors, transports })` |
| `Connector` interface | `Connector` interface (near-identical) |
| `CreateConnectorFn = (config) => Connector` | `CreateConnectorFn = (config) => Connector` |
| Reconnect-on-mount via storage | `autoReconnect` |
| `useConnectors()` listing announced wallets | `$connectors` MapStore |

### EIP-1193 — the provider standard

| EIP-1193 | LaserEyes |
|---|---|
| `provider.request({ method, params })` | `BitcoinProvider.request(method, params?)` (positional, see [Decisions](#decisions)) |
| `ProviderRpcError` | `ProviderRpcError` (same shape) |
| Events `accountsChanged`, `chainChanged`, `connect`, `disconnect` | Events `accountsChanged`, `networkChanged`, `connect`, `disconnect` |
| `eth_*` methods | `bitcoin_*` methods |

### EIP-6963 — the discovery protocol

| EIP-6963 | LaserEyes |
|---|---|
| `eip6963:announceProvider` / `eip6963:requestProvider` events | `bitcoin:announceProvider` / `bitcoin:requestProvider` events |
| `EIP6963ProviderInfo { uuid, name, icon, rdns } + provider` | `WalletAnnouncement { uuid, name, icon, rdns, provider }` |

### nanostores — the state model

Two stores in core, by different ownership:

- **`$connection`** — a single `MapStore<{ status, account, networkId, connector }>`.
  These four fields change together during connect / disconnect /
  network-switch, and a previous design with four separate atoms allowed
  subscribers to observe partial transitions (e.g. an `$account`
  subscriber reading `$networkId` before its `.set()` ran). Bundling
  them into one MapStore makes every connection update atomic — one
  `.set({...})` call, one subscriber notification, no in-between
  observation possible.
- **`$connectors`** — a `MapStore<Record<string, Connector>>` registry,
  keyed by connector `id`. Separate store because it changes for
  unrelated reasons (EIP-6963 announcements arrive over time; connect/
  disconnect doesn't touch it).

Mirrors wagmi's split: wagmi bundles `{chainId, connections, current,
status}` into one zustand store while keeping its connector registry as
a separate `createStore(...)`. Same architectural reasoning — atomicity
where fields share an update-time invariant; separate stores where
writers and subscriber granularity differ.

## Bitcoin-specific concessions

Things that aren't 1:1 with the EVM playbook because Bitcoin needs them:

1. **`AddressPurpose`** — Bitcoin wallets typically expose 2–3 addresses at once
   (payment / ordinals / taproot), each with its own derivation. `Account`
   exposes `getAddress(purpose)`, not just `getAddress()`.
2. **Adapters as a separate tier from connectors.** EVM doesn't need this — every
   EVM wallet is already EIP-1193. Bitcoin wallets aren't, yet, so we have a
   translation tier. Adapters are explicitly framed as deletable once wallets
   adopt the spec.
3. **Capability merge in `mergeDataSources`.** viem's `fallback` is *availability
   merge* (same RPC schema, different endpoints). Ours is *capability merge*:
   mempool can't return runes data, sandshrew can — so the merged data source
   exposes the union of method sets, with primary winning on overlap.
4. **PSBT-centric signing**, not transaction-centric. Signers return
   `{ psbtHex, psbtBase64, txId?, txHex? }`, not just a signature.
5. **BIP-322 vs ECDSA** for `signMessage`, surfaced via `protocol` option.
6. **Network IDs**, not chain IDs. We support `mainnet`, `testnet`, `testnet4`,
   `signet`, `fractal-mainnet`, `fractal-testnet`, `regtest`, plus
   `(string & {})` extension. There is no integer chain ID.

## Type discipline

The library is only as good as its inference. The whole `.extend()` pattern is
wasted if `client.sendBtc(...)` doesn't autocomplete and doesn't surface
"missing capability" errors at the right place. These rules exist to keep
inference clean as the surface grows.

### 1. Type-parameter discipline on `Client` / `WalletClient`

`Config` and `dsMethods` are **fixed at construction** (`createClient` /
`createWalletClient`) and **passed through `.extend()` unchanged**. Only
`clientActions` accumulates.

```ts
type Client<Config, dsMethods, clientActions>
  // dsMethods is locked at createClient()
  // clientActions grows with each .extend()
```

Mirror viem: `Client<transport, chain, account, rpcSchema, extended>` — only
`extended` grows.

### 2. Strict factory + strict action

Each action exists in two forms — a free function, and a method exposed
through a factory — and **both** carry the same precise generic
constraints.

**The action function declares its requirements:**
```ts
export async function sendBtc<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends { signPsbt: (...) => Promise<SignedPsbt> }
>(client: WalletClient<Config, WalletAccount, Actions, DS>, params: SendBtcParams): Promise<string>
```

**The factory's client parameter mirrors the same constraints:**
```ts
export function walletBtcActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction' | 'btcGetBalance'>,
    Actions extends { signPsbt: (...) => Promise<SignedPsbt> },
  >(client: WalletClient<Config, WalletAccount, Actions, DS>) => ({
    sendBtc: (params) => sendBtc(client, params),
    ...
  })
}
```

**Why both forms.** The free function is the canonical implementation —
it's the unit of testing and the unit of action authoring. The factory
gives the same function ergonomic surface as a client method.

**Ordering.** When one action group depends on another (e.g.
`walletBtcActions`'s `sendBtc` calls `signPsbt` from
`signingActions`), the dependent factory's constraint requires the
provider to already be on the client at extend time. This is enforced
at compile time: the user must extend dependencies first.

```ts
createWalletClient({...})
  .extend(signingActions(signer))   // provides signPsbt (compiles)
  .extend(walletBtcActions())       // requires signPsbt — OK
// vs
createWalletClient({...})
  .extend(walletBtcActions())       // ✗ compile error: signPsbt missing
  .extend(signingActions(signer))
```

This trades order-flexibility for compile-time guarantees about runtime
correctness. Order is documented at each factory.

### 3. `Prettify<T>` on every accumulated type

```ts
type Prettify<T> = { [K in keyof T]: T[K] } & {}
```

Apply at every `.extend()` return so hover types flatten. Without this, hover
shows `{} & PublicActions & WalletBtcActions & SigningActions` — unreadable.
With it, hover shows the merged record. Pure cosmetics, but the difference
between a library people reach for and one they avoid.

### 4. `extend`'s `TNew` is constrained

`TNew extends ActionGroup` (`Record<string, AnyFn>`). Catches `.extend(() => 42)`
at the source instead of producing a confusing client type downstream.

### 4a. The bare-client `clientActions` slot is `{}`, not `ActionGroup`

```ts
function createClient<dsMethods>(...): Client<..., dsMethods, {}>
function createWalletClient<dsMethods, TAccount>(...): WalletClient<..., {}, dsMethods>
```

A freshly-built client must have its `clientActions` slot typed as the
literal empty `{}`, **not** `ActionGroup`. Reason: `Client<..., ActionGroup>`
expands to `{ config, extend } & ActionGroup`, and `ActionGroup`'s index
signature `[k: string]: AnyFn` flows through the intersection — meaning
`client.frobnicate()` would silently typecheck on a bare client. That's a
type-safety regression we explicitly guard against in the contract:

```ts
// __tests__/type-inference.test-d.ts
// @ts-expect-error — frobnicate was never added by any factory
client.frobnicate()
```

If a future refactor widens the slot to `ActionGroup` "to make factories
type-check more easily," that contract assertion fires and the regression
is caught at PR time.

**The real fix for factory generic-instantiation** is in the factory
constraint itself — see §4b.

### 4b. `Client` and `WalletClient` are intersection types, not single object types

Both client types are written as **intersections of separate object types**,
not as a single `{ config, extend, …actions }` object literal:

```ts
// src/client/types.ts
export type Client<C, M, A> =
  & { config: C }
  & {
      extend<TNew extends ActionGroup>(
        factory: (client: Client<C, M, A>) => TNew
      ): Client<C, M, Prettify<A & TNew>>
    }
  & A

// src/client/wallet-types.ts
export type WalletClient<…> = Client<…> & {
  extend<TNew extends ActionGroup>(…): WalletClient<…>
}
```

This is **load-bearing for inner-generic factory inference**.

**The single-object-type case fails.** If `Client` is declared as a single
object type `{ config, extend } & A`, the `extend` method resolves through
TS's *single-property method resolution* path. When you call
`client.extend(factory)` with an inner-generic factory like:

```ts
function publicActions() {
  return <
    Config extends ClientConfig<DS>,
    DS extends BaseCapability,
    Actions extends ActionGroup,
  >(client: Client<Config, DS, Actions>) => ({ … })
}
```

…TS does **single-signature contextual instantiation**. The bare client's
`clientActions = {}` must directly satisfy `Actions extends ActionGroup`.
`{}` only satisfies `ActionGroup` *structurally* (vacuous index-sig
satisfaction), and the single-signature path doesn't accept that. Bail.
Error.

**The intersection-type case works.** When `extend` lives in its own
intersection arm — even if it's the only arm contributing a real `extend`
definition — TS resolves `client.extend` through its *intersection-property
method resolution* path, which synthesizes a call-signature merger across
arms. That puts TS into **overload-resolution mode**, which is more
lenient about contextual generic instantiation: `Actions = {}` binds via
the structural-compatibility path, and the unification succeeds.

**Why one arm triggers overload mode.** You don't need multiple `extend`
signatures to flip TS into overload-resolution; you just need the property
to live within an intersection structure. The intersection is what causes
TS to treat `extend` as an overload set even when only one arm contributes
a real definition. (This is a TS implementation detail, not documented
behavior — but it's stable and consistent across versions.)

**WalletClient was always fine** because `WalletClient = Client<…> & {
extend(…) }` is already an intersection, so its `extend` always resolved
through the lenient path. Splitting `Client` into the same shape gives it
the same lenient resolution.

**The contract guards this.** Tests under §4a in
`__tests__/type-inference.test-d.ts` extend `publicActions()`,
`runeActions()`, etc. on a sandshrew (broad-DS) client. If someone ever
collapses `Client` back into a single object literal, those tests fail at
the inner-generic factory call site.

**Why this matters.** It means we can use plain `Actions extends ActionGroup`
in every factory — no `| {}` widening, no constraint hacks. The fix lives
at the type definition level, not the factory level, and it solves the
issue uniformly for both `Client` and `WalletClient`.

This was discovered the hard way during Phase 3.

### 5. Capability hierarchy comes before action types

Capability interfaces are the contract between vendors and actions:

- `BaseCapability` — universal Bitcoin reads (mempool-tier)
- `OrdCapability` — ord indexer (sandshrew)
- `RuneCapability`, `Brc20Capability`, `AlkaneCapability`,
  `InscriptionCapability` — protocol-specific reads

Vendors declare exactly which they implement. Actions reference them via
`Pick<X, 'methodName'>` constraints. New protocols start with a new capability
interface, not by widening an existing one.

### 6. `Account` discipline

| Action category | Account constraint |
|---|---|
| Read-only (`getBalance`, `getUtxos`, `getTransaction`) | `A extends Account` |
| Build/write (`sendBtc`, anything constructing PSBTs) | `A extends WalletAccount` (needs pubkeys) |
| Signing (`signPsbt`, `signMessage`) | `A extends Account` (signer carries the cryptography) |

Stated once, applied uniformly across every action file.

### 7. Type-only sanity-check program

`packages/client/src/__tests__/type-inference.test-d.ts` is the
**type-level contract** for the package — chain definitions, account
factories, data-source `.extend()` accumulation, `mergeDataSources`
unions, vendor `createDataSource` return shapes, `createClient` and
`createWalletClient` inference and identity, the action factory
composition order, direct action-function call shapes, and `Signer`
interface details. Every assertion runs at TypeScript-compile time
(via `expectTypeOf` + `// @ts-expect-error`).

If a future change breaks the contract, `vitest typecheck` fails.

### 8. Maintenance discipline

**The contract file is binding.** Any change to a public type or
signature in this package must come with a corresponding update to
`packages/client/src/__tests__/type-inference.test-d.ts`. Specifically:

| Change | Required test update |
|---|---|
| New action factory or new method on a client | Add `expectTypeOf` for parameter and return types under the relevant `describe` block |
| Changed action signature (params / return) | Update the matching assertion |
| New ordering constraint | Add a `// @ts-expect-error` block encoding "wrong order is a compile error" |
| New negative case (account/capability/signer mismatch) | Add a `// @ts-expect-error` block |
| New vendor or capability interface | Add a vendor-factory return-shape check + a method-reachability check |
| New chain or `defineChain` change | Add a `chains` block assertion |
| New direct-callable action | Add a `Direct action calls` block exercising `(client, …args)` |

If the type system is the contract, the contract file is the
proof-carrying form. PRs that change types without updating it should
not land.

## Target package shapes

### `@omnisat/lasereyes-client` — typed primitives, no state, no wallet I/O

Concerns: chains, transports (data sources), accounts, signers, clients,
actions. Knows nothing about wallets, connectors, or global state.

```
src/
  data-source/
    create.ts          createChainDataSource
    merge.ts           mergeDataSources / fallback
  client/
    public.ts          createClient
    wallet.ts          createWalletClient
  account/
    wallet.ts          createWalletAccount
    readonly.ts        createReadOnlyAccount
    types.ts           Account, WalletAccount, AddressInfo, AddressPurpose
  signer/
    types.ts           Signer, SignedPsbt, SignPsbtOptions, SignMessageOptions
    from-provider.ts   providerSigner(provider)        ← the bridge to core
  actions/
    public/            getBalance, getUtxos, getTransaction, getFees,
                       broadcastTransaction, waitForTransaction
    wallet/            sendBtc, getBalance, getUtxos
    signing/           signPsbt, signMessage, broadcastPsbt
    runes/   brc20/   alkanes/   inscriptions/
  vendors/
    mempool/           baseCapabilities + createDataSource
    sandshrew/         baseCapabilities + ord + runes + brc20 + alkanes + inscriptions
    maestro/           baseCapabilities + brc20 + inscriptions + runes
  chains/              MAINNET, TESTNET, TESTNET4, SIGNET, FRACTAL_*, REGTEST,
                       defineChain()
  utils/               psbt-builders, address utils, conversions
  errors/              LaserEyesClientError, NetworkMismatchError, etc.
```

**Contract:** every action in `actions/` is `(client, ...args) => Promise<T>`.
Actions declare their requirements via generic constraints
(`dsMethods extends Pick<BaseCapability, 'btcGetBalance'>`,
`clientActions extends { signPsbt: ... }`). Call sites that don't `.extend()`
the right factories won't compile.

### `@omnisat/lasereyes-core` — stateful orchestrator (the wagmi layer)

Concerns: config, connectors, adapters, discovery, persistence, lifecycle
state. Composes a `WalletClient` on demand from the active connector + the
chain's configured transports.

```
src/
  config.ts            createLaserEyesConfig({
                         chains, connectors,
                         transports: { [chainId]: ChainDataSource[] },
                         storage, autoReconnect
                       })
  state.ts             $status, $account, $networkId, $connector, $connectors
                       (atoms only — no methods)
  wallet-client.ts     getWalletClient(config, opts?)   ← the keystone
  provider/
    types.ts           BitcoinProvider, ProviderRpcError, BitcoinRpcMethod,
                       ProviderCapabilities
  adapters/
    base.ts            BaseAdapter
    unisat.ts, xverse.ts, leather.ts, okx.ts, oyl.ts, magic-eden.ts, ...
  connectors/
    create.ts          createConnector(fn)     ← wagmi-style factory
    types.ts           Connector, ConnectorConfig
    injected.ts        injected({ target })    ← generalizes "window-based" wallets
    unisat.ts          unisat() = injected({...})
    xverse.ts          xverse() = injected({...})
  detection/
    announcements.ts   announceWallet, listenForWalletAnnouncements
    discovery.ts       discoverConnectors() — merges explicit + announced,
                       deduplicates by rdns
  actions/
    connect.ts         connect(config, { connector })
    disconnect.ts      disconnect(config)
    switchNetwork.ts   switchNetwork(config, networkId)
    getBalance.ts      provider-first read with client fallback
    sendBitcoin.ts     connector-only write
    signPsbt.ts        connector-only write
    signMessage.ts     connector-only write
  storage/
    create.ts          createStorage({ key, ... })   ← replaces inline localStorage
```

**Contract:** core never reaches into client internals. Every core wallet
write is `getWalletClient(config).<action>(...)`. Every core wallet read is
"try `connector.request(...)` first, fall back to a `Client` built from the
chain's transports."

## The keystone: `getClient` and `getWalletClient`

Two sibling functions in `packages/core/src/`. Both consult the same
per-config cache (`WeakMap<config, Map<chainId, Client>>`) and resolve
chain + data source the same way. They differ in what they *guarantee*:
`getClient` returns whatever's appropriate for the chain (read-only,
wallet-backed, or user-supplied); `getWalletClient` insists on a wallet
client and constructs one if the cache doesn't already hold it.

### Precedence — `getClient(config, options?)`

1. **Cache hit.** Return the cached client for the chainId.
2. **User-supplied `config.client` factory.** If set on
   `createLaserEyesConfig`, call it with `{ chain, dataSource }`, cache,
   return. Wins unconditionally — including when a wallet is connected
   (apps that explicitly supply a factory get exactly what they
   configured).
3. **Connector wallet client.** Populated at `connect()` time. When a
   wallet is connected on the active chain, `getClient` returns the
   wallet client (with connector overrides applied). For chains other
   than the wallet's current one, falls through to (4).
4. **Default bare client.** `createClient({ network, dataSource })`.

Synchronous. The wallet client gets pre-built asynchronously during
`connect()` and stored in the cache, so subsequent `getClient` calls
are cache hits.

### `getWalletClient(config, options?)`

Structurally `getClient + (maybe) buildConnectorClient`:

```ts
async function getWalletClient(config, options?) {
  const client = getClient(config, options)   // cache / factory / bare
  if (config.client || isWalletClientShape(client)) return client
  return buildConnectorClient(config, client) // adds account, signer, override
}
```

`buildConnectorClient` takes a bare client, adds account + signer +
optional connector `getClient` override, replaces the cache entry, and
returns the wallet client.

### Action layer ↔ override cascade

Every action — read or write — dispatches via `getAction`:

```ts
const client = getClient(config, options)
return getAction(client, baseFn, 'methodName')(...args)
```

- If a wallet is connected, the cache returns the wallet client, the
  connector's `getClient` overrides cascade through `getAction`, and
  the call hits the wallet's one-shot RPC (e.g. `bitcoin_sendBitcoin`).
- If not connected (or for a non-wallet chain), the cache returns the
  bare client, `getAction` falls through to the base action, and the
  call hits the data source.

Same call site, different runtime behavior — selected by what's in the
cache, not by branching at the action layer.

### Cache invalidation

- `connect()`: clear all entries, build new wallet client, cache.
- `disconnect()`: clear all entries.
- `switchNetwork`: clear the prior chain and the new chain.
- `networkChanged` event: clear prior + new chain entries.
- `accountsChanged` event: clear the current chain (account-bound client
  is now stale).

### Connector overrides via `injected({ nativeRpc })`

The `injected()` factory accepts a `nativeRpc` declaration listing which
methods in the proposed RPC spec the wallet supports natively:

```ts
unisat = () => injected({
  id: 'unisat',
  name: 'Unisat Wallet',
  getProvider: (w) => {
    const raw = (w as { unisat?: unknown }).unisat
    return raw ? new UnisatAdapter(raw) : null
  },
  nativeRpc: { sendBtc: true, getBalance: true },
})
```

For each declared method, the synthesized `getClient` adds an override
that:
1. Tries `provider.request('bitcoin_*', params)`.
2. On any failure, falls back to the base action via `getAction(client,
   baseFn, 'name')` — which resolves to the free function against the
   bare client closure (no recursion, no self-substitution).

The set of methods in `nativeRpc` (currently `sendBtc`, `broadcastPsbt`,
`getBalance`) corresponds to the entries in `BitcoinRpcMethod` for which
we expect wallets to provide native support. Until a formal Bitcoin RPC
spec exists, this set is our proposal — empirically chosen from what
wallets in the wild actually implement.

### Error model

`NetworkNotConfiguredError` (from `@omnisat/lasereyes-client`) is thrown
by `getClient` when the requested chain isn't in `config.chains`. It
propagates naturally through `getWalletClient` and every Phase 9
action. Apps catch it to prompt the user to switch chains or to surface
an "unsupported network" UI. Matches wagmi's `ChainNotConfiguredError`.

## Decisions

These are choices we're locking in to remove ambiguity:

1. **`request()` is positional**: `request(method: string, params?: object)`,
   matching EIP-1193's `request({ method, params })` re-cast for ergonomics
   in the Bitcoin context. All adapters and all call sites adopt this form.
2. **`Account` is the canonical account shape everywhere.** `$account` becomes
   `Atom<Account | undefined>`. `AddressInfo[]` is purely an internal detail
   of `Account.addresses`.
3. **`NetworkId` is a string. `ChainNetwork` is a value object.** Core stores
   the ID; client takes the object; the bridge is `config.chains` (a registry,
   like wagmi).
4. **Connector dedup by `rdns`.** Explicit connectors registered first,
   announced connectors deduplicated against them.
5. **No singletons.** `DataSourceManager` is gone. State lives in `config.state`,
   passed explicitly.
6. **No `error.message.includes(...)` capability checks.** Capabilities are
   typed (`getCapabilities()` returns `ProviderCapabilities`) and runtime
   capability misses throw `ProviderRpcError` with code `-32601`.
7. **Adapters are deletable.** When a wallet ships native `BitcoinProvider`
   support, its adapter file deletes; only its connector factory remains.

## Anti-goals

- **Not a kitchen sink.** The library is opinionated about composition; users
  who want to do something exotic compose lower-level primitives, not flags on
  a god-class.
- **Not stateful by default.** `@omnisat/lasereyes-client` is fully tree-shakable
  and stateless. State only enters when you opt into the core layer.
- **Not React-coupled.** React bindings are a thin nanostore subscription layer,
  not where logic lives. Vue/Solid/Svelte bindings should look almost identical.
- **Not opinionated about backends.** Vendors are first-class but pluggable.
  Anyone can publish a `@x/lasereyes-vendor-y` that exports capability factories
  and have it slot in via `mergeDataSources`.
