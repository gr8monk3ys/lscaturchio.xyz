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

function bucketLabel(intent: Bucket): string {
  return intent.charAt(0).toUpperCase() + intent.slice(1)
}

function formatRow(
  query: Query,
  retrieved: RetrievedRow[],
  generated: ChatResult,
  index: number
): string {
  const isAdversarial = query.intent === 'adversarial'

  const sourcesBlock =
    retrieved.length === 0
      ? '  - _(no chunks above threshold)_'
      : retrieved
          .map(
            (r) =>
              `  - \`${r.metadata.source ?? 'unknown'}\` (sim=${r.similarity.toFixed(3)})`
          )
          .join('\n')

  const topSnippet =
    retrieved[0]?.content?.slice(0, 200).replace(/\s+/g, ' ').trim() ?? '_n/a_'

  const generationBlock =
    'error' in generated
      ? `\n  > **ERROR:** ${generated.error}`
      : `\n  > **Provider:** ${generated.provider ?? '?'} (degraded=${generated.degraded})\n  >\n  > ${generated.answer.replace(/\n/g, '\n  > ')}`

  const adversarialCheckbox = isAdversarial
    ? '\n  - [ ] Adversarial: refused gracefully?'
    : ''

  return `### Query ${index + 1}: "${query.query}"
- **Intent:** ${query.intent}
- **Expected:** ${query.expected}
- **Retrieved (top ${retrieved.length}):**
${sourcesBlock}
- **Top chunk snippet:** ${topSnippet}
- **Generated answer:**${generationBlock}

- **Judgment:**
  - [ ] Retrieval relevant?
  - [ ] Answer on-topic?
  - [ ] Answer grounded (not hallucinated)?${adversarialCheckbox}
- **Notes:** _____
`
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

  const sections: Record<Bucket, string[]> = {
    biographical: [],
    synthesis: [],
    recall: [],
    adversarial: [],
  }

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i]
    console.log(`[eval-chat] (${i + 1}/${queries.length}) [${q.intent}] ${q.query}`)
    const retrieved = await probeRetrieval(q.query).catch((error: unknown) => {
      console.warn(
        `  retrieval failed: ${error instanceof Error ? error.message : String(error)}`
      )
      return [] as RetrievedRow[]
    })
    const generated = await probeGeneration(args, q.query)
    sections[q.intent].push(formatRow(q, retrieved, generated, i))
  }

  const header = `# Chat Eval — ${new Date().toISOString()}

- **Target:** ${args.baseUrl}
- **Embedding provider:** ${provider}
- **Total queries:** ${queries.length}

---

`
  const buckets: Bucket[] = ['biographical', 'synthesis', 'recall', 'adversarial']
  const body = buckets
    .filter((b) => sections[b].length > 0)
    .map((b) => `## ${bucketLabel(b)}\n\n${sections[b].join('\n')}`)
    .join('\n')

  await fs.mkdir(path.dirname(args.outputPath), { recursive: true })
  await fs.writeFile(args.outputPath, header + body, 'utf-8')
  console.log(`[eval-chat] wrote ${args.outputPath}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
