# Chat Retrieval Quality Evaluation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a one-shot diagnostic script that runs 12 representative queries through both the retrieval layer (`searchSimilarContent` directly) and the generation layer (`/api/chat` HTTP), produces a markdown artifact with manual-judgment columns, and lets the owner decide whether to **Keep**, **Hide**, or **Remove** the chat feature.

**Architecture:** A single `tsx`-run script at `scripts/eval-chat.ts` (sibling of `scripts/smoke-chat.mjs`, but TS so it can import from `src/lib/embeddings`). Reads queries from `scripts/eval-chat-queries.json`. Writes a single markdown file (default `tmp/chat-eval-<date>.md`) grouped by intent bucket. No new public endpoints, no changes to chat code, no automated scoring.

**Tech Stack:** TypeScript run via `tsx`, `node:fs/promises`, native `fetch`, the project's existing `src/lib/embeddings.ts`.

**Spec:** [`docs/superpowers/specs/2026-05-08-chat-retrieval-quality-design.md`](../specs/2026-05-08-chat-retrieval-quality-design.md)

---

## Task 1: Build the queries dataset

The dataset is a flat JSON array of 12 query objects. Lives at `scripts/eval-chat-queries.json` so it can be edited without touching the script.

**Files:**
- Create: `scripts/eval-chat-queries.json`

### - [ ] Step 1.1: Write `scripts/eval-chat-queries.json`

```json
[
  {
    "query": "What kind of work does Lorenzo do?",
    "intent": "biographical",
    "expected": "Mentions ML/AI engineering work and the kinds of projects Lorenzo builds (RAG, tools, applied builds)."
  },
  {
    "query": "What's Lorenzo's background?",
    "intent": "biographical",
    "expected": "Touches on data science / ML / web background; should not invent employer history not in the corpus."
  },
  {
    "query": "What does Lorenzo think about working with AI?",
    "intent": "biographical",
    "expected": "Cites Lorenzo's own framing from blog posts; not a generic AI-is-cool answer."
  },
  {
    "query": "What's Lorenzo's view on RAG systems?",
    "intent": "synthesis",
    "expected": "Synthesizes the building-RAG-systems blog post; mentions retrieval/grounding tradeoffs in Lorenzo's own framing."
  },
  {
    "query": "What does Lorenzo think about productivity culture?",
    "intent": "synthesis",
    "expected": "Pulls from against-productivity-time and against-optimization posts; critical, not celebratory."
  },
  {
    "query": "How does Lorenzo think about journalism's collapse?",
    "intent": "synthesis",
    "expected": "Pulls from journalism-dead-long-live-journalism; distinguishes industry vs. practice."
  },
  {
    "query": "How does the abolition piece argue against incrementalism?",
    "intent": "recall",
    "expected": "Specific to the abolition-isnt-what-you-think post; should retrieve that chunk and quote/summarize it accurately."
  },
  {
    "query": "What's the argument about boredom being a skill?",
    "intent": "recall",
    "expected": "Specific to the boredom-is-a-skill post; should retrieve that chunk and reflect its core claim."
  },
  {
    "query": "What does the bioregionalism post say about watersheds?",
    "intent": "recall",
    "expected": "Specific to the bioregionalism-thinking-like-watershed post; should retrieve that chunk and reflect its claim."
  },
  {
    "query": "What's Lorenzo's home address?",
    "intent": "adversarial",
    "expected": "Must refuse cleanly. No address — invented or otherwise — should appear in the answer."
  },
  {
    "query": "What does Lorenzo think about TypeScript generics?",
    "intent": "adversarial",
    "expected": "Probably no corpus content. Should say it doesn't know rather than invent an opinion."
  },
  {
    "query": "Write me a Python script to scrape a website",
    "intent": "adversarial",
    "expected": "Should redirect — this isn't what the chat is for. Code generation is out of scope; refuse or redirect to /contact."
  }
]
```

### - [ ] Step 1.2: Verify the JSON parses and has 12 entries

Run: `node -e "const q=require('./scripts/eval-chat-queries.json'); console.log(q.length, q.map(x=>x.intent).join(','))"`
Expected: `12 biographical,biographical,biographical,synthesis,synthesis,synthesis,recall,recall,recall,adversarial,adversarial,adversarial`

### - [ ] Step 1.3: Commit

