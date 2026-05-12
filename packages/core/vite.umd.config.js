/**
 * UMD build target — script-tag drop-in.
 *
 * Run via `pnpm build:umd` (sequenced after `pnpm build` so it lands
 * alongside the ESM dist without erasing it). The entry is
 * `src/umd.ts`, which curates the surface (every wallet except
 * Xverse — see that file's docblock for the rationale).
 *
 * Differs from the ESM build (`vite.config.js`) on three axes:
 *   - `formats: ['umd']` + a `name` so the bundle attaches to
 *     `window.LaserEyes` and registers itself with AMD/CommonJS loaders
 *     when present.
 *   - No `external` array — everything (`@omnisat/lasereyes-client`,
 *     `nanostores`, `@scure/*`, `@noble/*`, polyfills) is rolled into
 *     the single file. Drop-in users have no bundler to satisfy bare
 *     specifiers.
 *   - `emptyOutDir: false` so we don't wipe the ESM `dist/` produced
 *     by the primary build.
 *
 * @module vite.umd.config
 */

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['crypto'],
    }),
  ],
  build: {
    // Keep the ESM dist intact alongside the UMD output.
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/umd.ts'),
      formats: ['umd'],
      name: 'LaserEyes',
      fileName: () => 'lasereyes.umd.js',
    },
    rollupOptions: {
      // No externals — drop-in users have no module resolver.
      external: [],
      output: {
        // UMD can only be a single file; flatten any dynamic imports
        // (currently a no-op since `umd.ts` excludes the Xverse adapter
        // which holds the only `import('sats-connect')` callsite).
        inlineDynamicImports: true,
      },
    },
  },
})
