import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5173 },
  build: {
    // Sourcemaps make the visualizer treemap useful — it attributes
    // bytes back to the original source files.
    sourcemap: true,
    // Multi-page app: `/` is the Alpine core showcase, `/react.html` is the
    // React showcase. Both share styles.css.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        react: resolve(__dirname, 'react.html'),
      },
    },
  },
  plugins: [
    // The React plugin only transforms the .tsx under src/react/**; the Alpine
    // side is untouched.
    react(),
    // Run `pnpm analyze` to build with the bundle report.
    process.env.ANALYZE
      ? visualizer({
          filename: 'dist/stats.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
          sourcemap: true,
        })
      : null,
  ],
})