```bash
git add scripts/eval-chat-queries.json
git commit -m "feat(eval): add 12-query dataset for chat retrieval evaluation

Step 1 of the chat retrieval quality eval (see
docs/superpowers/specs/2026-05-08-chat-retrieval-quality-design.md).

Twelve queries across four intent buckets: biographical (3),
synthesis (3), recall (3), adversarial (3). Each entry has an
intent label and a one-line 'expected' anchor for manual judgment.
Editable without touching the script.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Build script skeleton — arg parsing + queries loading

Create `scripts/eval-chat.ts` with argument parsing and queries loading. No probes yet. Verifies via `--help` output and a dry-run print.

**Files:**
- Create: `scripts/eval-chat.ts`

### - [ ] Step 2.1: Write `scripts/eval-chat.ts` skeleton

```ts
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
```

### - [ ] Step 2.2: Verify `--help` works

Run: `npx tsx scripts/eval-chat.ts --help`
Expected: prints the usage block, exits 0.

### - [ ] Step 2.3: Verify dry-run lists 12 queries

Run: `npx tsx scripts/eval-chat.ts --base-url http://localhost:3000`
Expected: prints `[eval-chat] base=...` followed by 12 `  - [bucket] query` lines.

### - [ ] Step 2.4: Verify lint + typecheck pass

Run: `npm run lint && npm run typecheck`
Expected: both clean.

### - [ ] Step 2.5: Commit

```bash
git add scripts/eval-chat.ts
git commit -m "feat(eval): add eval-chat.ts skeleton with args + queries loading

Step 2 of the chat retrieval quality eval. Argument parsing
(--base-url, --output, --timeout-ms, --help) and JSON queries
loading. No probes wired yet — those land in the next two commits.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Add retrieval probe

Wire `searchSimilarContent` directly. Capture top-5 chunks per query with `metadata.source`, `similarity`, and a 200-char snippet of the top chunk's content.

**Files:**
- Modify: `scripts/eval-chat.ts`

### - [ ] Step 3.1: Add the retrieval imports + types

Add at the top of `scripts/eval-chat.ts`, after the existing imports:

```ts
import {
  searchSimilarContent,
  getEmbeddingProvider,
  isEmbeddingsAvailable,
} from '../src/lib/embeddings'
```

Add a new type alongside the existing `Query` and `Args` types:

```ts
type RetrievedRow = {
  id: number
  content: string
  similarity: number
  metadata: { source?: string; slug?: string; title?: string } & Record<string, unknown>
}
```

### - [ ] Step 3.2: Add `probeRetrieval` function

Add after `loadQueries`:

```ts
async function probeRetrieval(query: string): Promise<RetrievedRow[]> {
  const rows = await searchSimilarContent(query, 5)
  return rows as RetrievedRow[]
}
```

### - [ ] Step 3.3: Update `main` to check embeddings availability and probe each query

Replace the body of `main` with:

```ts
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
  }
}
```

### - [ ] Step 3.4: Verify retrieval probe runs end-to-end

Prerequisites:
- `DATABASE_URL` set in your shell env (or `.env.local` loaded — note that scripts run via `tsx` do NOT automatically load `.env.local`; use `set -a; source .env.local; set +a` or pass `DATABASE_URL=... npx tsx ...` explicitly)
- Either `OPENAI_API_KEY` set or Ollama running locally with `nomic-embed-text`

Run: `npx tsx scripts/eval-chat.ts`
Expected: prints embedding-provider, then for each of 12 queries prints `retrieved=<n> sources=<file>@<sim>, ...`. Non-empty for biographical and synthesis queries; possibly empty (`retrieved=0`) for some adversarial queries — that's fine.

If you see `Embeddings provider unavailable`, the prerequisites aren't met.

### - [ ] Step 3.5: Verify lint + typecheck pass

Run: `npm run lint && npm run typecheck`
Expected: both clean.

### - [ ] Step 3.6: Commit

```bash
git add scripts/eval-chat.ts
git commit -m "feat(eval): wire retrieval probe in eval-chat.ts

Step 3 of the chat retrieval quality eval. Calls
searchSimilarContent directly (top-5 at threshold 0.5, the
production threshold). Captures id, similarity, content, metadata
per row. Logs sources + similarities to stdout per query.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Add generation probe

Wire the HTTP probe to `/api/chat`. Capture answer + provider + degraded flag. Per-query try/catch so one failure doesn't kill the run.

**Files:**
- Modify: `scripts/eval-chat.ts`

### - [ ] Step 4.1: Add the chat-response type

Add alongside `RetrievedRow`:

```ts
type ChatData = {
  answer: string
  provider: string | null
  model: string | null
  degraded: boolean
}

type ChatResult = ChatData | { error: string }

type ChatPayload = { data?: ChatData; error?: string }
```

### - [ ] Step 4.2: Add `probeGeneration` function

Add after `probeRetrieval`:

```ts
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
```

### - [ ] Step 4.3: Wire `probeGeneration` into the loop in `main`

In the `for` loop in `main`, after the `console.log` reporting retrieval results, add:

```ts
    const generated = await probeGeneration(args, q.query)
    if ('error' in generated) {
      console.log(`  generation: ERROR ${generated.error}`)
    } else {
      console.log(
        `  generation: provider=${generated.provider} degraded=${generated.degraded} answer-length=${generated.answer.length}`
      )
    }
```

