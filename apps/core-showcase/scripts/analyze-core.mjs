#!/usr/bin/env node
// Variant of analyze.mjs that points at packages/core/dist/stats.html.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const statsPath = path.join(__dirname, '..', '..', '..', 'packages', 'core', 'dist', 'stats.html')
const html = fs.readFileSync(statsPath, 'utf8')

const start = html.indexOf('const data = ')
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
  if (p.includes('packages/client')) return '@omnisat/lasereyes-client'
  if (p.includes('packages/core/src')) return '@omnisat/lasereyes-core (own src)'
  if (p.includes('packages/core/dist')) return '@omnisat/lasereyes-core (dist)'
  const m = p.match(/\.pnpm\/[^/]+\/node_modules\/((?:@[^/]+\/)?[^/]+)/)
  if (m) return m[1]
  const m2 = p.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
  if (m2) return m2[1]
  if (p.includes('vite-plugin-node-polyfills')) return 'vite-plugin-node-polyfills'
  if (/^\s|virtual:/.test(p)) return '(virtual)'
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
  const gz = Math.round(r.size * 0.32)
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
