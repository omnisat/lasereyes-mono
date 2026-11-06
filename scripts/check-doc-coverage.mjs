/**
 * Checks TSDoc coverage on public API exports.
 * Runs TypeDoc and checks for undocumented exports in tier-1 files.
 * Exits non-zero if any tier-1 export lacks TSDoc.
 */
import { execSync } from 'node:child_process'

const TIER1_PATTERNS = [
  'packages/client/src/client.ts',
  'packages/client/src/data-source.ts',
  'packages/client/src/actions/btc.ts',
  'packages/client/src/errors.ts',
  'packages/client/src/types/',
  'packages/client/src/vendors/',
  'packages/client/src/constants/networks.ts',
  'packages/core/src/client/index.ts',
  'packages/core/src/client/utils.ts',
  'packages/core/src/client/types.ts',
  'packages/core/src/lib/data-sources/manager.ts',
  'packages/core/src/types/index.ts',
  'packages/react/src/providers/',
  'packages/react/src/hooks/',
]

try {
  const output = execSync('pnpm typedoc --logLevel Verbose 2>&1', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })

  // Look for "not documented" warnings in TypeDoc verbose output
  const undocLines = output
    .split('\n')
    .filter(line => line.includes('not documented') || line.includes('is not documented'))

  const tier1Violations = undocLines.filter(line =>
    TIER1_PATTERNS.some(pattern => line.includes(pattern))
  )

  if (tier1Violations.length > 0) {
    console.error('Missing TSDoc on tier-1 public exports:\n')
    for (const line of tier1Violations) {
      console.error(`  ${line.trim()}`)
    }
    console.error(`\n${tier1Violations.length} undocumented export(s) found.`)
    process.exit(1)
  }

  console.log('Doc coverage check passed. All tier-1 exports are documented.')
} catch (err) {
  // TypeDoc may exit non-zero on errors
  if (err.stdout) {
    const undocLines = err.stdout
      .split('\n')
      .filter(line => line.includes('not documented') || line.includes('is not documented'))

    const tier1Violations = undocLines.filter(line =>
      TIER1_PATTERNS.some(pattern => line.includes(pattern))
    )

    if (tier1Violations.length > 0) {
      console.error('Missing TSDoc on tier-1 public exports:\n')
      for (const line of tier1Violations) {
        console.error(`  ${line.trim()}`)
      }
      console.error(`\n${tier1Violations.length} undocumented export(s) found.`)
      process.exit(1)
    }
  }

  // If typedoc had errors but no doc coverage issues, still report the error
  if (err.status && err.status !== 0) {
    console.error('TypeDoc exited with errors. Check the output above.')
    console.error(err.stderr || err.stdout || err.message)
    process.exit(1)
  }

  console.log('Doc coverage check passed. All tier-1 exports are documented.')
}