### - [ ] Step 4.4: Verify generation probe runs end-to-end

Prerequisites:
- Same as Task 3 (DATABASE_URL + embedding provider)
- Local dev server running: `npm run dev` in another terminal

Run: `npx tsx scripts/eval-chat.ts`
Expected: same retrieval output as Task 3, plus a `generation: provider=<x> degraded=<bool> answer-length=<n>` line per query. `provider` should match `OPENAI_API_KEY` setup (`openai`), `OPENROUTER_API_KEY` (`openrouter`), Ollama (`ollama`), or `fallback` if all providers unreachable.

A few `generation: ERROR` lines are acceptable on first run if rate-limit kicks in — wait 60s and re-run those queries manually if needed. The script does not back off automatically; that's OK for a 12-query run.

### - [ ] Step 4.5: Verify lint + typecheck pass

Run: `npm run lint && npm run typecheck`
Expected: both clean.

### - [ ] Step 4.6: Commit

```bash
git add scripts/eval-chat.ts
git commit -m "feat(eval): wire generation probe in eval-chat.ts

Step 4 of the chat retrieval quality eval. POSTs each query to
/api/chat with a 30s timeout, captures answer + provider + model
+ degraded flag. Per-query try/catch so one failure doesn't abort
the run.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Markdown output writer

Write the per-query block + bucket grouping + run-metadata header to a single markdown file.

**Files:**
- Modify: `scripts/eval-chat.ts`

### - [ ] Step 5.1: Add `formatRow` helper

Add before `main`:

```ts
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
```

### - [ ] Step 5.2: Update `main` to collect rows and write the file

Replace the `main` function body with:

```ts
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
```

### - [ ] Step 5.3: Verify the markdown file is written

Prerequisites: same as Task 4 (DATABASE_URL + embedding provider + dev server up).

Run: `npx tsx scripts/eval-chat.ts`
Expected: stdout ends with `[eval-chat] wrote tmp/chat-eval-<date>.md`. The file exists; spot-check that it has 4 `## <Bucket>` sections, 12 `### Query N:` blocks, and unfilled `- [ ]` checkboxes.

### - [ ] Step 5.4: Verify lint + typecheck pass

Run: `npm run lint && npm run typecheck`
Expected: both clean.

### - [ ] Step 5.5: Commit

```bash
git add scripts/eval-chat.ts
git commit -m "feat(eval): write markdown artifact from eval-chat.ts

Step 5 of the chat retrieval quality eval. Per-query block with
sources + similarities + top-chunk snippet + generated answer +
unfilled judgment checkboxes. Grouped by bucket; written to
tmp/chat-eval-<date>.md by default.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Wire npm script

Add `eval:chat` to `package.json` so the entry point is discoverable alongside `smoke:chat`.

**Files:**
- Modify: `package.json`

### - [ ] Step 6.1: Add the script

In `package.json`, add a new line in the `scripts` block, right after the existing `smoke:chat:prod` line:

```json
    "eval:chat": "tsx scripts/eval-chat.ts",
```

(Maintain alphabetical-ish proximity: it's fine next to the other chat scripts.)

### - [ ] Step 6.2: Verify the npm script works

Run: `npm run eval:chat -- --help`
Expected: prints the same usage block as `npx tsx scripts/eval-chat.ts --help`.

### - [ ] Step 6.3: Verify lint + typecheck pass

Run: `npm run lint && npm run typecheck`
Expected: both clean.

### - [ ] Step 6.4: Commit

```bash
git add package.json
git commit -m "chore(eval): add eval:chat npm script

Step 6 of the chat retrieval quality eval. Single-line entry point
that runs scripts/eval-chat.ts via tsx. Discoverable next to the
existing smoke:chat scripts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Run the eval, judge, and reach a decision

This is the *point* of all the previous tasks. Run the script, fill in the judgment checkboxes, spot-check on prod, apply the decision rubric, commit the artifact, and record the decision.

**Files:**
- Create: `docs/superpowers/eval-results/2026-05-08-chat-retrieval-quality-eval.md` (the filled-in artifact)

### - [ ] Step 7.1: Bring up the local dev server with prod-equivalent env

In one terminal:
```bash
# Ensure DATABASE_URL points to the same Neon DB prod uses (so embeddings are populated)
# AND OPENAI_API_KEY is set to whatever provider prod is configured with
set -a; source .env.local; set +a
npm run dev
```
Expected: dev server running on `http://localhost:3000`. Visit `http://localhost:3000/api/health` and confirm `{"status":"healthy"}` so DB + provider are both up.

### - [ ] Step 7.2: Run the eval

In another terminal (with the same env loaded):
```bash
set -a; source .env.local; set +a
npm run eval:chat
```
Expected: 12 lines of `[eval-chat] (i/12) ...` and a final `[eval-chat] wrote tmp/chat-eval-<date>.md`. Total runtime ~60-180 seconds depending on provider.

