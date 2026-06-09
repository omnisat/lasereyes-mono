# Old vs. New — code-simplicity comparison

Companion to the showcase video. Every snippet below is the **real** API as it
exists in this repo (legacy from the `demo.lasereyes.build` app, new from the
two `core-showcase` paths). Use it as the side-by-side reference / slides.

- **Legacy** — the single `useLaserEyes()` monolith.
- **New · React** — `@omnisat/lasereyes-react` hooks (`react.html` path).
- **New · Core** — `@omnisat/lasereyes-core` actions driving Alpine (`/` path).

The thesis for the video: **one fat hook → focused hooks; booleans you have to
trust → discriminated unions the compiler proves; imperative calls → cached
reads + explicit mutations.**

---

## 0. The headline

```tsx
// LEGACY — one hook, ~40 fields, 14 of them wallet-detection booleans
const {
  address, provider, network, paymentAddress, paymentPublicKey,
  getBalance, pushPsbt, publicKey, signPsbt, balance, switchNetwork,
  hasUnisat, signMessage, hasXverse, sendBTC,
  hasOyl, hasMagicEden, hasOkx, hasLeather, hasPhantom, hasWizz,
  hasSparrow, hasOrange, hasOpNet, hasTokeo, hasKeplr, hasBinance,
} = useLaserEyes()
```

```tsx
// NEW · React — take only what the component needs
const account = useAccount()
const balance = useBalance(account.paymentAddress ?? '')
const send    = useSendBitcoin()
```

One destructure of everything vs. three hooks scoped to the job. Every wallet is
discovered at runtime (EIP-6963-style) instead of a hardcoded `hasX` flag per
wallet, so adding a wallet no longer widens the hook's return type.

---

## 1. Setup / config

```ts
// NEW · Core (apps/core-showcase/src/config.ts)
import { MAINNET, TESTNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { createLaserEyesConfig } from '@omnisat/lasereyes-core'
import { initialize } from '@omnisat/lasereyes-core/actions'
import { loadUnisatWalletAdapter, loadXverseWalletAdapter } from '@omnisat/lasereyes-core/adapters'
import { unisat } from '@omnisat/lasereyes-core/connectors/unisat'

export const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET],
  connectors: [unisat()],
  backends: { mainnet: mempool(), testnet: mempool() },
})

loadUnisatWalletAdapter()
loadXverseWalletAdapter()
initialize(config)            // core path owns initialize
```

```ts
// NEW · React (apps/core-showcase/src/react/config.ts)
// Same config — but NO initialize(): the provider owns the lifecycle.
export const config = createLaserEyesConfig({ chains: [MAINNET, TESTNET], connectors: [unisat()], backends: { mainnet: mempool(), testnet: mempool() } })

// wagmi-style typed register: narrows network/chainId everywhere, no per-call config threading
declare module '@omnisat/lasereyes-react' {
  interface Register { config: typeof config }
}
```

```tsx
// NEW · React — provider wraps the app, that's the whole wiring
<LaserEyesProvider config={config}>
  <ConnectionPanel /><ReadsPanel /><WritesPanel />
</LaserEyesProvider>
```

Talking point: chains, backends, and connectors are declared once as data. The
React app never calls `initialize` — the provider does — and the `Register`
augmentation makes `network`/`chainId` type-safe without passing `config` to
every hook.

---

## 2. Connect a wallet

```tsx
// LEGACY — provider identity is a string you compare by hand,
// and you read the per-wallet hasX flag to know if it's installed
const { connect, disconnect, provider, hasUnisat, hasXverse, /* …12 more */ } = useLaserEyes()
const isConnected = provider === walletName
// connect('UNISAT')  — string union of provider names
```

```tsx
// NEW · React (ConnectionPanel.tsx) — connectors are data; status is explicit
const { connect, isPending, error } = useConnect()
const connectors = useConnectors()
const active = useConnector()

connectors.map(c => <button disabled={!c.ready} onClick={() => connect(c.id)}>{c.name}</button>)
```

```ts
// NEW · Core (showcase.ts) — same action, config threaded as first arg
async connect(connectorId) {
  const result = await connect(config, { connectorId })
  return `connected on '${result.networkId}' as ${result.account.getAddress()}`
}
```

---

## 3. Account / connection state

