// Inline @omnisat/lasereyes-client's type declarations into this package's dist.
//
// Why: `@omnisat/lasereyes-client` is bundled into core's runtime (Rollup
// inlines it — it is not listed in `dependencies`) and is intentionally NOT
// published to npm. Its JS therefore ships inside core's `dist`, but the
// emitted `.d.ts` files still contain bare `from '@omnisat/lasereyes-client'`
// specifiers that a consumer can't resolve. This script vendors the client's
// declaration tree into `dist/_client/` and rewrites every such specifier
// (in both core's declarations and the vendored tree's own self-imports) to a
// relative path, making core's published types fully self-contained.
//
// api-extractor's `bundledPackages` rollup would do this too, but it crashes
// on core's `declare global` blocks ("Child declaration not found"), so we do
// the inlining mechanically against the per-file `.d.ts` vite-plugin-dts emits.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const coreDist = resolve(here, '../dist')
const clientDist = resolve(here, '../../client/dist')
const vendorDirName = '_client'
const vendorDir = join(coreDist, vendorDirName)
const PKG = '@omnisat/lasereyes-client'

// Matches a quoted module specifier for the client package, optionally with a
// subpath — covers `from '...'`, `import('...')`, and `import type ... from`.
const SPECIFIER_RE = new RegExp(`(['"])(${PKG}(?:\\/[^'"]+)?)\\1`, 'g')

async function walkDts(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walkDts(full)))
    else if (entry.name.endsWith('.d.ts')) out.push(full)
  }
  return out
}

// Resolve `@omnisat/lasereyes-client[/sub]` to a vendored file path (no
// extension), relative to vendorDir. Probes the layouts the client uses:
// flat (`wallet.d.ts`), index (`backends/index.d.ts`), and the scaffolded
// protocol actions (`actions/alkanes/index.d.ts`).
function resolveTarget(spec) {
  const sub = spec === PKG ? '' : spec.slice(PKG.length + 1)
  const candidates = sub === '' ? ['index'] : [sub, `${sub}/index`, `actions/${sub}/index`]
  for (const c of candidates) {
    if (existsSync(join(vendorDir, `${c}.d.ts`))) return c
  }
  return null
}

function toRelativeImport(fromFile, target) {
  let rel = relative(dirname(fromFile), join(vendorDir, target)).split(sep).join('/')
  if (!rel.startsWith('.')) rel = `./${rel}`
  return rel
}

async function main() {
  if (!existsSync(clientDist)) {
    throw new Error(`client dist not found at ${clientDist} — build @omnisat/lasereyes-client first`)
  }

  // Vendor the client's declaration tree (types only; its JS is already
  // bundled into core's runtime).
  await rm(vendorDir, { recursive: true, force: true })
  await mkdir(vendorDir, { recursive: true })
  await cp(clientDist, vendorDir, {
    recursive: true,
    filter: (src) => !src.endsWith('.js') && !src.endsWith('.js.map') && !src.endsWith('.d.ts.map'),
  })

  // Rewrite specifiers in every declaration file under dist, including the
  // vendored tree (its files self-reference the package by name).
  const unresolved = new Set()
  let rewritten = 0
  for (const file of await walkDts(coreDist)) {
    const content = await readFile(file, 'utf8')
    const next = content.replace(SPECIFIER_RE, (match, quote, spec) => {
      const target = resolveTarget(spec)
      if (!target) {
        unresolved.add(spec)
        return match
      }
      return `${quote}${toRelativeImport(file, target)}${quote}`
    })
    if (next !== content) {
      await writeFile(file, next)
      rewritten++
    }
  }

  if (unresolved.size > 0) {
    throw new Error(`Unresolved client specifiers: ${[...unresolved].join(', ')}`)
  }
  console.log(`inline-client-types: vendored client types, rewrote ${rewritten} declaration file(s)`)
}

await main()
