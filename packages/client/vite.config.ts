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
        'backends/index': resolve(__dirname, 'src/backends/index.ts'),
        'backends/mempool/index': resolve(__dirname, 'src/backends/mempool/index.ts'),
        'backends/sandshrew/index': resolve(__dirname, 'src/backends/sandshrew/index.ts'),
        'backends/maestro/index': resolve(__dirname, 'src/backends/maestro/index.ts'),
      },
      formats: ['es'],
    },
  },
})
