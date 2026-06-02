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
        'wallet/index': resolve(__dirname, 'src/wallet.ts'),
        'utils/index': resolve(__dirname, 'src/utils.ts'),
        'runes/index': resolve(__dirname, 'src/runes.ts'),
        'brc20/index': resolve(__dirname, 'src/brc20.ts'),
        'inscriptions/index': resolve(__dirname, 'src/inscriptions.ts'),
        'vendors/mempool/index': resolve(
          __dirname,
          'src/vendors/mempool/index.ts'
        ),
        'vendors/sandshrew/index': resolve(
          __dirname,
          'src/vendors/sandshrew/index.ts'
        ),
        'vendors/maestro/index': resolve(
          __dirname,
          'src/vendors/maestro/index.ts'
        ),
      },
      formats: ['es'],
    },
  },
})
