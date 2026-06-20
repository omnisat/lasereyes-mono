---
'@omnisat/lasereyes-client': minor
'@omnisat/lasereyes-core': minor
'@omnisat/lasereyes-react': minor
'@omnisat/lasereyes': minor
---

Major architectural refactor

The library is rebuilt around a composable, framework-agnostic core: declare
your chains, backends, and connectors once as data, then extend a client with
the actions you need.

**New `@omnisat/lasereyes-client`** — a modern Bitcoin data client. Composable
chain backends (`mempool()`, `sandshrew()`, `maestro()`); pure utility builders (PSBT,
address) split from I/O actions; subpath exports for `/wallet`, `/utils`, and
`/backends/*`.

**`@omnisat/lasereyes-core`** — `createLaserEyesConfig({ chains, connectors,
backends })`, declarative wallet adapters, nanostores-backed state with a
**discriminated connection union**, and a `@nanostores/query` caching layer (cached reads +
explicit, revalidate-on-write mutations).

**`@omnisat/lasereyes-react`** — the monolithic `useLaserEyes()` hook is
**removed** in favor of focused, query-backed hooks: `useConnect`, `useAccount`,
`useNetwork`, `useConnectors`/`useConnector`, `useBalance`, `useFeeRates`,
`useUtxos` (cursor-paginated), `useSendBitcoin`, `useSignPsbt`,
`useSignMessage`, plus broadcast mutations. Wallets are discovered at runtime
(EIP-6963-style) instead of hardcoded `hasX` booleans. Adds a typed `Register`
seam so `network`/`chainId` are inferred without threading `config` through
every call.

**`@omnisat/lasereyes`** — now simply re-exports the new React surface (which
itself re-exports core). The legacy `useLaserEyes`, `useBitcoinFees`,
`useAlkanesList`, and `useAddressTokens` APIs are gone.

Modular packages with `sideEffects: false` mean you pay only for the wallets and
backends you import — roughly a 71% smaller transfer (~1,244 kB → ~357 kB gzip)
for a minimal connect + balance + send + sign app.
