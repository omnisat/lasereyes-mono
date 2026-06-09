# core-showcase

Two showcases in one Vite app, sharing `src/styles.css`:

- **`/`** — `@omnisat/lasereyes-core` driven directly, view layer is
  [Alpine.js](https://alpinejs.dev). The library usage stays separated from the
  DOM plumbing.
- **`/react.html`** — `@omnisat/lasereyes-react` driven the way an app would,
  exercising **every** exported hook. This is the "standard environment" path —
  plain React 19 + Vite, idiomatic `useState` forms, no extra cleverness.

## Structure

| File                          | Responsibility                                                          |
| ----------------------------- | ----------------------------------------------------------------------- |
| `index.html`                  | Alpine markup + bindings (`x-text`, `@click`, `x-for`)                  |
| `src/styles.css`              | Shared styles (both paths)                                              |
| `src/config.ts`               | core setup: `createLaserEyesConfig`, adapters, `initialize`            |
| `src/showcase.ts`             | Alpine component: store→state bridge + one method per core action       |
| `src/main.ts`                 | Alpine entry                                                            |
| `react.html`                  | React entry document (`#root`)                                          |
| `src/react/config.ts`         | react setup: config + `Register` augmentation (no `initialize` — the provider owns it) |
| `src/react/main.tsx`          | `createRoot` + `<StrictMode>`                                          |
| `src/react/App.tsx`           | `<LaserEyesProvider>` + layout                                          |
| `src/react/ConnectionPanel.tsx` | useStatus, useConnectors, useConnect, useConnector, useDisconnect, useAccount, useNetwork, useConfig |
| `src/react/ReadsPanel.tsx`    | useBalance, useUtxos, useFeeRates, useTransaction (+ `chainId`/`enabled` overrides, + `useUtxos` cursor pagination via "Load more") |
| `src/react/WritesPanel.tsx`   | useSendBitcoin, useSignMessage, useSignPsbt, useBroadcastPsbt, useBroadcastTransaction |

## React path — frictions observed

Building the React showcase against the actual package surfaced a few rough
edges (kept here as honest feedback, not blockers):

1. **`Register` placement.** To get `network` / `chainId` narrowed to the
   configured chains without threading `{ config }` everywhere, you write a
   `declare module '@omnisat/lasereyes-react'` augmentation. It works, but it's
   global and easy to forget — and there's no runtime hint when you do.
2. **The provider owns `initialize`/`dispose`.** Unlike the core path, the
   React app must **not** call `initialize(config)` itself (the provider does,
   in an effect). Not obvious from the types; double-init is silent.
3. **`chainId` from a `<select>` needs a cast.** `onChange` hands you a
   `string`; `chainId` is narrowed to the configured-id union, so you assert
   `e.target.value as ConfigNetworkId`. Expected, but a paper cut.
4. **No "build + sign PSBT" hook.** `useSignPsbt` wants a PSBT hex, so the app
   assembles one itself from `useUtxos` + `useFeeRates` + `useAccount`
   (address + `getPublicKey()`) + `buildSendBtcPsbt`. That's a lot of wiring for
   what reads like a one-liner; the taproot `publicKey` requirement is also easy
   to miss (wallets sign nothing without it).

What worked cleanly: the discriminated results (`if (q.status === 'success')`
gives you `data: T`), the `useAccount` connected-branch narrowing (no null
checks on `account`/`connector`), and per-call `{ enabled }` / `{ config }`.

Resolved since:

- `useUtxos` was originally a single page with a dangling `nextCursor`. It now
  accumulates pages — `items` / `fetchNextPage()` / `hasNextPage` /
  `isFetchingNextPage` — on a reusable internal primitive (`useInfiniteFetcher`)
  that the other paginated reads can adopt.
- `useNetwork()` now returns the configured **`chains`** alongside `network` +
  `switchNetwork`, so a network switcher needs no separate `useConfig().chains`.
- `useBalance` / `useUtxos` now make the cross-chain footgun unrepresentable: an
  overload requires an **explicit `address`** to pass `{ chainId }`, so the
  active-account default address can't be silently read against a foreign chain
  (which is what produced the "switch to testnet → balance error" bug). The
  selector here passes `paymentAddress` explicitly.
- `useAccount`'s **connected branch** now guarantees the primary `paymentAddress`
  / `address` / `publicKey` are `string` (not `string | undefined`), so the
  panel drops the `?? '—'` on those after `status === 'connected'`.
- Result types (`UTXO`, `Transaction`, `FeeEstimate`, `PaginatedResult`, …) are
  re-exported from `@omnisat/lasereyes-core` (and thus `@omnisat/lasereyes-react`),
  so you can name a hook's result type without importing the client package.
- Read results renamed the ambiguous `loading` → **`isFetching`** (any fetch,
  incl. background revalidation) and kept **`isLoading`** (first load, no data) —
  TanStack semantics. Mutations drop the redundant `loading`, keeping `isLoading`.

The store→state bridge in `showcase.ts` (`$connection`/`$connectors`
`.subscribe(...)` → reactive Alpine fields) is the same job a React/Vue
binding does, in ~15 lines. The view only ever sees flat primitives, so the
showcase imports **zero types** from lasereyes — inference and a couple of
`typeof`-derived types carry everything.

## What it demonstrates

- **`createLaserEyesConfig`** with a typed chains tuple, transports, and the
  `unisat()` + `leather()` + `okx()` connector factories
  (registered explicitly so each appears even when its extension is absent).
- **EIP-6963-style discovery** via the per-wallet adapter loaders
  (`loadUnisatWalletAdapter()` / `loadXverseWalletAdapter()`) + the
  `$connectors` reactive store — Xverse surfaces purely through this path.
- **Phase 9 lifecycle actions** — `initialize`, `connect`, `disconnect`.
- **Phase 9 data actions** — `getAddressBalance` (which provider-first-falls-back
  through `getClient`).
- **Phase 9 wallet actions** — `sendBitcoin`, `signMessage`, `signPsbt`,
  `broadcastTransaction` — all routed through:
- **Phase 10 keystone** — `getWalletClient(config)` builds the bare wallet
  client, defers to the active connector's `getClient?` override (set for
  unisat/xverse/leather/okx via `injected({ nativeRpc: { sendBtc: true } })`),
  and hands the result to `getAction` for the call.

The UI surfaces, in real time:

- Whether the active connector ships a `getClient` override (the visible
  Phase 10 contract).
- Each call's flow path in a trace panel.
- `window.laserEyes.{ config, getWalletClient }` for poking around in
  devtools.

## Run

```bash
pnpm install
pnpm --filter core-showcase dev
```

Open `http://localhost:5173`. Install a Unisat, Xverse, Leather, or OKX
browser extension to exercise the wallet paths.

## What you'll see

1. On load: announced wallets appear as buttons. Click one → `connect(config, …)`.
2. Once connected: the "Account" panel shows your address, network, and
   whether the connector applied a `getClient` override (`yes (nativeRpc)`
   for unisat/xverse/leather/okx).
3. Click **Send** with a destination + sats. Because the connector declared
   `nativeRpc: { sendBtc: true }`, `getWalletClient(config)` returns a client
   with `sendBtc` overridden to call `bitcoin_sendBitcoin` directly — one
   wallet prompt, wallet picks fees, wallet broadcasts. If you remove
   `nativeRpc` from the unisat connector and rebuild, the default composed
   path runs instead (build PSBT → sign → broadcast — two prompts).
4. **Sign message** and **Sign PSBT** route through `walletBtcActions`'
   `signer.signPsbt`/`signMessage` via the `providerSigner(provider)`
   bridge in the keystone.
