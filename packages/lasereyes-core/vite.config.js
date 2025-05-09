import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    dts(),
    nodePolyfills({
      include: ['crypto'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      outputDir: 'dist/types',
      name: 'LaserEyes',
      fileName: 'index',
    },
  },
})