```ts
// LEGACY — flat booleans. `connected` is true, but `address` can still be ''.
//          Nothing ties the boolean to the field being populated.
connected: boolean
address: string            // "" until populated — compiler can't help you
paymentAddress: string
publicKey: string
```

```tsx
// NEW · React (ConnectionPanel.tsx) — discriminated union: the check proves the fields
const account = useAccount()
if (account.status === 'connected') {
  account.paymentAddress   // string  (guaranteed non-null in this branch)
  account.publicKey        // string  (guaranteed non-null in this branch)
}
// otherwise: paymentAddress/publicKey are `string | undefined` and TS enforces the guard
```

```ts
// NEW · Core (showcase.ts) — subscribe once, view sees flat primitives
config.state.$connection.subscribe(({ status, account, networkId, connector }) => {
  this.status = status
  this.address = account?.getAddress() ?? '—'
  this.networkId = networkId
})
```

Talking point: in the legacy API you trust `connected` then hope `address` is
filled. The new `useAccount()` makes the connected fields **provably** present —
delete the `?? '—'` fallbacks, the compiler has your back.

---

## 4. Read: balance (and the cross-chain footgun)

```ts
// LEGACY — imperative, returns a string, no caching, no status
const { getBalance, balance } = useLaserEyes()
await getBalance()     // fire it yourself; `balance` is number | undefined
```

```tsx
// NEW · React (ReadsPanel.tsx) — cached query with discriminated status
const balance = useBalance(paymentAddress ?? '', { chainId: readChain, enabled: pollBalance })
if (balance.status === 'success') {
  balance.data   // string sats, guaranteed
}
```

The overload **requires an explicit `address`** to pass `{ chainId }`, so you
can't silently read the active account's address against a foreign chain — the
old "switch to testnet → balance error" bug is now unrepresentable. Reads also
auto-revalidate and expose TanStack-style `isLoading` (first load) vs
`isFetching` (any fetch, incl. background).

---

## 5. Read: UTXOs — now paginated

```ts
// LEGACY — one call, whole list, no cursor
const { getUtxos } = useLaserEyes()
const utxos = await getUtxos(address)   // MempoolUtxo[] — all of it
```

```tsx
// NEW · React (ReadsPanel.tsx) — cursor pagination built in
const utxos = useUtxos()
utxos.items            // UTXO[] accumulated across pages
<button onClick={() => utxos.fetchNextPage()} disabled={!utxos.hasNextPage || utxos.isFetchingNextPage}>
  {utxos.isFetchingNextPage ? 'Loading…' : 'Load more'}
</button>
```

---

## 6. Write: send BTC

```ts
// LEGACY — method off the monolith, you track state yourself
const { sendBTC } = useLaserEyes()
const txid = await sendBTC(to, amount)   // no isLoading/status/txId surface
```

```tsx
// NEW · React (WritesPanel.tsx) — mutation with built-in status + txId
const send = useSendBitcoin()
<button onClick={() => send.sendBitcoin({ to, amount })} disabled={!connected || send.isLoading}>Send</button>
<code>{send.status}</code>
{send.txId && <code>{send.txId}</code>}
```

```ts
// NEW · Core (showcase.ts)
async send() {
  const txId = await sendBtc(config, this.sendTo.trim(), Number(this.sendAmount))
  return `txId: ${txId}`
}
```

---

## 7. Write: sign message

```ts
// LEGACY
const { signMessage } = useLaserEyes()
const sig = await signMessage(message)
```

```tsx
// NEW · React (WritesPanel.tsx)
const sign = useSignMessage()
<button onClick={() => sign.signMessage({ message })} disabled={!connected || sign.isLoading}>Sign</button>
{sign.status === 'success' && <code>{sign.data}</code>}
```

---

## 8. Write: sign PSBT

```ts
// LEGACY
const { signPsbt, pushPsbt } = useLaserEyes()
const signed = await signPsbt(psbtHex)
await pushPsbt(signed)
```

```tsx
// NEW · React (WritesPanel.tsx) — explicit options, plus dedicated broadcast mutations
const psbt = useSignPsbt()
psbt.signPsbt({ psbt: psbtHex, options: { finalize: true } })

const psbtBroadcast = useBroadcastPsbt()
psbtBroadcast.broadcastPsbt({ psbt: psbtHex })          // sign + send in one

const rawBroadcast = useBroadcastTransaction()
rawBroadcast.broadcastTransaction({ rawTx: signedTxHex }) // raw hex
```

