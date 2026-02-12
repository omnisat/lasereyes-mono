import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    rollupOptions: {
      external: [
        '@scure/btc-signer',
        '@scure/base',
        '@noble/hashes/ripemd160',
        '@noble/hashes/sha256',
      ],
    },
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'runes/index': resolve(__dirname, 'src/actions/runes/index.ts'),
        'brc20/index': resolve(__dirname, 'src/actions/brc20/index.ts'),
        'alkanes/index': resolve(__dirname, 'src/actions/alkanes/index.ts'),
        'inscriptions/index': resolve(__dirname, 'src/actions/inscriptions/index.ts'),
        'vendors/mempool/index': resolve(__dirname, 'src/vendors/mempool/index.ts'),
        'vendors/sandshrew/index': resolve(__dirname, 'src/vendors/sandshrew/index.ts'),
        'vendors/maestro/index': resolve(__dirname, 'src/vendors/maestro/index.ts'),
      },
      formats: ['es'],
    },
  },
})
