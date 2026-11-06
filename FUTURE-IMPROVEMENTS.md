# Future Improvements

A backlog of follow-up work surfaced during the major-refactor that's
**out of scope for the current phase** but worth picking up later. Each
entry lists what would change, why it's valuable, and what it costs.

Sibling docs:
- [`MIGRATION-PLAN.md`](./MIGRATION-PLAN.md) — phased plan currently in flight
- [`MENTAL-MODEL.md`](./MENTAL-MODEL.md) — architectural intent
- [`PHASE-9-PLAN.md`](./PHASE-9-PLAN.md) — current phase plan (deletes once Phase 9 commits)

When picking up an item: open a focused PR per entry, link it back here, and
mark the entry "✅ shipped in #PR" rather than deleting (so the rationale
stays searchable).

---

## Type-system

### Make `Connector<TId>` generic in its identifier

**Status:** open

**What:** `Connector` is currently `{ id: string; … }` — connector identity is
a `string` regardless of which factory built it. Make it generic in the ID:

```ts
// types/connector.ts
export interface Connector<TId extends string = string> {
  readonly id: TId
  // … rest unchanged …
}

export type CreateConnectorFn<TId extends string = string> =
  ((config: ConnectorConfig) => Connector<TId>) & {
    /** Static identifier — same as the Connector this factory produces. */
    readonly id: TId
  }
```

Each per-wallet factory then declares its literal:

```ts
// connectors/unisat.ts
export function unisat(): CreateConnectorFn<'unisat'> { … }
// connectors/xverse.ts
export function xverse(): CreateConnectorFn<'xverse'> { … }
// … 12 more
```

**Why:** Currently `connect(config, { connectorId })` takes
`connectorId: string` — no autocomplete on the IDs the user actually
registered, no compile-time rejection of typos. With the generic in
place, `connectorId` narrows to the literal union of registered IDs:

```ts
const config = createLaserEyesConfig({
  connectors: [unisat(), xverse()],
  // …
})

connect(config, { connectorId: 'unisat' })   // ✓ autocomplete shows 'unisat' | 'xverse' | string
connect(config, { connectorId: 'xverse' })   // ✓
connect(config, { connectorId: 'unisaat' })  // ❌ rejected (typo) — also gets autocomplete suggestion
```

The action signature becomes:

```ts
export async function connect<
  const config extends LaserEyesConfig<any, any, any>,
>(
  config: config,
  args: {
    connectorId:
      | ReturnType<config['connectorFns'][number]>['id']
      | (string & {})  // fallback for announced wallets — preserves autocomplete
  },
): Promise<ConnectResult>
```

The `(string & {})` arm preserves autocomplete on the literals (TS trick) while
still permitting any string for announced wallets discovered via
EIP-6963 — those connectors don't have known IDs at the type level.

**Why this works for switchNetwork but not Connector today:** chains are
declared upfront in the `chains: [MAINNET, TESTNET4]` tuple, and
`MAINNET.id` already preserves its `'mainnet'` literal (we fixed that in
the chain-literal pass). Connectors don't yet track per-factory IDs at
the type level — they all reduce to `Connector` with `id: string`.

**Cost:** ~16 file touches:
- `core/src/types/connector.ts` (Connector + CreateConnectorFn generic)
- `core/src/connectors/{create,injected}.ts` (thread the generic)
- `core/src/connectors/{unisat,xverse,leather,okx,oyl,magic-eden,phantom,orange,op-net,sparrow,tokeo,keplr}.ts` (14 factories)
- `core/src/actions/connect.ts` (use the narrowed type)
- Type-inference contract (add narrowing assertions + negative cases)

**Risk:** low — purely additive type precision. Default `TId = string`
keeps existing call sites compiling.

**Surfaced during:** Phase 9 action survey, 2026-05-10. Deferred per user
direction — out of Phase 9 scope.

---

### `getClient` can't return a broad client specifically for the `config.client` path

**Status:** open

**What:** When the keystones gain precise return types, `getClient(config, …)`
returns:

- `getClient(config, { chainId: K })` → a precise, **stripped-caps** client for
  chain `K` (`MergedCapabilities`-based, so a missing method is a real error).
- `getClient(config)` (chainId omitted) → a **union** over all configured
  chains (sound: the omitted case resolves to the active network at runtime,
  which `switchNetwork` can change to any chain).

