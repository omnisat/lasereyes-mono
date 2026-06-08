/**
 * UMD entry — script-tag drop-in surface.
 *
 * @remarks
 * Re-exports the subset of `@omnisat/lasereyes-core` that we ship in
 * the single-file UMD build (see `vite.umd.config.js`). The UMD bundle
 * is the "no-toolchain" path: drop in via `<script>` and read
 * everything off `window.LaserEyes`.
 *
 * **What's in the UMD:** core config + state + clients, actions,
 * detection primitives, every connector except Xverse, and every
 * adapter except Xverse — plus a Xverse-less `loadAllWallets`.
 *
 * **What's NOT in the UMD:** `xverse` connector + `XverseAdapter` +
 * `loadXverseWalletAdapter`. These pull in `sats-connect`, which drags
 * in `@sats-connect/core` + `jsontokens` + `elliptic` + `bn.js` + the
 * browserify polyfill chain (~600 kB raw). Loading that synchronously
 * into a UMD bundle would balloon the drop-in file past 1 MB and
 * defeat its purpose.
 *
 * Apps that need Xverse use the ESM build with a bundler instead, or
 * (TODO) a sibling `lasereyes-xverse.umd.js` that self-registers via
 * the EIP-6963 announcement channel.
 *
 * @module umd
 */

export * from './actions'
// Adapter classes + loader functions. Xverse omitted.
export { createLeatherAdapter, loadLeatherWalletAdapter } from './adapters/leather'
export { loadMagicEdenWalletAdapter, MagicEdenAdapter } from './adapters/magic-eden'
export { createOkxAdapter, loadOkxWalletAdapter } from './adapters/okx'
export { loadOrangeWalletAdapter, OrangeAdapter } from './adapters/orange'
export { loadOylWalletAdapter, OylAdapter } from './adapters/oyl'
export { createPhantomAdapter, loadPhantomWalletAdapter } from './adapters/phantom'
export { loadSparrowWalletAdapter, SparrowAdapter } from './adapters/sparrow'
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
export type { InjectedConnectorOptions } from './connectors'
// All connector factories except `xverse`.
export {
  binance,
  createConnector,
  injected,
  keplr,
  leather,
  magicEden,
  okx,
  opNet,
  orange,
  oyl,
  phantom,
  sparrow,
  tokeo,
  unisat,
  unisatLike,
  wizz,
} from './connectors'
// Detection primitives — but NOT `loadAllWallets`, which would pull in
// the xverse adapter through `detection/helpers.ts`. We define a
// UMD-safe replacement below.
export {
  announceWallet,
  discoverConnectors,
  listenForWalletAnnouncements,
} from './detection'
export * from './index'

import { loadLeatherWalletAdapter } from './adapters/leather'
import { loadMagicEdenWalletAdapter } from './adapters/magic-eden'
import { loadOkxWalletAdapter } from './adapters/okx'
import { loadOrangeWalletAdapter } from './adapters/orange'
import { loadOylWalletAdapter } from './adapters/oyl'
import { loadPhantomWalletAdapter } from './adapters/phantom'
import { loadSparrowWalletAdapter } from './adapters/sparrow'
import {
  loadBinanceWalletAdapter,
  loadKeplrWalletAdapter,
  loadOpNetWalletAdapter,
  loadTokeoWalletAdapter,
  loadUnisatWalletAdapter,
  loadWizzWalletAdapter,
} from './adapters/unisat'

/**
 * UMD-flavored `loadAllWallets` — same as the ESM helper, minus Xverse.
 *
 * @remarks
 * Mirrors `loadAllWallets()` from `detection/helpers.ts` but skips the
 * Xverse loader so the UMD bundle doesn't drag in the sats-connect
 * stack. Apps that need Xverse should use the ESM build.
 */
export function loadAllWallets(): void {
  loadUnisatWalletAdapter()
  loadBinanceWalletAdapter()
  loadWizzWalletAdapter()
  loadLeatherWalletAdapter()
  loadOkxWalletAdapter()
  loadOylWalletAdapter()
  loadMagicEdenWalletAdapter()
  loadPhantomWalletAdapter()
  loadOrangeWalletAdapter()
  loadOpNetWalletAdapter()
  loadSparrowWalletAdapter()
  loadTokeoWalletAdapter()
  loadKeplrWalletAdapter()
}