Honest caveat (worth showing as "feedback we acted on"): there's no
build-and-sign one-liner yet. To produce the PSBT hex the app wires
`useUtxos` + `useFeeRates` + `useAccount` (address + `getPublicKey()`) through
`buildSendBtcPsbt` itself — the taproot `publicKey` is required and easy to miss.

---

## 9. Network switching

```ts
// LEGACY — switchNetwork(network) off the monolith; chains list not provided
const { switchNetwork, network } = useLaserEyes()
```

```tsx
// NEW · React (ConnectionPanel/ReadsPanel) — useNetwork() hands you the chains too
const { network, chains, switchNetwork } = useNetwork()
chains.map(id => <button disabled={id === network} onClick={() => switchNetwork(id)}>{id}</button>)
```

No separate `useConfig().chains` needed to render a switcher.

---

## Bundle size — measured, not estimated

Two **identical** minimal Vite apps (same `vite@5.4.11`, `react@18.3.1`,
`@vitejs/plugin-react@4.3.4`, esbuild minify, no sourcemap). The *only* variable
is the library + the API surface used. Both apps do the same thing: provide a
config, connect, read balance, send BTC, sign a message.

- **Legacy app** → published `@omnisat/lasereyes@0.0.163` (the pre-refactor
  monolith; `useLaserEyes`). Note: the legacy API no longer exists in this repo
  — the React package was rebuilt — so the only honest "old" baseline is the
  published npm package.
- **New app** → the current workspace packages (`-client` / `-core` / `-react`),
  consumed via `pnpm pack` tarballs since the new API isn't published yet.

Gzip measured directly on the emitted chunks (`gzip -9`), not just Vite's report:

| Metric                  | Legacy (`@omnisat/lasereyes`) | New (modular)        | Δ            |
| ----------------------- | ----------------------------- | -------------------- | ------------ |
| Production JS, **raw**  | 4,136 kB                      | 1,102 kB             | −73%         |
| Production JS, **gzip** | **1,244 kB**                  | **357 kB**           | **−71%**     |
| npm packages installed  | 535                           | 201                  | −334         |
| Wallets in the bundle   | all (~14, always)             | only those imported  | unisat+xverse here |

**≈3.5× smaller transfer** (saves ~887 kB gzip). Why: the legacy package is one
chunk that bundles core + react + every wallet whether you use them or not; the
new packages are modular with `sideEffects: false`, so importing only
`unisat()` + `xverse()` + `mempool()` lets the bundler drop the rest.

**Honest framing for the video:** this is a per-import comparison — the new
number reflects an app that wires up two wallets. The selling point is *"you pay
only for what you import,"* not a fixed floor. Say that out loud; don't imply the
new lib is always 357 kB regardless of usage.

### Reproduce it

```bash
# from repo root — pack the new (unpublished) packages
for p in client core react; do (cd packages/$p && pnpm pack --pack-destination /tmp/le-pkgs); done

# two standalone apps (outside the monorepo so workspace:* doesn't shadow npm):
#   legacy/  → deps: "@omnisat/lasereyes": "0.0.163"
#   new/     → deps: file:/tmp/le-pkgs/*.tgz  (client+core+react)
# identical vite.config.ts, index.html, src/main.tsx, src/App.tsx per §0–§9
npm install && npx vite build      # in each
gzip -9 -c dist/assets/*.js | wc -c # authoritative gzip bytes
```

The two `App.tsx` files are the legacy-vs-new snippets from §2/§4/§6/§7 above,
nothing more.

## Suggested screen order for the video

1. **Config** (§1) — "declare chains/backends/connectors once."
2. **Connect** (§2) — click a discovered wallet button, live in both showcases.
3. **Account state** (§3) — hover the `if (status === 'connected')` branch in
   the editor; show the field going non-null. This is the strongest
   "code simplicity" beat.
4. **Balance** (§4) — switch network, show no crash (the footgun is gone).
5. **Send / Sign** (§6–8) — fire a mutation, watch `status` → `success` → `txId`
   update with zero hand-written loading state.
6. Close on **§0 headline** side-by-side: 40-field destructure vs. three hooks.

Same script runs against both `/` (Alpine + core actions) and `/react.html`
(React hooks) — the core-action column and the hook column are the same
operations, which is itself the point: the new surface is consistent whether or
not you use React.