What it does **not** do: return a deliberately *broad* client when the user
supplied a custom `config.client` factory. The desired behavior was — default
path strict/precise, `config.client` path broad/permissive (`AnyDataSourceClient`
= `Client<ClientConfig<ActionGroup>, ActionGroup, {}>`, any data-source method
callable). Instead, the `config.client` output is surfaced through the
precise/union signature via a **localized internal cast** inside `getClient`,
and the caller is responsible for the custom client being compatible.

**Why it's blocked (two findings):**

1. **`config.client` isn't type-discriminable.** The field is
   `client?: ClientFactory`, so for *every* config `C['client']` is
   `ClientFactory | undefined` — there's no type-level signal that a custom
   client was configured, so a `C['client'] extends ClientFactory ? Broad :
   Precise` switch can never fire.
2. **Broad isn't assignable to precise.** `AnyDataSourceClient` (its backend is
   the poisoned `ChainBackend<ActionGroup>` — the `& ActionGroup` index
   signature conflicts with the non-function `network` field) is **not**
   assignable to a stripped-caps `Client`, so the factory's broad output can't
   be surfaced through a precise/union return even structurally.

Together: there is no single return type that is both broad-for-`config.client`
and precise-for-default, and we can't branch without capturing client-ness in
the config type.

**What would unlock it:** capture whether a client factory was supplied so the
return can branch on it. Either:
- a **4th type param** on `LaserEyesConfig` / `createLaserEyesConfig`
  (`client extends ClientFactory | undefined = undefined`, inferred from
  `opts.client`), then `C['client'] extends ClientFactory ? AnyDataSourceClient
  : Precise`; or
- an **intersection-refinement** on `createLaserEyesConfig`'s return type that
  narrows the `client` field to the actual factory type (avoids a named param
  on the interface, but still threads a generic on the factory).

The 4th param was explicitly ruled out (keep `LaserEyesConfig` at three
params). Revisit if the broad-`config.client` ergonomics become important.

**Why it's acceptable for now:** the high-value wins (precise stripped caps +
sound union) land for the default/connected path — that's the actual
runtime-safety fix. `config.client` is an advanced escape hatch; surfacing it
through the precise signature with a contained cast keeps the one `any`
localized rather than leaking to callers.

**Cost (when picked up):** medium — a config type param (or factory-return
refinement) + threading through `getClient` (and `getWalletClient`). The
design + findings are prototyped in the (untracked) keystone exploration file;
see FINDING C / FINDING D there.

**Risk:** low-to-medium — adding a defaulted param is additive, but it touches
the config's generic surface, which the action bound (`<C extends
LaserEyesConfig>`) and the type-inference contract both depend on.

**Surfaced during:** keystone precise-return design, 2026-06-02. Deferred per
user direction — no 4th type param on `LaserEyesConfig`.

---

### `getWalletClient` precise return — low priority (corrected assessment)

**Status:** open — low priority, **intentionally left as-is**

**What:** `getWalletClient(config, …)` returns
`WalletClient<WalletClientConfig<Account, any>, Account, any, any>`. Unlike
`getClient` (now precise), this is deliberately **not** made precise yet.

**Corrected understanding** (an earlier note wrongly called this "where the
`sendBtc`/`signPsbt` `any` bites"):

- `createWalletClient` installs **`clientActions = {}`** — no action methods
  live on the wallet client. Callers never call `walletClient.sendBtc(...)`;
  they use the **typed free-function actions** (`sendBtc(config, …)` →
  `Promise<string>`, `signPsbt(config, …)` → `Promise<SignedPsbt>`), dispatched
  through the `getAction` cascade.
- **Signing is guarded, not `any`:** the `signPsbt`/`signMessage` free
  functions read `client.config.signer` via `requireSigner`, which throws a
  clear error if no signer is configured. The signer object does the work.
- **`sendBtc` is typed + covered:** the client free function is
  capability-constrained (`DS extends Pick<BaseCapability,
  'btcGetAddressUtxos' | 'btcBroadcastTransaction'>`) and routes either
  build-sign-broadcast or a connector-native `bitcoin_sendBitcoin` override
  (installed via `connector.getClient`, picked up by `getAction` before the
  fallback).

So the `any` on `getWalletClient` is the **same class** as `getClient`'s was —
the backend `dsMethods` caps and `account: Account` (generic, not the
connector's precise account type) — **not** an unchecked-action-method hole.

**Why deferred:** making it precise would only mirror `getClient`'s backend
typing (plus account precision *if* connectors typed their accounts), while
adding the **same dispatch force-casts** to `core/actions/wallet.ts` that the
read actions needed — more cost, less benefit. The higher-leverage follow-up is
"capability-constrain the read actions" under **Action API**, which removes the
casts *and* adds real call-site safety.

**Surfaced during:** wallet-client architecture review, 2026-06-02. Left as-is
per user direction.

---

## Action API

### Capability-constrain the read actions to remove the `getClient` dispatch casts

**Status:** open

**What:** The data-source read actions (`getAddressBalance`, `getAddressUtxos`,
`getRecommendedFees`, `getTransaction`, `broadcastTransaction` in
`core/src/actions/data.ts`) are generic over `LaserEyesConfig` (the loose
bound). Now that `getClient` returns a *precise* client, inside those generic
bodies `config['backends']` is the loose `Record<string, ChainBackend>`, so the
derived client is capability-less (`{}`). Each read therefore force-casts the
client at the `getAction` dispatch site:

```ts
return getAction(
  client as unknown as Parameters<typeof clientGetAddressBalance>[0],
  clientGetAddressBalance,
  'getAddressBalance',
)(address)
```

The cast asserts a precondition — "the active backend supports `btcGetBalance`"
— that the loose `config` can't prove (`getAction` itself stays strict and
still verifies the cast *target*).

**Why:** The proper fix is to constrain each action's `config` to backends that
*have* the capability it dispatches, e.g.

```ts
export async function getAddressBalance<
  const config extends LaserEyesConfig<
    any,
    Readonly<Record<string, ChainBackend<Pick<BaseCapability, 'btcGetBalance'>>>>
  >,
