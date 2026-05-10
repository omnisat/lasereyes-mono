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

## Action API

(Add entries here as they come up.)

---

## Vendor / data-source

(Add entries here as they come up.)

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
