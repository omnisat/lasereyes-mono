import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  server: { port: 5173 },
  build: {
    // Sourcemaps make the visualizer treemap useful — it attributes
    // bytes back to the original source files.
    sourcemap: true,
  },
  plugins: [
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
