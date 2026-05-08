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

import {
  searchSimilarContent,
  getEmbeddingProvider,
  isEmbeddingsAvailable,
} from '../src/lib/embeddings'

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

type RetrievedRow = {
  id: number
  content: string
  similarity: number
  metadata: { source?: string; slug?: string; title?: string } & Record<string, unknown>
}

type ChatData = {
  answer: string
  provider: string | null
  model: string | null
  degraded: boolean
}

type ChatResult = ChatData | { error: string }

type ChatPayload = { data?: ChatData; error?: string }

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

async function probeRetrieval(query: string): Promise<RetrievedRow[]> {
  const rows = await searchSimilarContent(query, 5)
  return rows as RetrievedRow[]
}

async function probeGeneration(args: Args, query: string): Promise<ChatResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), args.timeoutMs)
  try {
    const response = await fetch(`${args.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: new URL(args.baseUrl).origin,
      },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    })
    const payload = (await response.json()) as ChatPayload
    if (!response.ok || !payload.data) {
      return { error: `HTTP ${response.status}: ${payload.error ?? 'no data'}` }
    }
    return payload.data
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) }
  } finally {
    clearTimeout(timer)
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv)
  const queries = await loadQueries()

  const available = await isEmbeddingsAvailable()
  if (!available) {
    console.error(
      'Embeddings provider unavailable. Set OPENAI_API_KEY or start Ollama before running this eval.'
    )
    process.exit(1)
  }
  const provider = getEmbeddingProvider()

  console.log(
    `[eval-chat] base=${args.baseUrl} embedding-provider=${provider} queries=${queries.length}`
  )

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i]
    console.log(`[eval-chat] (${i + 1}/${queries.length}) [${q.intent}] ${q.query}`)
    const retrieved = await probeRetrieval(q.query).catch((error: unknown) => {
      console.warn(
        `  retrieval failed: ${error instanceof Error ? error.message : String(error)}`
      )
      return [] as RetrievedRow[]
    })
    console.log(
      `  retrieved=${retrieved.length} sources=${retrieved
        .map((r) => `${r.metadata.source}@${r.similarity.toFixed(3)}`)
        .join(', ')}`
    )
    const generated = await probeGeneration(args, q.query)
    if ('error' in generated) {
      console.log(`  generation: ERROR ${generated.error}`)
    } else {
      console.log(
        `  generation: provider=${generated.provider} degraded=${generated.degraded} answer-length=${generated.answer.length}`
      )
    }
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
