#!/usr/bin/env node
// Aggregate `dist/stats.html` (rollup-plugin-visualizer output) by package.
// Run after `pnpm analyze`.

import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const statsPath = path.join(__dirname, '..', 'dist', 'stats.html')
const html = fs.readFileSync(statsPath, 'utf8')

// Extract the `const data = {...}` block by brace-balancing.
const start = html.indexOf('const data = ')
if (start < 0) {
  console.error('Could not find data block in stats.html')
  process.exit(1)
}
let i = html.indexOf('{', start)
let depth = 0
let end = -1
for (; i < html.length; i++) {
  const ch = html[i]
  if (ch === '{') depth++
  else if (ch === '}') {
    depth--
    if (depth === 0) {
      end = i + 1
      break
    }
  }
}
const data = JSON.parse(html.slice(html.indexOf('{', start), end))

function packageOf(p) {
  if (!p) return '(unknown)'
  // Workspace packages we own.
  if (p.includes('packages/client')) return '@omnisat/lasereyes-client'
  if (p.includes('packages/core')) return '@omnisat/lasereyes-core'
  if (p.includes('apps/core-showcase')) return 'apps/core-showcase'
  // pnpm store path: .pnpm/<pkg>@<ver>/node_modules/<pkg>/...
  const m = p.match(/\.pnpm\/[^/]+\/node_modules\/((?:@[^/]+\/)?[^/]+)/)
  if (m) return m[1]
  // Direct node_modules paths.
  const m2 = p.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
  if (m2) return m2[1]
  return p
}

const bucket = new Map()
for (const part of Object.values(data.nodeParts)) {
  const meta = data.nodeMetas[part.metaUid]
  const filePath = meta?.id ?? '(unknown)'
  const pkg = packageOf(filePath)
  const cur = bucket.get(pkg) ?? { size: 0, files: 0 }
  cur.size += part.renderedLength ?? 0
  cur.files += 1
  bucket.set(pkg, cur)
}

const rows = [...bucket.entries()].map(([pkg, v]) => ({ pkg, ...v }))
rows.sort((a, b) => b.size - a.size)

const total = rows.reduce((a, r) => a + r.size, 0)
const fmt = n => n.toLocaleString()

console.log('package'.padEnd(45), 'size'.padStart(12), 'gz≈'.padStart(10), 'files'.padStart(7), '  %')
console.log('-'.repeat(86))
for (const r of rows) {
  const pct = `${((r.size / total) * 100).toFixed(1)}%`
  const gz = Math.round(r.size * 0.32) // rough estimate when per-leaf gzip is 0
  console.log(
    r.pkg.padEnd(45),
    fmt(r.size).padStart(12),
    fmt(gz).padStart(10),
    String(r.files).padStart(7),
    pct.padStart(6)
  )
}
console.log('-'.repeat(86))
console.log(
  'TOTAL'.padEnd(45),
  fmt(total).padStart(12),
  fmt(Math.round(total * 0.32)).padStart(10)
)
console.log('\nNote: gzip column is a rough 32% estimate (per-leaf gzip not reported by visualizer).')
