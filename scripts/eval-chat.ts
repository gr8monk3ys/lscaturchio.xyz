#!/usr/bin/env node
/**
 * Chat retrieval quality evaluation script.
 *
 * Runs each query in scripts/eval-chat-queries.json through both:
 *  - retrieval probe: src/lib/embeddings searchSimilarContent (direct call)
 *  - generation probe: POST /api/chat (HTTP)
 *
 * Writes a markdown artifact (default tmp/chat-eval-<date>.md) with
 * manual-judgment columns to be filled in afterward.
 *
 * See docs/superpowers/specs/2026-05-08-chat-retrieval-quality-design.md
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..')
const QUERIES_PATH = path.join(SCRIPT_DIR, 'eval-chat-queries.json')

type Bucket = 'biographical' | 'synthesis' | 'recall' | 'adversarial'

type Query = {
  query: string
  intent: Bucket
  expected: string
}

type Args = {
  baseUrl: string
  outputPath: string
  timeoutMs: number
}

function printUsage(): void {
  console.log(`Usage: tsx scripts/eval-chat.ts [options]

Options:
  --base-url <url>     Chat API base (default: http://localhost:3000)
  --output <path>      Output markdown path (default: tmp/chat-eval-<date>.md)
  --timeout-ms <ms>    Per-request timeout (default: 30000)
  --help               Show this help`)
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    baseUrl: 'http://localhost:3000',
    outputPath: '',
    timeoutMs: 30000,
  }
  for (let i = 2; i < argv.length; i++) {
    const flag = argv[i]
    if (flag === '--help' || flag === '-h') {
      printUsage()
      process.exit(0)
    }
    if (flag === '--base-url' || flag === '--output' || flag === '--timeout-ms') {
      const value = argv[++i]
      if (!value) throw new Error(`Missing value for ${flag}`)
      if (flag === '--base-url') args.baseUrl = value.replace(/\/$/, '')
      if (flag === '--output') args.outputPath = value
      if (flag === '--timeout-ms') args.timeoutMs = Number(value)
      continue
    }
    throw new Error(`Unknown argument: ${flag}`)
  }
  if (!args.outputPath) {
    const date = new Date().toISOString().slice(0, 10)
    args.outputPath = path.join(REPO_ROOT, 'tmp', `chat-eval-${date}.md`)
  }
  return args
}

async function loadQueries(): Promise<Query[]> {
  const raw = await fs.readFile(QUERIES_PATH, 'utf-8')
  const parsed = JSON.parse(raw) as Query[]
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`No queries found in ${QUERIES_PATH}`)
  }
  return parsed
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv)
  const queries = await loadQueries()
  console.log(`[eval-chat] base=${args.baseUrl} output=${args.outputPath} queries=${queries.length}`)
  for (const q of queries) {
    console.log(`  - [${q.intent}] ${q.query}`)
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
