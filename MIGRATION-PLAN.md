# Migration Plan — One Fell Swoop to the Target Shape

**Revert point:** `f656782` (`checkpoint: in-progress refactor toward viem+wagmi-shaped architecture`)
**Target architecture:** see [`MENTAL-MODEL.md`](./MENTAL-MODEL.md)

We are explicitly **not** preserving compilability between phases. The goal is to
land at the target shape in one coherent push, and only then make the tree green.
Each phase is sized to be a single mental commit; we'll commit at the boundaries
so the history is auditable, but no phase needs to typecheck mid-flight except
the last one.

The plan is **leaf-first**: build the lowest-coupling primitives first, then the
layers that compose them, then the orchestrator, then green-up. This minimizes
churn — by the time we reach the keystone (`getWalletClient`) every type it
needs already exists in its final form.

---

## Phase 0 — Foundations (chains, types, errors)

These have zero dependencies on anything else and unblock the rest.

### 0.1 Restructure `client/src/chains/`
- Move `client/src/types/network.ts` → `client/src/chains/index.ts`
- Add `defineChain()` helper (object-typed; same shape as the existing constants)
- Export individual chain constants and the `NETWORKS` registry
- `NetworkId` and `NetworkType` stay as types, exported from `chains/`

### 0.2 Settle the `Signer` / signing types
- Audit `client/src/types/signer.ts` — reconcile the two `SignedPsbt` shapes
  (client's `{ psbt, txHex }` vs adapter's `{ psbtHex, psbtBase64, txId?, txHex? }`)
- Adopt the adapter's richer shape as canonical: `{ psbtHex, psbtBase64, txId?, txHex? }`
- `Signer.signPsbt` returns the canonical shape; `signMessage` returns `string`
- Move to `client/src/signer/types.ts`

### 0.3 Settle errors
- Keep `client/src/errors.ts` as the single source of error classes
- Add `ProviderRpcError` here too (currently in `core/src/types/provider.ts`) —
  errors are values, not state, so they belong in client
- Re-export from core's provider types

### 0.4 Settle `Account` types
- `client/src/account/types.ts`: `AddressInfo`, `AddressPurpose`, `Account`, `WalletAccount`
- This is already where they live — just confirm shape matches what the rest of
  the plan will consume
- `Account.addresses: AddressInfo[]`, `Account.getAddress(purpose?)`
- `WalletAccount extends Account` with `publicKeys` and `getPublicKey(purpose?)`

**Commit:** `refactor(client): consolidate chains, signer types, account types, errors`

---

## Phase 1 — Data sources (transports)

Restore the vendor capability factories that were deleted, in the new shape.

### 1.1 Reorganize the data-source primitives
- Move `client/src/data-source.ts` → `client/src/data-source/create.ts` (createChainDataSource) and `client/src/data-source/merge.ts` (mergeDataSources)
- Re-export from `client/src/data-source/index.ts`

### 1.2 Restore `vendors/sandshrew/`
- `vendors/sandshrew/config.ts` — `SandshrewConfig` type, default URLs, key constants
- `vendors/sandshrew/rpc.ts` — internal JSON-RPC helper
- `vendors/sandshrew/base.ts` — `baseCapabilities()` factory implementing `BaseCapability`
- `vendors/sandshrew/ord.ts` — `ordCapabilities()` factory implementing `OrdCapability`
- `vendors/sandshrew/runes.ts` — `runeCapabilities()` factory
- `vendors/sandshrew/inscriptions.ts` — `inscriptionCapabilities()` factory
- `vendors/sandshrew/alkanes.ts` — `alkaneCapabilities()` factory
- `vendors/sandshrew/index.ts` — `createDataSource(config)` returning a fully-extended chain data source, plus barrel re-exports of individual factories
- Port from the deleted files (still recoverable via `git show 0397a17:...`)

### 1.3 Restore `vendors/maestro/`
- Same structure: `config.ts`, `base.ts`, `brc20.ts`, `inscriptions.ts`, `runes.ts`, `index.ts`

