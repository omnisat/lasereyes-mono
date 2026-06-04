# core-showcase

Minimal TS app that exercises `@omnisat/lasereyes-core` end-to-end. The view
layer is [Alpine.js](https://alpinejs.dev) — declarative bindings in
`index.html`, no virtual DOM, no build step — so the library usage stays
separated from the DOM plumbing.

## Structure

| File              | Responsibility                                                          |
| ----------------- | ----------------------------------------------------------------------- |
| `index.html`      | Declarative markup + Alpine bindings only (`x-text`, `@click`, `x-for`) |
| `src/styles.css`  | Styles                                                                  |
| `src/config.ts`   | lasereyes-core setup: `createLaserEyesConfig`, adapters, `initialize`   |
| `src/showcase.ts` | Alpine component: store→state bridge + one method per core action       |
| `src/main.ts`     | Entry — register the component, start Alpine                            |

The store→state bridge in `showcase.ts` (`$connection`/`$connectors`
`.subscribe(...)` → reactive Alpine fields) is the same job a React/Vue
binding does, in ~15 lines. The view only ever sees flat primitives, so the
showcase imports **zero types** from lasereyes — inference and a couple of
`typeof`-derived types carry everything.

## What it demonstrates

- **`createLaserEyesConfig`** with a typed chains tuple, transports, and the
  `unisat()` + `xverse()` connector factories.
- **EIP-6963-style discovery** via the per-wallet adapter loaders
  (`loadUnisatWalletAdapter()` / `loadXverseWalletAdapter()`) + the
  `$connectors` reactive store.
- **Phase 9 lifecycle actions** — `initialize`, `connect`, `disconnect`.
- **Phase 9 data actions** — `getAddressBalance` (which provider-first-falls-back
  through `getClient`).
- **Phase 9 wallet actions** — `sendBitcoin`, `signMessage`, `signPsbt`,
  `broadcastTransaction` — all routed through:
- **Phase 10 keystone** — `getWalletClient(config)` builds the bare wallet
  client, defers to the active connector's `getClient?` override (set for
  unisat/xverse via `injected({ nativeRpc: { sendBtc: true } })`), and
  hands the result to `getAction` for the call.

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

Open `http://localhost:5173`. Install Unisat or Xverse browser extension to
exercise the wallet paths.

## What you'll see

1. On load: announced wallets appear as buttons. Click one → `connect(config, …)`.
2. Once connected: the "Account" panel shows your address, network, and
   whether the connector applied a `getClient` override (`yes (nativeRpc)`
   for unisat/xverse).
3. Click **Send** with a destination + sats. Because the connector declared
   `nativeRpc: { sendBtc: true }`, `getWalletClient(config)` returns a client
   with `sendBtc` overridden to call `bitcoin_sendBitcoin` directly — one
   wallet prompt, wallet picks fees, wallet broadcasts. If you remove
   `nativeRpc` from the unisat connector and rebuild, the default composed
   path runs instead (build PSBT → sign → broadcast — two prompts).
4. **Sign message** and **Sign PSBT** route through `walletBtcActions`'
   `signer.signPsbt`/`signMessage` via the `providerSigner(provider)`
   bridge in the keystone.
