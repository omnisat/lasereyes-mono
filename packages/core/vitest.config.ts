/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

// Node-env unit tests for the framework-agnostic core. Scoped to this
// package so `turbo test` runs it in isolation (with caching). The
// type-level contract (`src/__tests__/type-inference.test-d.ts`) is checked
// separately via `pnpm typecheck` (tsc against tsconfig.typecheck.json).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
  },
})