>(config: config, address: string, options?: …): Promise<string>
```

Then `getClient(config, …)` yields a client that genuinely carries
`btcGetBalance`, `getAction` accepts it with no cast, and a config whose
backends *don't* support the read is rejected at the **call site** (which is
correct — it's the same class of safety the precise `getClient` buys).

**Cost:** ~5 action signatures + matching updates to the core type-inference
contract (the `_typedConfig` / `_looseConfig` regression guards may need a
cap-bearing fixture — `_looseConfig`'s empty caps won't satisfy a cap
constraint, so that assertion would change shape).

**Risk:** medium — tightening an action's accepted config is a (subtle)
breaking change for any caller passing a config whose backend can't prove the
capability; in practice all real vendor backends implement `BaseCapability`.

**Surfaced during:** `getClient` precise-return implementation, 2026-06-02.
Deferred — the force-casts are localized and `getAction` stays strict.

---

---

## Vendor / data-source

### Per-action capability guards (complement to the backend Proxy guard)

**Status:** open

**What:** The backend Proxy guard (`backend/guard.ts`) makes a *call* to an
unregistered capability throw `CapabilityNotFoundError` instead of
`undefined is not a function`. A complementary, earlier-and-clearer guard is to
have each client free-function (or action factory) check the capability *before*
dispatching — e.g.

```ts
export async function getAddressBalance(client, address) {
  if (typeof client.config.backend.btcGetBalance !== 'function') {
    throw new CapabilityNotFoundError('base', 'btcGetBalance')
  }
  return client.config.backend.btcGetBalance(address)
}
```

**Why:** The Proxy guard is centralized and catches everything, but it fires
from *inside* the backend call (stack points into the proxy). A per-action
check fails at the action boundary with the action's own context, and lets the
factory constraints (`DS extends Pick<BaseCapability, 'btcGetBalance'>`) and the
runtime check agree. Mostly redundant with the Proxy guard, so low urgency —
nice-to-have for clearer stacks / belt-and-suspenders.

**Cost:** small per free-function; relates to the "capability-constrain the read
actions" entry under **Action API** — if those land, the type constraint plus
the Proxy guard may make per-action runtime checks unnecessary.

**Surfaced during:** backend Proxy guard, 2026-06-02. Deferred per user
direction — Proxy guard first.

---

## React layer

(Add entries here as they come up.)

---

## Documentation

(Add entries here as they come up.)

---

## Testing

### Add unit and integration tests for client + core

**Status:** open — high priority

**Background.** During the major-refactor, the legacy runtime tests in
`packages/client/src/__tests__/` were deleted because they were written against
the pre-refactor API surface (old `LaserEyesClient` class, old data-source
`{ group, methods }` envelope shape, string-typed `network` arg, old
`Account.readOnly` discriminator, etc.). Updating each test to the new shape
would have been mechanical busywork — many of the tests were also redundant
with what the type-inference contract now covers more precisely.

**What was kept:**
- `packages/client/src/__tests__/type-inference.test-d.ts` — 76-assertion
  binding contract (typechecks every public type signature)
- `packages/client/src/__tests__/lib/{btc,bytes,psbt}.test.ts` — utility
  unit tests (still valid; pure functions over byte/PSBT primitives)
- `packages/core/src/__tests__/type-inference.test-d.ts` — 61-assertion
  binding contract

**What's missing — needs new tests written from scratch:**

| Layer | What to cover |
|---|---|
| **Client — vendor data sources** | `mempool({ network, … })`, `sandshrew({ network, apiKey, … })`, `maestro({ network, apiKey, … })` integration tests against real or fixtured endpoints. Verify capability methods produce the correct response shapes. |
| **Client — `mergeDataSources`** | Runtime priority semantics (first-arg wins on overlap), capability union behavior, error propagation from underlying sources. |
| **Client — `createClient` / `createWalletClient`** | Network-mismatch error path, `.extend()` runtime accumulation (the type-level side is contract-locked; runtime side isn't). |
| **Client — public actions (`getBalance`, `getTransaction`, etc.)** | Each action wired against a fake `Client` with a stubbed `dataSource`. Verify request shape and return value. |
| **Client — wallet actions (`sendBtc`, `signPsbt`, `signMessage`)** | Stubbed `Signer` + fake account; verify PSBT construction + signing flow. |
| **Client — protocol actions (runes, brc20, inscriptions)** | Once implementations land for the stubbed write actions; reads should already be testable. |
| **Core — lifecycle actions (`initialize`, `connect`, `disconnect`, `switchNetwork`, `dispose`)** | State-atom transitions, announcement-listener cleanup, auto-reconnect from storage. Use fake connectors. |
| **Core — read actions (`getBalance`, `getTransaction`, etc.)** | Provider-first / client-fallback path. Verify `tryProvider` swallows gracefully and the bare-action delegation works. Use fake config + stubbed connector. |
| **Core — write actions (`sendBitcoin`, `signPsbt`, etc.)** | Connector dispatch through `connector.getProvider().request(...)`. |
| **Core — `getClient(config, opts?)`** | Chain-lookup, transport fold, runtime composition with bare actions. |
| **Adapters** | Method-by-method dispatch coverage for at least `unisat`, `xverse`, `leather`. The adapter layer translates wallet-specific APIs to the standard `BitcoinProvider` shape; each method needs its mapping verified. |
| **Connectors** | `injected({ target })` factory: detection, `connect/disconnect/getAccount/getNetworkId` lifecycle. |
| **Discovery** | `discoverConnectors({ explicit, onChange })` — explicit-vs-announced dedup by `rdns`, listener cleanup, multi-announcement scenarios. |
| **Storage** | `createStorage({ key, storage? })` — localStorage path + in-memory fallback + key prefixing. |

**Recommended approach:**
1. **Use Vitest** (already the project test runner per `vitest.config.ts`).
2. **Test fixtures over real network calls** for vendor data sources — wire
   them through `nock` / `msw` / hand-rolled fetch stubs. Real-network
   integration tests can live in a separate `__integration__/` directory and
   be opt-in via env flag.
3. **Co-locate**: `feature/foo.ts` → `feature/foo.test.ts`. Keeps test
   discovery simple and matches the type-inference contract's location.
4. **Don't try to reproduce the type-inference contract at runtime** — type
   precision is verified by `vitest typecheck`. Runtime tests should
   exercise *behavior*: did the right HTTP request go out? Did the state
   atom transition correctly? Did the PSBT builder produce a valid hex?
5. **Add `pnpm test` + `pnpm test:typecheck` to CI** so both the binding
   contract and runtime tests gate PRs.

**Cost:** medium-large. Could be split:
- **Pass 1:** Critical paths — `mergeDataSources`, vendor BaseCapability methods,
  `connect`/`disconnect`/`switchNetwork`, `getBalance` provider-first/fallback.
  ~2 days of focused work.
- **Pass 2:** Adapters + discovery + storage + edge cases. ~2 days.
- **Pass 3:** Protocol actions once implementations land.

**Until tests are added:** the type-inference contract (137 binding
assertions across both packages) is the safety net. It catches every
type-level regression, but it does NOT exercise runtime behavior. Land the
test plan above before declaring the major-refactor production-ready.

**Surfaced during:** Phase 9 cleanup, 2026-05-10. Legacy tests deleted in
the same commit as this entry.
