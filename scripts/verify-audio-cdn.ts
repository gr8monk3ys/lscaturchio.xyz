/**
 * Verify that a CDN origin serves every blog audio file correctly, before
 * `public/audio/*.mp3` is removed from the repo.
 *
 * The 83 MP3s are ~459MB of the repo's git history. `.gitignore` has claimed
 * they are "served from CDN in production" since it was written, but the rule
 * is inert for already-tracked files, so they were never actually removed and
 * no CDN was ever provisioned. Removing them without a populated CDN would
 * 404 audio on every post, so this script is the gate:
 *
 *   npx tsx scripts/verify-audio-cdn.ts --base-url https://cdn.example.com/audio
 *   npx tsx scripts/verify-audio-cdn.ts            # uses NEXT_PUBLIC_AUDIO_CDN_URL
 *   npx tsx scripts/verify-audio-cdn.ts --json
 *
 * Exits non-zero unless all 83 files are present, are audio, and match the
 * byte size recorded in src/generated/audio-manifest.ts. Only when this passes
 * is `git rm --cached public/audio/*.mp3` safe.
 *
 * See docs/operations.md "Serving audio from a CDN".
 */
import { AUDIO_BYTES_BY_SLUG } from '../src/generated/audio-manifest'

const args = process.argv.slice(2)
const asJson = args.includes('--json')

function argValue(flag: string): string | undefined {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

const rawBase = argValue('--base-url') ?? process.env.NEXT_PUBLIC_AUDIO_CDN_URL

if (!rawBase) {
  console.error(
    'No CDN base URL. Pass --base-url <url> or set NEXT_PUBLIC_AUDIO_CDN_URL.',
  )
  process.exit(2)
}

const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase
const TIMEOUT_MS = Number(process.env.AUDIO_VERIFY_TIMEOUT_MS ?? 15_000)
const CONCURRENCY = Number(process.env.AUDIO_VERIFY_CONCURRENCY ?? 8)

type Check = {
  slug: string
  url: string
  ok: boolean
  status?: number
  expectedBytes: number
  actualBytes?: number
  contentType?: string
  problem?: string
}

async function check(slug: string, expectedBytes: number): Promise<Check> {
  // Mirrors getAudioUrl() in src/lib/audio-url.ts.
  const url = `${base}/${slug}.mp3`
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!res.ok) {
      return { slug, url, ok: false, status: res.status, expectedBytes, problem: `HTTP ${res.status}` }
    }

    const contentType = res.headers.get('content-type') ?? ''
    const lenHeader = res.headers.get('content-length')
    const actualBytes = lenHeader === null ? undefined : Number(lenHeader)

    // A CDN that answers 200 with an HTML error page is the failure mode a
    // status-only check misses — the same lesson as the uptime probe.
    if (!contentType.includes('audio')) {
      return {
        slug, url, ok: false, status: res.status, expectedBytes, actualBytes, contentType,
        problem: `content-type is "${contentType || 'missing'}", expected audio/*`,
      }
    }

    if (actualBytes === undefined) {
      return {
        slug, url, ok: false, status: res.status, expectedBytes, contentType,
        problem: 'no content-length header, cannot verify integrity',
      }
    }

    if (actualBytes !== expectedBytes) {
      return {
        slug, url, ok: false, status: res.status, expectedBytes, actualBytes, contentType,
        problem: `size mismatch: ${actualBytes} bytes, manifest says ${expectedBytes}`,
      }
    }

    return { slug, url, ok: true, status: res.status, expectedBytes, actualBytes, contentType }
  } catch (error) {
    return {
      slug, url, ok: false, expectedBytes,
      problem: error instanceof Error ? error.message : String(error),
    }
  }
}

async function mapLimit<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++
        results[i] = await worker(items[i])
      }
    }),
  )
  return results
}

async function main(): Promise<void> {
  const entries = Object.entries(AUDIO_BYTES_BY_SLUG)

  if (!asJson) {
    console.log(`Verifying ${entries.length} audio files against ${base}\n`)
  }

  const results = await mapLimit(entries, CONCURRENCY, ([slug, bytes]) => check(slug, bytes))
  const failures = results.filter((r) => !r.ok)

  if (asJson) {
    console.log(
      JSON.stringify(
        { base, total: results.length, passed: results.length - failures.length, failed: failures.length, failures },
        null,
        2,
      ),
    )
  } else {
    for (const f of failures) {
      console.log(`  FAIL  ${f.slug}\n        ${f.url}\n        ${f.problem}`)
    }
    const passed = results.length - failures.length
    console.log(`\n${passed}/${results.length} verified against ${base}`)
    if (failures.length === 0) {
      console.log(
        '\nAll files present and byte-identical to the manifest.\n' +
          'Safe to set NEXT_PUBLIC_AUDIO_CDN_URL and remove public/audio/*.mp3 from git.',
      )
    } else {
      console.log(`\n${failures.length} file(s) failed. Do NOT remove the local audio yet.`)
    }
  }

  process.exit(failures.length === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error('Verification failed:', error instanceof Error ? error.message : error)
  process.exit(2)
})
