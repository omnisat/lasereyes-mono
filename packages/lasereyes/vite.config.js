import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'LaserEyes',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      // Should export react and core libraries as a separate output
    },
  },
})
