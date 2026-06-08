# react hooks: type rigor + override flexibility

**Status:** ✅ resolved. Authored after the initial react rebuild (provider +
17 query-backed hooks), this began as a problem statement; the work described
below is now implemented and covered by tests. The original problem statement
is preserved (Background / Problems) as the rationale; see **Resolution** at the
bottom for what shipped and where.

**Decisions taken** (from the original open questions):

1. **Generic threading** — _both_ a wagmi-style `Register` (context config types
   precisely by default) _and_ an optional per-call `config` on every hook.
2. **Result discrimination** — a full `status: 'idle' | 'loading' | 'success' |
   'error'` union (TanStack/wagmi style), `success ⇒ data: T`.
3. **Override scope** — `chainId` (narrowed to configured chains) + `enabled` +
   `config` + `queryContext`. Full nanoquery option passthrough
   (`refetchInterval`, `dedupeTime`, …) deferred.
4. **Mutations** — symmetric `config` + `queryContext` injection; same
   discriminated result.
5. **Connector-id narrowing** — _not_ done, and won't be from the config type:
   connectors are discovered dynamically (EIP-6963) and aren't derivable from
   the static config. `useConnector` / `useConnectors` keep `id: string` and are
   left untouched.

## Background

The core is precisely typed and the react bindings throw most of that away:

- `LaserEyesConfig<chains, backends, connectorFns>` is generic. In particular
  `config.state.$connection` is a `ConnectionStore<chains[number]['id']>` whose
  read snapshot (`ConnectionSnapshot`, `packages/core/src/state.ts`) is a
  **discriminated union on `status`**: when `status === 'connected'`, `account`
  is a non-null `WalletAccount` and `connector` a non-null `Connector`.
- Read/write actions thread `<const config extends LaserEyesConfig>` and narrow
  arguments to the config's chains — e.g. `switchNetwork(config, id)` restricts
  `id` to `config['chains'][number]['id']`, and `getAddressBalance` /
  `getAddressUtxos` / `getRecommendedFees` / `getTransaction` /
  `broadcastTransaction` accept `options?: { chainId?: config['chains'][number]['id'] }`
  (`packages/core/src/actions/data.ts:115-147`, etc.).

The react layer collapses all of this.

## Problems

### P1 — Config generics are not threaded

`useConfig()` (`packages/react/src/providers/context.ts`) returns the **bare,
non-generic** `LaserEyesConfig`. Every hook calls it internally, so the user's
concrete `chains` / `backends` / `connectorFns` are erased. Consequences:

- `useNetwork().network` is the open `NetworkId` string union, not the configured
  `'mainnet' | 'testnet4'` literal union.
- `useNetwork().switchNetwork(id)` accepts **any** `NetworkId`, discarding the
  compile-time "is this chain configured?" guard the core action enforces.
- `useAccount().networkId` is the open union, not the configured one.
- `useConnector(id)` takes `id: string`, not the configured connector ids.

### P2 — No type discrimination on results

Two places throw away unions the core already models:

1. **Account.** `useAccount` (`packages/react/src/hooks/useAccount.ts`) flattens
   the discriminated `ConnectionSnapshot` into an object where `account`,
   `paymentAddress`, `ordinalsAddress`, `connector`, `publicKey` are **always**
   `T | undefined`. After `if (isConnected)` the consumer must *still* null-check
   `paymentAddress`. The return should be a discriminated union so the
   `connected` branch guarantees non-null `account` / addresses / connector.

2. **Query results.** `QueryResult` (`use-fetcher-store.ts`) is
   `{ data: T | undefined; loading; error }` — flat. There is no
   `status: 'success'` narrowing that proves `data` is present. Same for the
   mutation result (`use-mutator-store.ts`). Target: a discriminated result
   (idle/loading/success/error) where the success branch has non-`undefined`
   `data` and the error branch has a non-`undefined` `error`.

### P3 — No per-call parameter overrides

Hooks expose none of the per-call knobs the core supports:

- The read actions accept `{ chainId }` (type-narrowed to configured chains) to
  read a chain *other* than the active one — but the **query builders drop it**:
  `getAddressBalanceQuery` et al. call `getAddressBalance(config, addr)` with no
  options and **do not include chainId in the cache key**
  (`packages/core/src/query/{balance,utxos,fees,transaction}.ts`). So even the
  query layer can't target a non-active chain, and react exposes nothing.
- No passthrough for query behaviour (`enabled`, `refetchInterval`, dedupe/cache
  overrides) or for mutation options.

Net: a user cannot, e.g., `useBalance(addr, { chainId: 'testnet4' })` or
`useBalance(addr, { enabled: false })`.

### P4 — Hooks are locked to the context config

Every hook hard-binds to `useConfig()` (the provider's config). A user with more
than one config, or wanting to drive a hook off an explicit config (tests, SSR,
multi-wallet surfaces), has no escape hatch. Hooks should accept an optional
`config` (and optional `queryContext`) that overrides the context, with the
passed config's generics flowing through the return types (wagmi's
`useBalance({ config })` pattern).

## Target end-state (requirements, not yet a design)

1. **Generic threading.** A hook's return types reflect the *concrete* config —
   whether the config comes from context or is passed explicitly. Likely needs
   either (a) a wagmi-style `Register` interface so the context-derived config is
   strongly typed globally, and/or (b) every hook accepting an optional
   `config` generic param. Decide which (see open questions).
