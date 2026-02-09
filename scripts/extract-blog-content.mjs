#!/usr/bin/env node

/**
 * extract-blog-content.mjs
 *
 * Extracts plain text content from blog MDX files for embedding generation.
 * Strips MDX/JSX syntax, export/import statements, and component tags.
 * Prepends the blog title from the meta export.
 *
 * Output: public/my-data/blog-{slug}.md
 *
 * Usage: node scripts/extract-blog-content.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const BLOG_DIR = join(ROOT, 'src', 'app', 'blog')
const OUTPUT_DIR = join(ROOT, 'public', 'my-data')

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true })

/**
 * Extract the title from the meta export block.
 */
function extractTitle(content) {
  const titleMatch = content.match(/title:\s*["'`]([^"'`]+)["'`]/)
  return titleMatch ? titleMatch[1] : null
}

/**
 * Strip MDX/JSX syntax and return clean markdown text.
 */
function cleanMdxContent(content) {
  const lines = content.split('\n')
  const cleanedLines = []
  let inMetaBlock = false
  let braceDepth = 0
  let inCodeBlock = false

  for (const line of lines) {
    // Track fenced code blocks to avoid stripping content inside them
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      cleanedLines.push(line)
      continue
    }

    // Inside code blocks, keep everything as-is
    if (inCodeBlock) {
      cleanedLines.push(line)
      continue
    }

    // Detect start of meta export block
    if (!inMetaBlock && /^export\s+const\s+meta\s*=/.test(line)) {
      inMetaBlock = true
      // Count braces on this line
      for (const ch of line) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }
      // If the block closes on the same line
      if (braceDepth <= 0 && line.includes('{')) {
        inMetaBlock = false
        braceDepth = 0
      }
      continue
    }

    // Inside meta block, skip lines until braces are balanced
    if (inMetaBlock) {
      for (const ch of line) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }
      if (braceDepth <= 0) {
        inMetaBlock = false
        braceDepth = 0
      }
      continue
    }

    // Skip import statements
    if (/^import\s+/.test(line)) {
      continue
    }

    // Skip other export statements
    if (/^export\s+/.test(line)) {
      continue
    }

    // Strip self-closing JSX component tags: <ComponentName ... />
    // Only matches PascalCase components (capital first letter), not HTML tags
    let cleaned = line.replace(/<[A-Z][A-Za-z0-9]*\s*[^>]*\/>/g, '')

    // Strip opening JSX component tags: <ComponentName ...>
    cleaned = cleaned.replace(/<[A-Z][A-Za-z0-9]*\s*[^>]*>/g, '')

    // Strip closing JSX component tags: </ComponentName>
    cleaned = cleaned.replace(/<\/[A-Z][A-Za-z0-9]*>/g, '')

    cleanedLines.push(cleaned)
  }

  // Join and clean up excessive blank lines (more than 2 consecutive)
  let result = cleanedLines.join('\n')
  result = result.replace(/\n{4,}/g, '\n\n\n')
  result = result.trim()

  return result
}

// Find all blog directories with content.mdx
const blogDirs = readdirSync(BLOG_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => {
    return existsSync(join(BLOG_DIR, name, 'content.mdx'))
  })
  .sort()

let processed = 0
let skipped = 0

for (const slug of blogDirs) {
  const mdxPath = join(BLOG_DIR, slug, 'content.mdx')

  try {
    const raw = readFileSync(mdxPath, 'utf-8')
    const title = extractTitle(raw)
    const cleaned = cleanMdxContent(raw)

    // Prepend title as H1 if found
    const output = title ? `# ${title}\n\n${cleaned}` : cleaned

    const outputPath = join(OUTPUT_DIR, `blog-${slug}.md`)
    writeFileSync(outputPath, output + '\n', 'utf-8')
    processed++
  } catch (err) {
    console.error(`Error processing ${slug}: ${err.message}`)
    skipped++
  }
}

console.log(`Done. Processed: ${processed}, Skipped: ${skipped}`)
console.log(`Output directory: ${OUTPUT_DIR}`)
