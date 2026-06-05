import { resolve } from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    dts(),
    nodePolyfills({
      include: ['crypto'],
    }),
    process.env.ANALYZE
      ? visualizer({
          filename: 'dist/stats.html',
          template: 'treemap',
          gzipSize: true,
          sourcemap: true,
        })
      : null,
  ],
  build: {
    sourcemap: !!process.env.ANALYZE,
    lib: {
      // Multi-entry so consumers can subpath-import the parts they need.
      // Each entry produces its own ESM file in dist; sideEffects: false
      // on package.json then lets tree-shaking drop unused entries
      // entirely from the consumer bundle.
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        // Action surface
        actions: resolve(__dirname, 'src/actions/index.ts'),
        // Query layer — @nanostores/query caching/dedup over the actions,
        // exports isolated per action: read FetcherStores (balance, utxos,
        // fees, transaction) + write MutatorStores (send, sign, broadcast).
        query: resolve(__dirname, 'src/query/index.ts'),
        // Detection (announceWallet, listenForWalletAnnouncements, discoverConnectors, loadAllWallets)
        detection: resolve(__dirname, 'src/detection/index.ts'),
        // Aggregate connectors barrel — re-exports every wallet's
        // connector factory. Consumers who want a single import site
        // (`import { unisat, xverse } from '.../connectors'`) use this;
        // tree-shaking + sideEffects: false drops the unused ones.
        connectors: resolve(__dirname, 'src/connectors/index.ts'),
        // Per-wallet connector factories. Each is the wallet's identity
        // + getProvider; pulls in only that wallet's adapter chain.
        'connectors/unisat': resolve(__dirname, 'src/connectors/unisat.ts'),
        'connectors/xverse': resolve(__dirname, 'src/connectors/xverse.ts'),
        'connectors/leather': resolve(__dirname, 'src/connectors/leather.ts'),
        'connectors/okx': resolve(__dirname, 'src/connectors/okx.ts'),
        'connectors/magic-eden': resolve(__dirname, 'src/connectors/magic-eden.ts'),
        'connectors/oyl': resolve(__dirname, 'src/connectors/oyl.ts'),
        'connectors/phantom': resolve(__dirname, 'src/connectors/phantom.ts'),
        'connectors/orange': resolve(__dirname, 'src/connectors/orange.ts'),
        'connectors/op-net': resolve(__dirname, 'src/connectors/op-net.ts'),
        'connectors/sparrow': resolve(__dirname, 'src/connectors/sparrow.ts'),
        'connectors/tokeo': resolve(__dirname, 'src/connectors/tokeo.ts'),
        'connectors/keplr': resolve(__dirname, 'src/connectors/keplr.ts'),
        // Per-wallet adapters + loaders. Loaders auto-announce via
        // detection; importing the wallet's adapter subpath is enough.
        'adapters/unisat': resolve(__dirname, 'src/adapters/unisat.ts'),
        'adapters/xverse': resolve(__dirname, 'src/adapters/xverse.ts'),
        'adapters/leather': resolve(__dirname, 'src/adapters/leather.ts'),
        'adapters/okx': resolve(__dirname, 'src/adapters/okx.ts'),
        'adapters/magic-eden': resolve(__dirname, 'src/adapters/magic-eden.ts'),
        'adapters/oyl': resolve(__dirname, 'src/adapters/oyl.ts'),
        'adapters/phantom': resolve(__dirname, 'src/adapters/phantom.ts'),
        'adapters/orange': resolve(__dirname, 'src/adapters/orange.ts'),
        'adapters/op-net': resolve(__dirname, 'src/adapters/op-net.ts'),
        'adapters/sparrow': resolve(__dirname, 'src/adapters/sparrow.ts'),
        'adapters/tokeo': resolve(__dirname, 'src/adapters/tokeo.ts'),
        'adapters/keplr': resolve(__dirname, 'src/adapters/keplr.ts'),
      },
      formats: ['es'],
    },
  },
})