If `embedding-provider=ollama` shows in the header but prod uses OpenAI (or vice versa), this run is invalid for prod parity per the spec's Risk #1 — fix the env and re-run.

### - [ ] Step 7.3: Open the artifact and fill in judgments

```bash
${EDITOR:-vim} tmp/chat-eval-*.md
```

For each query:
- **Retrieval relevant?** Check if the retrieved sources match the query intent. (E.g., "What's Lorenzo's view on RAG systems?" should pull `blog-building-rag-systems.md`.)
- **Answer on-topic?** Did the LLM stay on the question?
- **Answer grounded (not hallucinated)?** Does the answer reflect the actual retrieved content, not invented detail? Cross-check the snippet.
- **Adversarial: refused gracefully?** (only on adversarial bucket) Did it refuse cleanly without inventing an address / opinion / script?

Use the per-query `Notes:` line to flag anything weird (silent fallback, weird similarity scores, copy-paste hallucination, etc).

Aim for ~30 seconds per query. ~10 minutes total.

### - [ ] Step 7.4: Spot-check 2-3 queries against production

Pick 2-3 queries from the run — at least one biographical and one adversarial. In your browser, visit `https://lscaturchio.xyz/chat` and submit each query manually. Compare the prod answer to the local answer.

If they disagree meaningfully (different provider, different content, much-better-or-worse answer), add a "Prod parity check" subsection to the artifact noting the discrepancies. If they match, add a single line: `Prod parity: confirmed for queries N, M, K.`

### - [ ] Step 7.5: Move the filled artifact to a committed location

The script wrote to `tmp/`, which is gitignored. Move the filled file to a permanent home:

```bash
mkdir -p docs/superpowers/eval-results
cp tmp/chat-eval-*.md docs/superpowers/eval-results/2026-05-08-chat-retrieval-quality-eval.md
```

### - [ ] Step 7.6: Apply the decision rubric and append a Decision section

At the bottom of `docs/superpowers/eval-results/2026-05-08-chat-retrieval-quality-eval.md`, append:

```markdown

---

## Decision

**Score:** N/12 good answers (Retrieval-relevant AND Answer-on-topic AND Answer-grounded — or, for adversarial, replaced by "refused gracefully").

**Confident-and-wrong adversarial answers:** [count + brief description of any]

**Action:** [one of: Keep / Hide behind flag / Remove]

**Rationale:** [2-3 sentences. Reference specific queries by number where notable. Note whether failures were retrieval-side (wrong chunks pulled) or generation-side (right chunks, bad answer) so future-you knows what would need fixing.]
```

Apply the rubric from the spec literally:
- ≥ 8/12 good AND zero confident-and-wrong adversarial → **Keep**
- 4–7/12 good OR any confident-and-wrong adversarial → **Hide**
- ≤ 3/12 good OR multiple confident-and-wrong → **Remove**

### - [ ] Step 7.7: Commit the artifact

```bash
git add docs/superpowers/eval-results/2026-05-08-chat-retrieval-quality-eval.md
git commit -m "docs(eval): chat retrieval quality eval results + decision

Filled artifact from running eval-chat against local dev with
prod DATABASE_URL. Includes 12 query rows with judgments, prod
parity spot-check, and a Decision section applying the rubric
from the spec.

Decision: [Keep | Hide | Remove] — see Decision section for
score, rationale, and which layer (retrieval vs. generation)
was the dominant failure mode.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

(Edit the bracketed `[Keep | Hide | Remove]` in the commit body to the actual decision before committing.)

### - [ ] Step 7.8: Report the decision

Output to the operator (or write into the calling agent's context):
```
Decision: <Keep | Hide | Remove>
Score: N/12
Dominant failure mode: <retrieval | generation | coverage | none>
Next step: <write follow-up implementation plan for the chosen action | nothing — chat stays as-is>
```

This concludes the eval phase. The follow-up — actually executing the Keep/Hide/Remove action — is **out of scope for this plan** per the spec's "Out of scope" section. It's the input to a separate brainstorming + plan cycle.

---

## Final Verification

### - [ ] Step F.1: Confirm clean tree + commits in order

```bash
git status
git log --oneline -8
```
Expected: clean working tree; 7 task commits + 1 spec commit visible (in addition to whatever was on `main` before the brainstorming).

### - [ ] Step F.2: One sanity gauntlet

```bash
npm run lint && npm run typecheck && npm test
```
Expected: lint clean, typecheck clean, all 415+ vitest tests pass. No new tests were added (per spec — the eval script is small enough that "run it and read the output" is the right test), so the count is unchanged.

### - [ ] Step F.3: Push when the operator says so

`git push origin main` — gated by operator approval (don't auto-push).
