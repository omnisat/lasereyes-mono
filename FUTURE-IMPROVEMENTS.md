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