### 1.4 Confirm `vendors/mempool/`
- Already in place; just update imports to match new chains/ location

### 1.5 Capabilities — define the contracts each vendor satisfies
- Move `client/src/types/capabilities.ts` → `client/src/data-source/capabilities.ts`
- Add: `RuneCapability`, `Brc20Capability`, `AlkaneCapability`, `InscriptionCapability` (the type stubs that match the action shapes we'll build in Phase 3)
- These belong in the data-source folder because they describe what data sources expose, not what clients expose

**Commit:** `refactor(client): restore sandshrew/maestro vendors as capability factories`

---

## Phase 2 — Client and wallet client

The builders are mostly right; this phase mostly polishes naming and consolidates.

### 2.1 Move builders into `client/src/client/`
- `client/src/client.ts` → `client/src/client/public.ts` (export `createClient`)
- `client/src/wallet-client.ts` → `client/src/client/wallet.ts` (export `createWalletClient`)
- `client/src/types/client.ts` → `client/src/client/types.ts` (`Client`, `ClientConfig`)
- `client/src/types/wallet-client.ts` → `client/src/client/wallet-types.ts` (`WalletClient`, `WalletClientConfig`)
- `client/src/client/index.ts` re-exports everything

**Commit:** `refactor(client): co-locate client builders and types under client/`

---

## Phase 2.5 — Type-ergonomics design

The library is only as good as its inference. This phase fixes the issues we
identified in the current `Client` / `WalletClient` / action-factory shapes
*before* we encode them into 30+ action files in Phase 3. See
[`MENTAL-MODEL.md` § Type discipline](./MENTAL-MODEL.md#type-discipline) for
the full rationale.

### 2.5.1 Constrain `extend`'s `TNew`

In `Client.extend` and `WalletClient.extend`:

```ts
extend<TNew extends ActionGroup>(
  factory: (client: ...) => TNew
): Client<...>
```

Catches `.extend(() => 42)` at the source.

### 2.5.2 Lock the type-parameter discipline

- `Client<Config, dsMethods, clientActions>`: `Config` and `dsMethods` are
  fixed at `createClient()` time and **passed through `.extend()` unchanged**.
  Only `clientActions` accumulates.
- `WalletClient<Config, TAccount, clientActions, dsMethods>`: same — `Config`,
  `TAccount`, and `dsMethods` fixed at `createWalletClient()` time. Only
  `clientActions` grows.
- Audit `extend`'s return signature in both files; ensure no unintended widening.

### 2.5.3 Add `Prettify<T>` and apply at every accumulation point

Add to `client/src/types/utils.ts` (new file):

```ts
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
```

Apply in `Client.extend`'s return:
```ts
extend<TNew extends ActionGroup>(...): Client<Config, dsMethods, Prettify<clientActions & TNew>>
```

And the same in `WalletClient.extend`. Verify hover quality on a sample
`client.sendBtc` after composition.

### 2.5.4 Strict factory + strict action

Each action gets two forms — a free function and a factory method — and
**both** carry the same generic constraints. This makes the action
function directly callable for tests/composition, and makes the
`.extend()` site fail at compile time if the client lacks what the
action needs.

```ts
// Strict action: declares its real requirements.
export async function sendBtc<
  Config extends WalletClientConfig<WalletAccount, DS>,
  DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction'>,
  Actions extends { signPsbt: (psbt: string, opts?: SignPsbtOptions) => Promise<SignedPsbt> }
>(client: WalletClient<Config, WalletAccount, Actions, DS>, params: SendBtcParams): Promise<string> { ... }

// Strict factory: mirrors the action's constraints on its client parameter.
export function walletBtcActions() {
  return <
    Config extends WalletClientConfig<WalletAccount, DS>,
    DS extends Pick<BaseCapability, 'btcGetAddressUtxos' | 'btcBroadcastTransaction' | 'btcGetBalance'>,
    Actions extends { signPsbt: (psbt: string, opts?: SignPsbtOptions) => Promise<SignedPsbt> },
  >(client: WalletClient<Config, WalletAccount, Actions, DS>) => ({
    sendBtc: (params: SendBtcParams) => sendBtc(client, params),
    getBalance: () => getBalance(client),
    getUtxos: (purpose?: AddressPurpose) => getUtxos(client, purpose),
  })
}
```

**Ordering.** When one action group depends on another, the dependent
factory's constraint forces the user to extend the provider first — at
compile time. The natural order is: data → signing → BTC → protocol.
Documented at each factory.

Apply this pattern uniformly. Same treatment for `signingActions(signer)`,
`publicActions()`, and the four protocol action factories scaffolded in
Phase 3.

### 2.5.5 Define the capability hierarchy

Create the missing capability interfaces in
`client/src/data-source/capabilities.ts`:

- `BaseCapability` — already exists (mempool-tier)
- `OrdCapability` — already exists (sandshrew ord)
- `RuneCapability` — new: declare the methods rune actions need
- `Brc20Capability` — new
- `AlkaneCapability` — new
- `InscriptionCapability` — new

These are the contract between vendors and actions. Vendor capability factories
(restored in Phase 1) will now have a typed contract to satisfy. Action
constraints will reference these via `Pick`.

We sketch the *shape* here even though Phase 3 is where we wire actions to
them — the goal is to lock in capability names and signatures up front so we
don't churn on naming during Phase 3.

### 2.5.6 Fix the `Account` discipline

Audit existing actions and align with the rule:
- Read-only actions (`getBalance`, `getUtxos`, `getTransaction`): `A extends Account`
- Build/write actions (`sendBtc`, PSBT constructors): `A extends WalletAccount`
- Signing actions (`signPsbt`, `signMessage`): `A extends Account` (signer holds the keys)

Apply consistently in the existing `wallet-btc.ts` and `wallet-signing.ts`
before Phase 3 expands the action surface.

### 2.5.7 Build the type-only sanity-check program

`packages/client/src/__tests__/type-inference.test-d.ts`:

```ts
import { expectTypeOf } from 'vitest'
// or use `tsd` — pick one; sticking with vitest's expectTypeOf for now
// since we're already on vitest

import { MAINNET, createChainDataSource, createClient, ... }

// 1. Build a data source with mempool base + (mocked) sandshrew rune capability
// 2. Build a wallet client extended with all action groups
// 3. Verify .sendBtc, .signPsbt, .getRuneBalances all exist and type correctly
// 4. Verify a client missing a capability fails to .extend(runeActions())
//    (use @ts-expect-error to assert the failure)
```

This file becomes the contract. If a future change breaks it, the type system
catches the regression at PR time, not at usage time. Run it as part of `pnpm
test` in CI.

**Commit:** `refactor(client): type-ergonomics — Prettify, permissive factories, capability hierarchy`

---

## Phase 3 — Actions (the meat of the client surface)

Restore actions in the structure described in MENTAL-MODEL.md.

### 3.1 `actions/public/` (read-only, no account required)
- Restore `publicActions()` factory (formerly `btcActions()`)
- Free functions: `getBalance`, `getUtxos`, `getTransaction`, `getFees`, `broadcastTransaction`, `waitForTransaction`, `getOutputValue`
- Each typed with `dsMethods extends Pick<BaseCapability, ...>` so they only compile against a client whose data source actually has those methods

### 3.2 `actions/wallet/` (account-aware writes)
- Already largely done as `walletBtcActions()` — keep, move to `actions/wallet/`
- `sendBtc`, `getBalance` (account-aware), `getUtxos` (account-aware)

### 3.3 `actions/signing/` (signer-backed)
- Already done as `signingActions(signer)` — keep, move to `actions/signing/`
- `signPsbt`, `signMessage`, plus new: `broadcastPsbt(client)` (uses `signer.signPsbt({finalize:true})` then `client.config.dataSource.btcBroadcastTransaction(...)`)

### 3.4 `actions/runes/`, `actions/brc20/`, `actions/alkanes/`, `actions/inscriptions/`
- Each gets:
  - A read action factory that requires the matching capability on the data source
  - A write action factory that requires both the data source capability *and* signing actions
  - For now, scaffold the function signatures and stub `throw new Error('not implemented')` bodies — implementation deferred but the type surface is final
- This locks in the public API even though the bodies aren't done

### 3.5 Consolidate `client/src/index.ts` and `client/src/wallet.ts` subpath exports
- `@omnisat/lasereyes-client` (main): chains, errors, `createClient`, `createChainDataSource`, `mergeDataSources`, public types, `publicActions`
- `@omnisat/lasereyes-client/wallet`: account factories, `createWalletClient`, `walletBtcActions`, `signingActions`, plus signer/account types
- `@omnisat/lasereyes-client/runes` (and brc20/alkanes/inscriptions): the protocol action factories
- `@omnisat/lasereyes-client/backends/mempool` (and sandshrew/maestro): vendor entrypoints
- `@omnisat/lasereyes-client/utils`: PSBT builders, address utilities

**Commit:** `refactor(client): introduce public/wallet/signing/protocol action groups`

---

## Phase 4 — Provider standard (in core)

Lock in the EIP-1193-shaped provider interface.

### 4.1 Settle `request()` calling convention
- **Decision:** positional `request(method: string, params?: object): Promise<unknown>`
- Update `core/src/types/provider.ts` to match
- Update `BaseAdapter.request` signature
- Update `UnisatAdapter.request` (already positional — confirm)
- Update `XverseAdapter.request` (currently object form — fix; also remove the dangling `RequestArguments` import)
- Update all call sites:
  - `core/src/core.ts::createConnectorFromAnnouncement` — switch to positional
  - `core/src/actions/data.ts::tryProvider` — switch to positional
  - `core/src/actions/wallet.ts` — already positional, confirm

### 4.2 Move `ProviderRpcError` to client
- Already noted in Phase 0.3 — finalize the cross-package import here

**Commit:** `refactor(core): standardize BitcoinProvider.request as positional (EIP-1193 style)`

---

## Phase 5 — Adapters

Beyond the existing unisat + xverse, port the deleted providers into the adapter shape.

### 5.1 Verify `BaseAdapter` is final
- `request(method, params?)` positional
- `buildCapabilities(): ProviderCapabilities` — abstract
- Event delegation through `on`/`removeListener`
- Helper `createError(code, message, data?)` returning `ProviderRpcError`

### 5.2 Bring back the deleted wallet adapters
- For each of: `leather`, `okx`, `oyl`, `magic-eden`, `phantom`, `wizz`, `orange`, `op-net`, `sparrow`, `tokeo`, `keplr`, `binance`
- Port from the deleted `core/src/client/providers/<name>.ts` to `core/src/adapters/<name>.ts`
- Each adapter:
  - Extends `BaseAdapter`
  - Implements `request(method, params?)` with `switch(method)` dispatch
  - Implements `buildCapabilities()` with the per-network capability matrix
  - Has a `loadXxxWalletAdapter()` function that detects, instantiates, and `announceWallet()`s
- Some of these (binance, wizz) currently work via the unisat-compatible API; they can be parameterized variants of the unisat adapter

### 5.3 `core/src/adapters/index.ts`
- Barrel re-export each adapter and loader
- Plus `loadAllWallets()` in `detection/helpers.ts`

**Commit:** `feat(core): port all wallet adapters to BaseAdapter shape`

---

## Phase 6 — Connectors

Reshape connectors to the wagmi-style factory pattern, dedup the dual model.

### 6.1 Introduce `createConnector()` factory
- `core/src/connectors/create.ts`:
  ```ts
  export type CreateConnectorFn = (config: ConnectorConfig) => Connector
  export function createConnector(fn: CreateConnectorFn): CreateConnectorFn { return fn }
  ```
- Pattern matches wagmi exactly — the function is itself the factory; `createConnector` just provides a typed identity for ergonomics.

### 6.2 Build `injected({ target })` as the generic injected-wallet connector
- `core/src/connectors/injected.ts`
- Takes a `Target = { id, name, icon?, rdns?, getProvider(window) => unknown | null }`
- Returns a connector that:
  - Calls `target.getProvider(window)` to find the raw injection
  - Wraps it in the appropriate adapter (passed via target or auto-detected from rdns)
  - Implements full `Connector` lifecycle
- This generalizes the existing `unisatLikeConnector` to all injected wallets

### 6.3 Replace `BaseConnector` class with the factory output
- The class form is fine but inconsistent with the wagmi pattern; convert to a factory that returns a `Connector` object
- All wallet-specific connectors become one-liners: `unisat() = injected({ target: { id: 'unisat', adapter: UnisatAdapter, getProvider: w => w.unisat } })`

### 6.4 Settle `Connector` interface against `Account` shape
- `Connector.getAccount(): Promise<Account>` (singular, returns full `Account` object)
- `Connector.onAccountChanged(account: Account): void` (singular)
- `Connector.connect(): Promise<{ account: Account; networkId: NetworkId }>`

### 6.5 Per-wallet connector exports
- `core/src/connectors/{unisat,xverse,leather,okx,...}.ts` — each one a thin `injected({...})` call
- `core/src/connectors/index.ts` — barrel

**Commit:** `refactor(core): unify connector model around createConnector + injected factory`

---

## Phase 7 — Discovery

Reconcile explicit + announcement-based connector registration.

### 7.1 Keep `announcements.ts` as-is
- The EIP-6963 announce/listen primitive doesn't need changes

### 7.2 New `detection/discovery.ts`
- `discoverConnectors({ explicit, announced }) => Map<id, Connector>`
- Dedup rule: explicit connectors win on `rdns` collision; announced connectors that match an explicit `rdns` are dropped
- Connectors discovered only via announcement get a synthesized `Connector` object built around the announced provider (the existing `createConnectorFromAnnouncement` logic, but properly typed and matching the new `Connector` interface)

### 7.3 Loaders unchanged
- `loadUnisatWalletAdapter()` etc. continue to fire announcements on import
- `loadAllWallets()` continues to import all loaders for convenience

**Commit:** `refactor(core): unify explicit and announced connector discovery`

---

## Phase 8 — Config (the wagmi-shaped registry)

Collapse `LaserEyesCore` (the class) into `createLaserEyesConfig` (a factory) + state atoms + free actions.

### 8.1 Extract state atoms
- `core/src/state.ts`:
  ```ts
  export interface LaserEyesState {
    $status: WritableAtom<ConnectionStatus>
    $account: WritableAtom<Account | undefined>
    $networkId: WritableAtom<NetworkId>
    $connector: WritableAtom<Connector | undefined>
    $connectors: MapStore<Record<string, Connector>>
  }
  export function createState(initialNetworkId: NetworkId): LaserEyesState { ... }
  ```

### 8.2 Define `LaserEyesConfig`
- `core/src/config.ts`:
  ```ts
  export interface LaserEyesConfig {
    chains: ChainNetwork[]
    connectors: Connector[]
    transports: Record<NetworkId, ChainDataSource<any>[]>
    state: LaserEyesState
    storage: Storage
    appName?: string
    appIcon?: string
    autoReconnect: boolean
  }

  export function createLaserEyesConfig(opts: {
    chains: ChainNetwork[]
    connectors: CreateConnectorFn[]
    transports: Record<NetworkId, ChainDataSource<any>[]>
    storage?: Storage
    appName?: string
    appIcon?: string
    autoReconnect?: boolean
  }): LaserEyesConfig
  ```
- The factory:
  - Builds `state` from the default chain
  - Instantiates each `CreateConnectorFn` against a `ConnectorConfig` derived from the args
  - Registers connectors into `state.$connectors`
  - Sets up announcement listening (returns a cleanup hook on the config? or implicit via storage/init action — TBD; lean toward explicit `initialize(config)` action)

### 8.3 Storage abstraction
- `core/src/storage/create.ts` — `createStorage({ key })` returning `{ getItem, setItem, removeItem }`
- Default implementation wraps localStorage
- Used by auto-reconnect

### 8.4 Delete `LaserEyesCore` class
- `core.ts` is gone. State and registry live in the `LaserEyesConfig` value;
  every operation is a free function over that config.

**Commit:** `refactor(core): replace LaserEyesCore class with createLaserEyesConfig + state`

---

## Phase 9 — Core actions (free functions over config)

All operations move to `core/src/actions/` as `(config, args) => Promise<T>`.

### 9.1 Lifecycle actions
- `core/src/actions/initialize.ts` — sets up announcement listening, runs auto-reconnect
- `core/src/actions/dispose.ts` — cleanup
- `core/src/actions/connect.ts` — `connect(config, { connectorId })`
- `core/src/actions/disconnect.ts` — `disconnect(config)`
- `core/src/actions/switchNetwork.ts` — `switchNetwork(config, networkId)`

### 9.2 Read actions (provider-first, client-fallback)
- `core/src/actions/getBalance.ts` — try `connector.request('bitcoin_getBalance', ...)`, fall back to `getClient(config).getBalance(...)`
- Same pattern for `getUtxos`, `getInscriptions`, `getRunesBalances`, `getBrc20Balances`, `getAlkanesBalances`
- Shared helper: `tryProvider(config, method, params)`

### 9.3 Read actions (client-only)
- `getRecommendedFees`, `getTransaction`, `broadcastTransaction` — straight to `getClient(config)`

### 9.4 Write actions (via wallet client)
- `core/src/actions/sendBitcoin.ts`, `signPsbt.ts`, `signMessage.ts`, `broadcastPsbt.ts`
- Each becomes a one-liner: `await getWalletClient(config).sendBtc(...)`

**Commit:** `feat(core): free-function actions over LaserEyesConfig`

---

## Phase 10 — The keystone: `getWalletClient`

This is the bridge between core (state) and client (types).

### 10.1 `core/src/wallet-client.ts`
```ts
export async function getWalletClient(
  config: LaserEyesConfig,
  options?: { chainId?: NetworkId }
): Promise<WalletClient<...>>
```
- Reads `$connector` from state
- Calls `connector.getAccount()` → `Account`
- Looks up `chain` from `config.chains` by id
- Builds the merged data source via `config.transports[chainId].reduceRight(mergeDataSources)`
- Builds a `Signer` via `providerSigner(connector.getProvider())`
- Returns `createWalletClient({ network, dataSource, account }).extend(walletBtcActions()).extend(signingActions(signer))`

### 10.2 `core/src/client.ts`
- Sibling: `getClient(config, { chainId? })` for read-only access without an active connector
- Same pattern, just `createClient(...).extend(publicActions())`
- Caches per chain (the existing `Map<NetworkId, Client>` cache — but lives in config now, not on a class)

### 10.3 `client/src/signer/from-provider.ts`
- `providerSigner(provider: BitcoinProvider | null): Signer`
- Wraps the provider's `request('bitcoin_signPsbt', ...)` and `request('bitcoin_signMessage', ...)` into the `Signer` interface
- This is what makes the signing-actions factory work uniformly whether you have a wallet-injected provider or a custom signer

**Commit:** `feat(core): getWalletClient as the bridge between config and typed client`

---

## Phase 11 — Cleanup and barrels

Make `index.ts` files reflect the final public surface.

### 11.1 `core/src/index.ts`
- Remove all `export * from './client/...'` (paths are deleted)
- Remove `export * from './lib/data-sources/manager'` (deleted)
- Remove the resolve-ambiguity hacks from earlier (no longer ambiguous with new structure)
- Final exports:
  - Types from `./types/provider`, `./types/connector` (which re-imports `Account` from the client package)
  - `createLaserEyesConfig`, `LaserEyesConfig`
  - `LaserEyesState`, `createState`
  - All `actions/*`
  - `getClient`, `getWalletClient`
  - `createConnector`, `injected`, plus per-wallet connectors
  - All adapters and loaders
  - `discoverConnectors`, `announceWallet`, `listenForWalletAnnouncements`

### 11.2 `client/src/index.ts` and subpath exports
- See Phase 3.5

### 11.3 Build configs
- `client/vite.config.ts` and `core/vite.config.ts`: update entry points to match new structure
- `package.json` `exports` maps: update to new subpaths
- `tsconfig.json` paths: confirm they don't hardcode any of the moved files

**Commit:** `chore: prune barrels and update build configs to match new structure`

---

## Phase 12 — Green-up

Now make it compile.

### 12.1 Run `pnpm typecheck` (or equivalent) for `client` and `core`
- Fix every type error encountered
- Most should be import-path mismatches from the moves
- A few may be real type bugs — those get fixed inline

### 12.2 Run `pnpm build` for both packages
- Confirm `tsup`/`vite` produces the expected dist shape
- Confirm subpath exports work (`@omnisat/lasereyes-client/wallet`, etc.)

### 12.3 Run `pnpm lint:biome:fix`
- Auto-fix import ordering and formatting

### 12.4 Run `pnpm test --filter @omnisat/lasereyes-client`
- Update existing tests to the new APIs
- Add a sanity test for `mergeDataSources` precedence and `createClient(...).extend(...)` type accumulation

**Commit:** `chore: typecheck, lint, and test pass`

---

## Phase 13 — React adapter (deferred)

Out of scope per user direction. Once the above lands, the React hooks need:
- `LaserEyesProvider` accepts `LaserEyesConfig` (not `LaserEyesCoreConfig`)
- `useLaserEyesConfig()` replaces `useLaserEyesCore()`
- `useAccount()` reads `$account: Account | undefined` (not `AddressInfo[] | undefined`)
- `useConnect()` calls `connect(config, { connectorId })`
- All hooks subscribe to atoms via `useStore(config.state.$xxx)`

This is a mechanical rewrite once the lower layers are stable.

---

## What we are explicitly choosing not to do in this push

- **No new wallet implementations beyond what HEAD~1 had.** We port what existed.
- **No new vendor implementations.** mempool stays; sandshrew + maestro come back.
- **No protocol action *implementations*.** We lock in the *types* and *factories*
  for runes/brc20/alkanes/inscriptions; the bodies stay stubbed.
- **No documentation regeneration.** TypeDoc runs at the end; tier-1 doc comments
  stay where they are.
- **No `@omnisat/lasereyes` (legacy combined) work.** Out of scope.
- **No demo/docs apps work.** They depend on the React layer, deferred.

## Risk register

- **Type accumulation in `.extend()`** — biggest unknown. We have one sanity-check
  point in Phase 2.2; if it doesn't compose cleanly we may need to add explicit
  type parameters at call sites. Worst case: action factories take a phantom
  type parameter to constrain the client they're attached to. We keep this in
  mind but don't over-engineer up front.
- **Adapter porting (Phase 5)** is the biggest *volume* of work but the
  lowest *risk* — they're all variations on the unisat adapter pattern.
- **Vendor restoration (Phase 1.2/1.3)** has medium risk: the old
  `DataSourceManager` had implicit ordering and some normalization quirks; we'll
  port those carefully and keep the normalization functions intact.
- **`getWalletClient` type signature** (Phase 10) is the second-biggest unknown.
  Concrete generics for `WalletClient<...>` will be ugly. Plan: introduce a
  type alias `LaserEyesWalletClient<TChainId>` once we see what falls out.

## How we'll execute

1. I'll work phase-by-phase, committing at each phase boundary using the listed
   commit messages.
2. After each phase, I'll briefly summarize what landed and surface any
   surprises that change later phases.
3. If a phase grows beyond what I've sketched, I'll stop and re-plan rather
   than scope-creep silently.
4. Phase 12 (green-up) is the only phase where compilability is required to
   proceed; everything before it can be in any state.
5. If at any point we want to bail out, `git reset --hard f656782` returns us
   to the checkpoint.
