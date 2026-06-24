# Demo features removed during the major-refactor migration

The demo was migrated from the legacy `useLaserEyes` mega-hook (via
`@omnisat/lasereyes`) to the new query-backed hooks in
`@omnisat/lasereyes-react`. A few features had **no equivalent in the new API
yet** and were removed in that pass. This file records what was dropped and how
to bring each back, so nothing is lost.

> Status as of this migration. The new API surface is documented in the docs app
> (`apps/lasereyes-docs`).

## 1. Protocol balances & sends — Runes, BRC-20, Alkanes

**Removed components:** `RunesSection.tsx`, `Brc20Section.tsx`,
`AlkanesSection.tsx`.

**Old API (gone):**

- `getMetaBalances('runes' | 'brc20' | 'alkanes')` — fetch holdings.
- `send('runes' | 'brc20' | 'alkanes', { … })` — transfer a protocol asset.

**Why:** The protocol action groups for runes, BRC-20, and alkanes are designed
and scaffolded in `@omnisat/lasereyes-client` (`src/actions/<proto>`) but **not
yet exported** — they're deferred pending implementation of their write paths
(runes first). See `packages/client/FUTURE-IMPROVEMENTS.md`.

**Re-add when:** the client package exports the protocol action groups. Then add
read hooks for balances and write hooks for sends, and restore the section
components.

## 2. Inscriptions

**Removed components:** `InscriptionsSection.tsx`, `NFT.tsx` (inscription
renderer).

**Old API (gone):**

- `getInscriptions()` — list the wallet's inscriptions.
- `sendInscriptions(ids, toAddress)` — transfer inscriptions.
- `inscribe(contentBase64, contentType)` — create an inscription.

**Why:** Same as above — inscriptions are part of the deferred protocol surface.

**Re-add when:** the client package exports the inscriptions action group.

## 3. Pre-built connection modal — `@omnisat/lasereyes-ui`

**Removed route:** `app/ui/` (the entire UI showcase page and its layout).

**Old API (gone):** `LaserEyesModalProvider`, `ConnectWalletButton`,
`ConnectWalletModal`, `ThemeControls`, `useTheme` from `@omnisat/lasereyes-ui`.

**Why:** `packages/ui` still targets the old `useLaserEyes` mega-hook across its
modal/profile components and has not been migrated to the new hooks, so it does
not build. The demo no longer depends on it.

**Re-add when:** `packages/ui` is migrated to the new `@omnisat/lasereyes-react`
hooks. Then restore `app/ui/layout.tsx` + `app/ui/page.tsx` (and re-add the
`@omnisat/lasereyes-ui` dependency).

## 4. Auto-built PSBT from wallet UTXOs

**Removed:** `hooks/useUtxos.tsx` (UTXO context) and the PSBT-building helpers in
`lib/btc.ts` (`createPsbt`, `getBitcoinNetwork`, `getRedeemScript`, …).

**Old behavior:** the demo fetched the payment address' UTXOs and automatically
constructed an unsigned PSBT (self-send) for the sign/finalize/broadcast demo.

**Now:** the PSBT panel takes a **pasted PSBT hex** and exercises
`useSignPsbt` / `useBroadcastPsbt`. The "send BTC" button still performs a real
transaction via `useSendBitcoin`.

**Re-add when:** wire `useUtxos()` + `buildSendBtcPsbt(...)` from
`@omnisat/lasereyes-client/utils` to reconstruct the auto-build flow on the new
stack.

## 5. `has<Wallet>` flags

**Old API (gone):** `hasUnisat`, `hasXverse`, `hasOyl`, `hasOkx`, `hasLeather`,
`hasPhantom`, `hasWizz`, `hasOrange`, `hasOpNet`, `hasTokeo`, `hasKeplr`,
`hasBinance`, `hasMagicEden`, `hasSparrow`.

**Replacement:** `useConnectors()` returns the available connectors; use
`connector.isReady()` to tell whether each wallet is installed. Magic Eden and
Sparrow are no longer supported wallets.

## 6. `WalletIcon` and per-wallet logo components

**Old API (currently unavailable):** `WalletIcon`, `UnisatLogo`, `XverseLogo`,
etc. from the React package.

**Note:** In the current working tree these icon components are removed from
`@omnisat/lasereyes-react` (only `LaserEyesLogo` remains). The demo now renders
each wallet's icon from `connector.icon` (a URL/data URI on the connector). If
the per-wallet icon components return, `WalletIcon` usage can be restored.
