/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // to enable describe, it, expect globally
    environment: 'node', // use 'jsdom' if testing browser environments
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/build/**'],
    coverage: {
      provider: 'v8', // for coverage using V8
      reportsDirectory: './coverage',
      reporter: ['text', 'json', 'html'],
    },
  },
})
