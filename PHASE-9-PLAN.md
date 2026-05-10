# Phase 9 Plan — Core actions over `LaserEyesConfig`

**Pre-read:** [`MIGRATION-PLAN.md` § Phase 9](./MIGRATION-PLAN.md#phase-9--core-actions-free-functions-over-config) and [`MENTAL-MODEL.md`](./MENTAL-MODEL.md).

**Branch:** `major-refactor`. **Last commit:** `2909df3` (`feat(client): add TODO(name) labels to stubbed write actions`).

**Boundary:** Phase 9 + the cleanup needed to make `pnpm tsc -p packages/core` green is one commit. Phase 10 (`getWalletClient` / `getClient` keystone) is the next commit after.

---

## 1. Outcome contract

After Phase 9 lands:

1. `packages/core/src/actions/` exports a complete set of free functions over `LaserEyesConfig<any, any, any>`. No references to the deleted `LaserEyesCore` class remain.
2. `packages/core` typechecks clean (production code only — legacy `__tests__/*.test.ts` Phase 12 green-up scope unchanged).
3. The core type-inference contract grows assertions for every Phase 9 action.
4. Legacy `src/lib/data-sources/`, `src/constants/networks.ts`, the dead `src/index.ts` re-exports, and the `src/types/index.ts:449` reference are all gone.
5. `unisat.ts` and `xverse.ts` adapters typecheck.

---

## 2. Action surface — concrete signatures

**Threading discipline (load-bearing).** Every Phase 9 action threads a `config` generic through its signature so a precisely-typed config flows through to dependent parameters and returns. This is wagmi's pattern.

The shape:

```ts
export async function actionName<
  const config extends LaserEyesConfig<any, any, any>,
  // … additional generics that depend on `config` …
>(
  config: config,
  // … args, possibly typed against `config['chains'][number]['id']` etc. …
): Promise<…>
```

`switchNetwork` is the showcase — its `networkId` parameter narrows to the chains the config actually carries, and its return type narrows to the *specific* chain matching the passed `networkId`:

```ts
export async function switchNetwork<
  const config extends LaserEyesConfig<any, any, any>,
  const id extends config['chains'][number]['id'],
>(
  config: config,
  networkId: id,
): Promise<Extract<config['chains'][number], { id: id }>>

// Call site:
const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET4],
  transports: { mainnet: [...], testnet4: [...] },
})
const resolved = await switchNetwork(config, 'mainnet')
//    ^? Promise<typeof MAINNET>   (narrowed via Extract)

await switchNetwork(config, 'signet')
//                          ^^^^^^^^ ❌ TS2322 — 'signet' not in 'mainnet' | 'testnet4'
```

For actions that don't have args dependent on config (e.g. `getBalance(config, address)` where `address` is just a string), the threading still happens for consistency and future-proofing — but no per-param narrowing is added beyond what TS already gives.

Rules of thumb:
- **Always** thread `<const config extends LaserEyesConfig<any, any, any>>`.
- **Add narrowing generics** (`const id extends config['chains'][number]['id']`, etc.) only when there's a parameter or return type that benefits.
- Return types stay concrete unless the action genuinely returns something whose precision depends on config (`switchNetwork` is the only one in Phase 9).

### 2.1 Lifecycle (`core/src/actions/`)

```ts
// initialize.ts
export async function initialize(
  config: LaserEyesConfig<any, any, any>
): Promise<void>
// - Calls `discoverConnectors({ explicit, onChange })` to start announcement listener.
//   Stores the cleanup callback in a module-private WeakMap keyed by config so
//   `dispose(config)` can later cancel it.
// - If `config.autoReconnect`, reads the persisted connector ID from
//   `config.storage`, looks it up in `state.$connectors`, and silently calls
//   `connect(config, { connectorId })` if found.

// dispose.ts
export function dispose(
  config: LaserEyesConfig<any, any, any>
): void
// - Synchronously cancels the announcement listener stored by initialize().
// - Resets state atoms to disconnected defaults.
// - Sync because no I/O.

// connect.ts
export interface ConnectArgs {
  /** Connector ID (the `id` field of the registered `Connector`). */
  connectorId: string
}
export async function connect(
  config: LaserEyesConfig<any, any, any>,
  args: ConnectArgs
): Promise<ConnectResult>
// - Looks up the connector from `state.$connectors[args.connectorId]`.
// - Sets `state.$status` to 'connecting'.
// - Calls `connector.connect()` → ConnectResult.
// - On success: populates `$account`, `$networkId`, `$connector`, sets `$status`
//   to 'connected', persists `connectorId` to storage if `autoReconnect`.
// - On failure: resets `$status` to 'disconnected' and re-throws.
// - `ConnectResult` is `{ account: Account, networkId: NetworkId }` — re-export
//   from types/connector.

// disconnect.ts
export async function disconnect(
  config: LaserEyesConfig<any, any, any>
): Promise<void>
// - Reads current connector from `state.$connector`.
// - If present, calls `connector.disconnect()`.
// - Clears `$account`, `$connector`, sets `$status` to 'disconnected'.
// - Removes the persisted connectorId from storage.

// switchNetwork.ts
export async function switchNetwork<
  const config extends LaserEyesConfig<any, any, any>,
  const id extends config['chains'][number]['id'],
>(
  config: config,
  networkId: id,
): Promise<Extract<config['chains'][number], { id: id }>>
// - networkId is constrained to the chains the config carries.
// - Return narrows to the specific chain matching `networkId` (when called
//   with a literal id).
// - Requires an active connector.
// - Calls `connector.switchNetwork(networkId)` → ChainNetwork (cast back).
// - Updates `state.$networkId`.
```

### 2.2 Read actions — provider-first, client-fallback (`actions/data.ts`)

Pattern: try the active connector's `request(method, params)` first. If no connector, no fallback method, or the request throws, fall back to the merged data source (when one is configured).

```ts
// Internal helper (not exported from public barrel).
async function tryProvider<T>(
  config: LaserEyesConfig<any, any, any>,
  method: string,
  params?: Record<string, unknown>
): Promise<T | undefined>
// - Reads `state.$connector`. Returns undefined if none.
// - Calls `connector.getProvider()?.request(method, params)`.
// - On thrown error, returns undefined (caller falls back).
// - On success, returns the cast result.

export async function getBalance(
  config: LaserEyesConfig<any, any, any>,
  address: string
): Promise<string>
// - Try provider: 'bitcoin_getBalance', { address }
// - Fallback: _resolveDataSource(config).btcGetBalance(address)
// - Throws if both fail.

export async function getAddressUtxos(
  config: LaserEyesConfig<any, any, any>,
  address: string
): Promise<PaginatedResult<UTXO>>
// - Same shape: 'bitcoin_getUtxos' → btcGetAddressUtxos
```

### 2.3 Read actions — provider-only (no client fallback)

Reason: protocol-data fallback would need protocol capabilities on the data source AND TS-typed `RuneCapability` etc. method calls, which is Phase 10 keystone work. For now, these go provider-only.

```ts
export async function getInscriptions(
  config: LaserEyesConfig<any, any, any>,
  address: string,
  options?: { offset?: number; limit?: number }
): Promise<Inscription[]>
// - 'bitcoin_getInscriptions', { address, ...options }
// - Throws if provider doesn't support it (no fallback).

export async function getRunesBalances(
  config: LaserEyesConfig<any, any, any>,
  address: string
): Promise<RuneBalance[]>

export async function getBrc20Balances(
  config: LaserEyesConfig<any, any, any>,
  address: string
): Promise<Brc20Balance[]>

export async function getAlkanesBalances(
  config: LaserEyesConfig<any, any, any>,
  address: string
): Promise<AlkaneBalance[]>
// Note: alkanes are included here even though we skipped the client-side
// alkanes scaffolding. They're just provider passthroughs at this layer —
// no data-source capability is required.
```

### 2.4 Read actions — client-only (`actions/data.ts`)

```ts
export async function getRecommendedFees(
  config: LaserEyesConfig<any, any, any>
): Promise<FeeEstimate>
// - _resolveDataSource(config).btcGetRecommendedFees()

export async function getTransaction(
  config: LaserEyesConfig<any, any, any>,
  txId: string
): Promise<Transaction>
// - _resolveDataSource(config).btcGetTransaction(txId)

export async function broadcastTransaction(
  config: LaserEyesConfig<any, any, any>,
  rawTx: string
): Promise<string>
// - _resolveDataSource(config).btcBroadcastTransaction(rawTx)
```

### 2.5 Write actions (`actions/wallet.ts`)

These go directly through the active connector. No keystone needed.

```ts
export async function sendBitcoin(
  config: LaserEyesConfig<any, any, any>,
  to: string,
  amount: number
): Promise<string>
// - _resolveConnector(config).getProvider().request('bitcoin_sendBitcoin', { to, amount })

export async function signPsbt(
  config: LaserEyesConfig<any, any, any>,
  psbt: string,
  options?: SignPsbtOptions
): Promise<SignedPsbt>
// - request('bitcoin_signPsbt', { psbt, ...options })

export async function signMessage(
  config: LaserEyesConfig<any, any, any>,
  message: string,
  options?: SignMessageOptions
): Promise<string>
// - request('bitcoin_signMessage', { message, ...options })

export async function broadcastPsbt(
  config: LaserEyesConfig<any, any, any>,
  psbt: string
): Promise<string>
// - request('bitcoin_pushPsbt', { psbt })
```

---

## 3. Internal helpers

Both private to the core package (not exported). They land in `core/src/_internal/` to make their non-public status visually obvious.

```ts
// core/src/_internal/resolve-data-source.ts
import { mergeDataSources } from '@omnisat/lasereyes-client'

export function _resolveDataSource(
  config: LaserEyesConfig<any, any, any>,
  chainId?: NetworkId
): ChainDataSource<any>
// - chainId defaults to `state.$networkId.get()`.
// - Reads `config.transports[chainId]`. If empty/missing, throws
//   `LaserEyesClientError('No data sources configured for ' + chainId)`.
// - Folds via `array.reduceRight(mergeDataSources)` (first source wins on overlap,
//   per established mergeDataSources semantics).
// - Single-source case: returns the source directly (no fold needed).

// core/src/_internal/resolve-connector.ts
export function _resolveConnector(
  config: LaserEyesConfig<any, any, any>
): Connector
// - Reads `state.$connector`. Throws `LaserEyesClientError('No wallet connected')`
//   if absent.
// - Used by all write actions and `tryProvider`'s active-connector lookup.
```

`tryProvider` lives inside `actions/data.ts` (used only there).

---

## 4. File-by-file changes

### 4.1 New files

```
core/src/_internal/
├── resolve-connector.ts
├── resolve-data-source.ts
└── index.ts                — barrel for internal use only

core/src/actions/
├── connect.ts              — Phase 9.1
├── disconnect.ts           — Phase 9.1
├── dispose.ts              — Phase 9.1
├── initialize.ts           — Phase 9.1
└── switchNetwork.ts        — Phase 9.1
```

### 4.2 Rewrites

| File | Change |
|---|---|
| `core/src/actions/data.ts` | Full rewrite over `LaserEyesConfig`. Provider-first/client-fallback for `getBalance`, `getAddressUtxos`. Provider-only for `getInscriptions`/`getRunesBalances`/`getBrc20Balances`/`getAlkanesBalances`. Client-only for `getRecommendedFees`/`getTransaction`/`broadcastTransaction`. |
| `core/src/actions/wallet.ts` | Full rewrite over `LaserEyesConfig`. `sendBitcoin`/`signPsbt`/`signMessage`/`broadcastPsbt` via `_resolveConnector`. |
| `core/src/actions/index.ts` | Re-export all action functions plus the new lifecycle ones. Drop dead exports. |

### 4.3 Deletions (Phase 11 cleanup, performed in this same commit)

| Path | Reason |
|---|---|
| `core/src/lib/data-sources/` (entire directory) | Legacy `DataSourceManager` singleton — replaced by client vendor factories + `_resolveDataSource`. |
| `core/src/lib/sandshrew.ts` | Legacy sandshrew client — replaced by `@omnisat/lasereyes-client/vendors/sandshrew`. |
| `core/src/lib/mempool-space.ts` | Legacy mempool client — replaced by `@omnisat/lasereyes-client/vendors/mempool`. |
| `core/src/lib/inscribe.ts` | Legacy inscribe builders — Phase 13 will reintroduce write actions on top of `client/utils` PSBT builders. |
| `core/src/lib/urls.ts` | Legacy URL constants — duplicated in `client/lib/urls.ts`. |
| `core/src/lib/btc.ts` | Legacy address derivation — duplicated in `client/lib/btc.ts`. **Audit before deleting** — adapter files might still import. |
| `core/src/lib/utils.ts` | Legacy DOM-shake hack — no longer needed (announcement-driven discovery replaces it). |
| `core/src/lib/helpers.ts` | Legacy helpers — audit before deleting. |
| `core/src/lib/psbt.ts` | Legacy PSBT helpers — replaced by `client/utils` PSBT builders. |
| `core/src/constants/networks.ts` | Legacy chain string constants — replaced by `client/chains`. |
| `core/src/types/data-source.ts:2` | Stale import (`BaseNetworkType`, `NetworkType` from deleted location). Either fix import or delete file if unused. |
| `core/src/types/index.ts:449` | Stale `LaserEyesCoreConfig` / `NetworkConfig` re-export from deleted `'../core'`. Drop the line. |
| `core/src/modules/data-provider/` | Audit — likely legacy. |
| `core/src/client/` (entire directory: `types.ts`, `utils.ts`) | Legacy `LaserEyesStoreType`, `triggerDOMShakeHack`, etc. Replaced by `state.ts` + `config.ts`. |

### 4.4 `core/src/index.ts` rewrite

Replace the current broken barrel with a clean one. Final shape (Phase 11.1 of MIGRATION-PLAN):

```ts
// Config + state
export { createLaserEyesConfig } from './config'
export type { CreateLaserEyesConfigOptions, LaserEyesConfig, NetworkTransports } from './config'
export { createState } from './state'
export type { LaserEyesState } from './state'
export { createStorage } from './storage'
export type { CreateStorageOptions, Storage } from './storage'

// Actions
export * from './actions'

// Connectors
export * from './connectors'

// Adapters
export * from './adapters'

// Detection
export * from './detection'

// Provider standard
export type {
  BitcoinProvider,
  BitcoinRpcMethod,
  BitcoinProviderEvent,
  ConnectInfo,
  DisconnectInfo,
  ProviderMessage,
  ProviderCapabilities,
  NetworkCapabilities,
  MethodCapability,
  TypeDescriptor,
} from './types/provider'
export { ProviderErrorCode, ProviderRpcError, createMethodCapability, describeType } from './types/provider'

// Connector + Account types
export type {
  Connector,
  ConnectorConfig,
  ConnectorMetadata,
  ConnectionStatus,
  ConnectResult,
  CreateConnectorFn,
} from './types/connector'

// Re-export commonly-used client types for convenience
export type {
  Account,
  AddressInfo,
  AddressPurpose,
  WalletAccount,
  ChainNetwork,
  NetworkId,
  NetworkType,
} from '@omnisat/lasereyes-client'
```

### 4.5 Adapter port completion

`core/src/adapters/unisat.ts` has 16 errors from leftover legacy code that references types from deleted locations (`Inscription`, `UnisatNetwork`, `BitcoinProviderAdapter`). The plan:

- Identify the dead method-handler bodies that reference these types (lines 276, 341–369, 404 from earlier surveys).
- **Delete** the dead handler bodies — they're for methods that aren't part of the standard `BitcoinProvider` interface (Unisat-specific extensions). The standard `request` switch in unisat.ts already handles the spec methods via stubs from Phase 5.
- Drop the resulting unused imports.

`core/src/adapters/xverse.ts` has 1 error: stray import of `BitcoinProviderAdapter` from `../types/provider` (it lives in `../adapters/base` after the Phase 5 reorg). One-line fix.

---

## 5. Contract additions (`core/src/__tests__/type-inference.test-d.ts`)

New section: **§7 Actions — signatures and return shapes.**

```ts
describe('Lifecycle actions', () => {
  it('initialize takes config and returns Promise<void>')
  it('dispose takes config and returns void (sync)')
  it('connect takes config + { connectorId } and returns Promise<ConnectResult>')
  it('disconnect takes config and returns Promise<void>')
  it('switchNetwork takes (config, networkId) and returns Promise<ChainNetwork>')
})

describe('Data actions', () => {
  it('getBalance: (config, address) => Promise<string>')
  it('getAddressUtxos: (config, address) => Promise<PaginatedResult<UTXO>>')
  it('getInscriptions: (config, address, options?) => Promise<Inscription[]>')
  it('getRunesBalances / getBrc20Balances / getAlkanesBalances: shape')
  it('getRecommendedFees: (config) => Promise<FeeEstimate>')
  it('getTransaction: (config, txId) => Promise<Transaction>')
  it('broadcastTransaction: (config, rawTx) => Promise<string>')
})

describe('Wallet actions', () => {
  it('sendBitcoin: (config, to, amount) => Promise<string>')
  it('signPsbt: (config, psbt, options?) => Promise<SignedPsbt>')
  it('signMessage: (config, message, options?) => Promise<string>')
  it('broadcastPsbt: (config, psbt) => Promise<string>')
})
```

Each test asserts:
- Parameter 0 is `LaserEyesConfig<any, any, any>`
- Subsequent params have the right concrete types
- Return type is the right concrete shape

Maintenance rule #7 added to the contract docblock.

---

## 6. Open questions — RESOLVED

| Q | Decision |
|---|---|
| Q1 | `connect()` returns `Promise<ConnectResult>` |
| Q2 | Helper dir is `internal/` (no underscore prefix) |
| Q3 | Provider-only for protocol reads in Phase 9. Typed data-source fallback waits for Phase 10's keystone. |
| Q4 | Execute steps 1–5 (helpers + actions + lifecycle + barrel) in this session. Steps 6–12 (cleanup, adapter port completion, barrel rewrite, contract tests, build verify, commit) go to a fresh session. |
| Q5 | `lib/btc.ts` audit deferred to step 6 (next session). |
| Q6 | Storage schema: single key `'lasereyes.connectorId'` for autoreconnect. Confirmed. |
| Q7 | `connect` arg shape: `{ connectorId: string }` (lookup via `state.$connectors`). Confirmed. |

### Architectural correction: actions go through the client package's typed action layer (2026-05-10)

**Issue identified during review.** The first cut of Phase 9 actions reached
directly into the data source for fallback paths:

```ts
// WRONG — bypasses the typed action layer
return resolveDataSource(config).btcGetBalance(address)
```

That defeated the purpose of building the client package first — the typed
actions (`getBalance(client, address)`, etc.) are *the* surface for read
operations. Core actions should compose them, not bypass them.

**Fix.** Pulled Phase 10.2's `getClient(config, opts?)` into Phase 9 as a
**bare** typed client (no action groups pre-extended). Phase 9 read actions
import the bare action functions from `@omnisat/lasereyes-client` and compose
them with the bare client:

```ts
// RIGHT — bare action + bare client composition
import { getBalance as clientGetBalance } from '@omnisat/lasereyes-client'

return clientGetBalance(getClient(config), address)
```

This keeps three things clean:

1. **The typed action layer is the read API.** Core defers to it; doesn't
   reimplement it.
2. **Tree-shaking-friendly.** Each action explicitly imports only what it
   needs, no `publicActions()` factory pulls everything in at once.
3. **`getClient(config)` stays bare.** Callers who want the extended-method
   form can still do `getClient(config).extend(publicActions())` themselves
   — Phase 9 actions don't pre-extend.

**What was added/changed:**
- `core/src/client.ts` — new file, exports `getClient`. Returns a bare
  `Client` with `dataSource` cast as `ChainDataSource<BaseCapability>`
  (Phase 10 will introduce a precision-preserving variant).
- `client/src/index.ts` — added bare-action re-exports: `broadcastTransaction`,
  `getBalance`, `getOutputValue`, `getRecommendedFees`, `getTransaction`,
  `getUtxos`, `waitForTransaction` alongside the existing `publicActions`.
- `core/src/actions/data.ts` — every fallback / client-only path now uses
  `clientAction(getClient(config, opts), …args)`.
- `core/src/actions/index.ts` — re-exports `getClient` for public consumption.
- Core type-inference contract — added §7a covering `getClient`, including
  a test that exercises the bare-action composition end-to-end.

### Action survey (after Steps 1–5 landed)

Inspected all 18 actions for narrowing opportunities. Outcome:

- **switchNetwork** — has chain-id narrowing with conditional fallback. ✓
- **getRecommendedFees / getTransaction / broadcastTransaction** — got an optional
  `{ chainId? }` parameter with the same chain-id narrowing pattern as switchNetwork.
  Default-generic configs accept any `NetworkId`; typed configs reject out-of-config
  IDs at compile time. Bodies use `_resolveDataSource(config, options?.chainId)`.
- **connect's connectorId** — could narrow to literal connector IDs but requires making
  `Connector<TId>` generic + updating 14 wallet factories. Out of Phase 9 scope; logged
  in [`FUTURE-IMPROVEMENTS.md`](./FUTURE-IMPROVEMENTS.md) for later pickup.
- All other actions take primitive args (`string`, `number`) or no args — no
  narrowing opportunity.

Original deliberation:

### Q1 — Should `connect()` return `ConnectResult` or `void`?

The current (deleted) `LaserEyesCore.connect()` returned `Promise<void>` — populated state atoms, caller subscribes. wagmi's `connect` returns `Promise<{ accounts; chainId; }>`.

**Lean:** Return `Promise<ConnectResult>` (matches the `Connector.connect()` return). Programmatic code that doesn't need the result can ignore it; subscribers still get state updates.

### Q2 — `_resolveDataSource` directory: `_internal/` vs `internal/`?

`_internal/` makes the underscore-prefix convention visually obvious. `internal/` reads more naturally. Either works — pick one.

**Lean:** `_internal/` (the underscore is a clear "don't import from outside the package" signal).

### Q3 — Should provider-only read actions still attempt a typed-data-source fallback for `getInscriptions`/`getRunesBalances`/etc.?

The data source might have these capabilities (sandshrew has `runesGetAddressBalances`, etc.). Falling back would let users with no wallet still query rune data.

**Trade-off:**
- Pro: more useful — read actions work without a connected wallet
- Con: needs the protocol capability check at runtime; adds complexity; users can already do this via `getClient(config).extend(runeActions())` once Phase 10 lands

**Lean:** Provider-only for Phase 9. Phase 13 (or the user explicitly later) can add fallback if needed.

### Q4 — Does `dispose(config)` need to be async?

Cancelling the announcement listener is sync. Resetting state atoms is sync. So `dispose` can be sync.

But: if the caller wants to wait for any in-flight `connect()` to finish before disposing, async would help. Doesn't matter for the basic case.

**Lean:** Sync. Callers who want to gate on an in-flight `connect()` can await it themselves.

### Q5 — `core/src/lib/btc.ts` — keep or delete?

Used by adapters that haven't been ported (legacy code). After adapter port completion, may be unused. Audit during execution.

**Lean:** Audit first. Delete if unused.

### Q6 — Persisted-state schema in storage?

`config.storage` is just a `getItem`/`setItem`/`removeItem` interface. The plan uses storage to persist `connectorId` for auto-reconnect. Schema:

```ts
storage.setItem('lasereyes.connectorId', connector.id)
storage.removeItem('lasereyes.connectorId')
```

Single string, single key. Simple.

**Lean:** Confirmed simple. No further design needed.

### Q7 — Should connect(config, args) accept just `connectorId: string` or the full `Connector` object?

wagmi accepts `connector: Connector` (the resolved object). LaserEyes's existing pattern uses `connectorId: string`.

**Lean:** Stick with `connectorId: string`. Connectors are registered in `state.$connectors` keyed by id; resolving is a `state.$connectors.get()[id]` lookup.

---

## 7. Execution ordering

Single commit. Inside the commit:

1. **Internal helpers first.** `_internal/resolve-connector.ts` and `_internal/resolve-data-source.ts`. No other code depends on them yet, so these are isolated.
2. **`actions/data.ts` rewrite.** Uses the helpers. Verify provider-first/fallback shape.
3. **`actions/wallet.ts` rewrite.** Uses `_resolveConnector`.
4. **Lifecycle actions** (5 new files in `core/src/actions/`). The hardest is `initialize.ts` — needs the announcement-listener WeakMap pattern to support `dispose`.
5. **`actions/index.ts` barrel.** Re-export the 14 actions.
6. **Cleanup pass** (Phase 11.1): delete `core/src/lib/data-sources/`, `core/src/constants/networks.ts`, `core/src/client/`, `core/src/modules/data-provider/`. Audit `core/src/lib/btc.ts`, `core/src/lib/helpers.ts`. Drop dead exports from `src/index.ts`. Fix `src/types/index.ts:449`. Fix `src/types/data-source.ts:2`.
7. **Adapter port completion**: clean up `unisat.ts` dead code; fix `xverse.ts` import path.
8. **Rewrite `core/src/index.ts`** to the final clean barrel from §4.4.
9. **Verify production typecheck**: `pnpm tsc -p packages/core/tsconfig.typecheck.json | grep -v "__tests__/" | grep "error TS"` — must show zero.
10. **Add contract tests** (§5) and verify both client + core contracts pass.
11. **Build sanity check**: `pnpm build` from packages/core — must succeed.
12. **Commit.** Suggested message: `feat(core): free-function actions over LaserEyesConfig + Phase 11 cleanup`.

---

## 8. Out of scope (Phase 10 / 11 / 12 / 13)

Explicitly NOT in this commit:

- `getClient(config, opts?)` and `getWalletClient(config, opts?)` — Phase 10 keystone. Their internals will use `_resolveDataSource` (which is why we're keeping that helper).
- `providerSigner(provider)` (`packages/client/src/signer/from-provider.ts`) — Phase 10.
- React hooks rewrite — Phase 13.
- Real implementations for the alkanes/runes/brc20/inscriptions write actions — they stay stubbed with `TODO(name)` labels.
- Final TypeDoc documentation pass.

---

## 9. Risk register

- **`initialize`'s announcement listener cleanup** is the trickiest part. The cleanup function returned by `discoverConnectors` lives on `initialize`'s stack frame; `dispose` needs to find it. Plan: module-private `WeakMap<LaserEyesConfig, () => void>` in `initialize.ts`, exported only as the `dispose` cleanup.
- **`_resolveDataSource` for read-only actions on a config with no transports** — throw a clear error rather than silently returning `undefined`. The `tryProvider` fallback path can swallow that error and re-throw a "neither provider nor data source available" message.
- **Cleanup deletes too aggressive** — some legacy `lib/` files may be silently imported by the (incomplete) adapters. Audit step 6 includes a full grep before each deletion.

---

## 10. Confirmation points before execution

Before any code lands, confirm with the user:

1. Q1 (`connect` return type)
2. Q2 (`_internal` vs `internal`)
3. Q3 (provider-only for protocol reads)
4. Whether to do all 12 execution steps in one push or break at, say, step 6 (after Phase 9 actions, before cleanup) for review.
