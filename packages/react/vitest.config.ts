/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vitest/config'

// React bindings need a DOM + JSX transform, so they get their own config
// (the root vitest config is node-env and only matches *.test.ts).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // `vitest typecheck` runs the type-level contract (`*.test-d.ts`) — the
    // React analogue of the client package's `type-inference.test-d.ts`. It uses
    // a tsconfig that includes `src` and resolves `@omnisat/lasereyes-core`.
    typecheck: {
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.app.json',
    },
  },
})
