/**
 * Post-processes TypeDoc markdown output to add YAML frontmatter
 * required by Fumadocs. Extracts the title from the first `# ` heading.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const OUTPUT_DIR = 'apps/docs/.typedoc-output'

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else if (entry.name.endsWith('.mdx')) {
      files.push(full)
    }
  }
  return files
}

async function addFrontmatter(filePath) {
  const content = await readFile(filePath, 'utf-8')

  // Skip if frontmatter already exists
  if (content.startsWith('---')) return

  // Extract title from first # heading
  const match = content.match(/^#\s+(.+)$/m)
  const rawTitle = match ? match[1] : relative(OUTPUT_DIR, filePath).replace(/\.mdx$/, '')

  // Clean markdown formatting from title
  const title = rawTitle
    .replace(/\\(.)/g, '$1') // remove all backslash escapes
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()

  // Remove the breadcrumb nav lines at the top and the heading (already in frontmatter)
  const lines = content.split('\n')
  let startIdx = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    // Skip breadcrumb lines, separator lines, and empty lines before the heading
    if (
      line.startsWith('[**') ||
      line.startsWith('[Documentation') ||
      line === '***' ||
      line === '---' ||
      line === ''
    ) {
      startIdx = i + 1
      continue
    }
    // Skip the title heading itself
    if (line.startsWith('# ')) {
      startIdx = i + 1
      break
    }
    break
  }

  const body = lines.slice(startIdx).join('\n').trimStart()
  const frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n`

  await writeFile(filePath, frontmatter + body, 'utf-8')
}

const files = await walk(OUTPUT_DIR)
await Promise.all(files.map(addFrontmatter))
console.log(`Processed ${files.length} files with frontmatter`)