2. **Discriminated returns.** `useAccount` returns a `status`-discriminated union
   mirroring `ConnectionSnapshot`. Read/write hooks return a `status`-discriminated
   result where `success ⇒ data: T`.
3. **Per-call overrides.** Read hooks accept an options bag: at minimum
   `{ chainId?, enabled?, config?, queryContext? }`, with `chainId` narrowed to
   the (effective) config's chains. This requires plumbing `chainId` (and
   behaviour options) **through the query builders** and folding `chainId` into
   the cache key — a core/query change, not just react.
4. **Config injection.** Every hook accepts an optional `config` / `queryContext`
   that overrides context; defaults preserve today's ergonomics.

## Layering / where the work lands

- **react only:** P1 (threading + `Register`), P2 account discrimination, P4
  config injection, P2 result discrimination *shape*.
- **core/query (+ actions already done):** P3 — builders must accept and thread
  `options`/`chainId` and include `chainId` in `getXxxQueryKey`; possibly a
  discriminated `FetcherValue` adapter to back P2 result discrimination cleanly.

## Acceptance criteria

- Type-level tests (`expectTypeOf`, mirroring the client package's
  `type-inference.test-d.ts` discipline) proving:
  - `useNetwork().network` and `useAccount().networkId` narrow to the configured
    id union; `switchNetwork` / `chainId` reject unconfigured ids
    (`@ts-expect-error`).
  - `useAccount()` connected branch has non-null `account`/addresses/connector.
  - query/mutation `success` branch has non-`undefined` `data`.
  - passing `{ config }` overrides context and flows that config's generics.
- Runtime tests: a `chainId` override produces a distinct cache key → separate
  fetch; an explicit `config` is used over the provider's.
- Existing react + core/query tests still pass.

## Resolution (what shipped)

### core/query — P3 plumbing

- `QueryBuilderOptions { chainId?, enabled? }` and `effectiveNetworkIdAtom(config,
  options?)` added in `packages/core/src/query/context.ts` (re-exported from the
  `query` barrel).
- The four read builders (`balance`, `utxos`, `fees`, `transaction`) gained an
  optional 4th `options` arg. The networkId key-part is now the **effective**
  chain: `chainId` (if set, static) else the active connection's (reactive) —
  so a non-active-chain read caches under its own slot. `enabled: false`
  resolves the key-part to `null` (a nanoquery NoKey → idle, no fetch, no cache
  entry). `chainId` is forwarded to the action only when set, so the default
  call stays the 2-arg `getAddressBalance(config, addr)` (action contract
  unchanged). Tests: `packages/core/src/__tests__/query.test.ts`
  (chainId → distinct key → separate fetch; `enabled: false` → idle).

### react — P1 / P2 / P4

- **P1 + P4 (generic threading + injection).** `packages/react/src/types.ts`:
  `Register`, `ResolvedRegister`, `ConfigParameter`, `ConfigNetworkId`,
  `ReadHookOptions`, `MutationHookOptions`. `useConfig<config>(parameters?)` and
  `useQueryContext(override?)` are now override-aware (no provider required when
  passed explicitly). Every state/read/write hook takes an optional `config`
  (reads/mutations also `queryContext`), defaulting to `ResolvedRegister['config']`.
- **P2 (discrimination).** `useAccount` returns a `status`-discriminated union:
  the `connected` branch guarantees non-null `account` / `connector`.
  `QueryResult` (`use-fetcher-store.ts`) and `MutationResult` (`use-mutator-store.ts`)
  are `status` unions where `success ⇒ data: T` / error ⇒ `error: E`, plus
  `isIdle/isLoading/isSuccess/isError`. Mutation hooks spread the discriminated
  result via `Object.assign` (preserves the union) and add domain aliases
  (`sendBitcoin`, `txId`, …).
- **P3 surface.** Read hooks accept `{ chainId, enabled, config, queryContext }`;
  `chainId` is narrowed to the effective config's chains.

### Tests

- Type contract: `packages/react/src/__tests__/hooks-type-inference.test-d.ts`
  (the react analogue of the client package's `type-inference.test-d.ts`). Run
  with `pnpm --filter @omnisat/lasereyes-react test:types` (vitest typecheck;
  wired via `vitest.config.ts` `typecheck.include`). Proves: configured-id
  narrowing on `network` / `networkId`; `switchNetwork` / `chainId` reject
  unconfigured ids (`@ts-expect-error`); `useAccount` connected branch non-null;
  read/write `success ⇒ data`; explicit `{ config }` flows its own generics.
- Runtime: `useBalance.test.tsx` (status discrimination + `config` / `chainId` /
  `enabled` / `queryContext` override plumbing) and the core query tests above.

### Maintenance discipline

Treat `hooks-type-inference.test-d.ts` like the client package's contract: any
change to a hook's public type/signature must come with a matching update there
(new option → assertion; new narrowing → `expectTypeOf`; new negative → a
`@ts-expect-error` block).

## Out of scope

Protocol hooks (alkanes/runes/brc20/inscriptions) and the stubbed wallet adapters
remain deferred per the original rebuild scope. Full per-call nanoquery option
passthrough (`refetchInterval`, `dedupeTime`, `cacheLifetime`, `revalidateOn*`)
is deferred — the builders already take an `options` bag, so it's an additive
extension when needed. Connector-id narrowing is intentionally not pursued
(connectors are dynamic; see Decisions above).
