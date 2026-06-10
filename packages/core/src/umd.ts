/**
 * UMD entry — script-tag drop-in surface.
 *
 * @remarks
 * Re-exports the full `@omnisat/lasereyes-core` wallet surface into a
 * single file (built via `vite build --mode umd`). The UMD bundle is the
 * "no-toolchain" path: drop in via `<script>` and read everything off
 * `window.LaserEyes`.
 *
 * Every wallet is included — adapters, connectors, and loaders — plus the
 * canonical {@link loadAllWallets}. (Xverse used to be omitted because it
 * pulled in `sats-connect`; the adapter now talks to
 * `window.XverseProviders.BitcoinProvider` directly, so there's nothing
 * heavy left to exclude.)
 *
 * @module umd
 */

export * from './actions'
// Per-wallet adapter factories + loaders.
export { createLeatherAdapter, loadLeatherWalletAdapter } from './adapters/leather'
export { createOkxAdapter, loadOkxWalletAdapter } from './adapters/okx'
export { createOrangeAdapter, loadOrangeWalletAdapter } from './adapters/orange'
export { createOylAdapter, loadOylWalletAdapter } from './adapters/oyl'
export { createPhantomAdapter, loadPhantomWalletAdapter } from './adapters/phantom'
// Tokeo, Keplr, and OP_NET are Unisat-API clones — their loaders reuse
// UnisatAdapter and live in `./adapters/unisat`.
export {
  loadBinanceWalletAdapter,
  loadKeplrWalletAdapter,
  loadOpNetWalletAdapter,
  loadTokeoWalletAdapter,
  loadUnisatWalletAdapter,
  loadWizzWalletAdapter,
  UnisatAdapter,
} from './adapters/unisat'
export { createXverseAdapter, loadXverseWalletAdapter } from './adapters/xverse'
export type { InjectedConnectorOptions } from './connectors'
// All connector factories.
export {
  binance,
  createConnector,
  injected,
  keplr,
  leather,
  okx,
  opNet,
  orange,
  oyl,
  phantom,
  tokeo,
  unisat,
  unisatLike,
  wizz,
  xverse,
} from './connectors'
// Detection — including the canonical `loadAllWallets` (now safe to ship
// in the UMD: it loads Xverse too, with no sats-connect baggage).
export {
  announceWallet,
  discoverConnectors,
  listenForWalletAnnouncements,
  loadAllWallets,
} from './detection'
export * from './index'
