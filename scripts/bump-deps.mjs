#!/usr/bin/env node
/**
 * Bump package.json dependency ranges to the latest published versions.
 *
 * Exists because Dependabot cannot maintain this repo's lockfile. Its npm
 * updater writes package-lock.json, which the bun migration (56095cc) removed
 * from the repo — so its PRs leave bun.lock stale and CI's
 * `bun install --frozen-lockfile` rejects them. That is why the sharp/libvips
 * advisory sat open for roughly two months while Dependabot retried and failed.
 *
 * This only edits package.json. Regenerating the lockfile is the caller's job:
 *
 *   node scripts/bump-deps.mjs            # minor + patch only (default)
 *   node scripts/bump-deps.mjs --majors   # include major bumps
 *   node scripts/bump-deps.mjs --json     # machine-readable report
 *   node scripts/bump-deps.mjs --dry-run  # report without writing
 *
 * then `bun install` and run the suite.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const args = process.argv.slice(2)
const includeMajors = args.includes('--majors')
const asJson = args.includes('--json')
const dryRun = args.includes('--dry-run')

const PKG = 'package.json'
const GROUPS = ['dependencies', 'devDependencies']
/** Bumping these in lockstep is the caller's problem, not ours; see --majors. */
const CONCURRENCY = 12

const log = (...a) => {
  if (!asJson) console.log(...a)
}

/** Latest published version of one package, or null if the registry lookup fails. */
async function latestVersion(name) {
  try {
    const { stdout } = await execFileAsync('npm', ['view', name, 'version'], {
      timeout: 30_000,
    })
    const v = stdout.trim()
    return /^\d+\.\d+\.\d+/.test(v) ? v : null
  } catch {
    return null
  }
}

/** Run `worker` over `items` with a bounded number of in-flight calls. */
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++
      results[i] = await worker(items[i])
    }
  })
  await Promise.all(runners)
  return results
}

function bumpKind(current, latest) {
  const c = current.split('.')
  const l = latest.split('.')
  if (c[0] !== l[0]) return 'major'
  if (c[1] !== l[1]) return 'minor'
  return 'patch'
}

const pkg = JSON.parse(readFileSync(PKG, 'utf8'))

const specs = []
for (const group of GROUPS) {
  for (const [name, range] of Object.entries(pkg[group] ?? {})) {
    specs.push({ group, name, range })
  }
}

log(`Checking ${specs.length} dependencies…`)

const versions = await mapLimit(specs, CONCURRENCY, async (s) => ({
  ...s,
  latest: await latestVersion(s.name),
}))

const applied = []
const skipped = []
const unresolved = []

for (const { group, name, range, latest } of versions) {
  if (!latest) {
    unresolved.push(name)
    continue
  }
  // Ranges here are plain "^x.y.z" / "~x.y.z" / "x.y.z"; anything exotic
  // (git URLs, tags, "*") has no numeric current version to compare.
  const current = range.replace(/^[\^~]/, '')
  if (!/^\d+\.\d+\.\d+/.test(current) || current === latest) continue

  const kind = bumpKind(current, latest)
  const entry = { group, name, from: range, to: latest, kind }

  if (kind === 'major' && !includeMajors) {
    skipped.push(entry)
    continue
  }

  const prefix = range.startsWith('^') ? '^' : range.startsWith('~') ? '~' : ''
  pkg[group][name] = prefix + latest
  applied.push({ ...entry, to: prefix + latest })
}

if (applied.length && !dryRun) {
  writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n')
}

const report = { applied, skipped, unresolved, wrote: applied.length > 0 && !dryRun }

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
} else {
  for (const a of applied) log(`  ${a.kind.padEnd(5)} ${a.name.padEnd(32)} ${a.from} -> ${a.to}`)
  if (skipped.length) {
    log(`\nSkipped ${skipped.length} major bump(s) (pass --majors to include):`)
    for (const s of skipped) log(`  major ${s.name.padEnd(32)} ${s.from} -> ${s.to}`)
  }
  if (unresolved.length) {
    log(`\nCould not resolve from the registry: ${unresolved.join(', ')}`)
  }
  log(
    applied.length
      ? `\n${applied.length} bump(s) ${dryRun ? 'would be' : ''} applied. Run \`bun install\` next.`
      : '\nEverything is already current.',
  )
}

// A registry lookup failing is not the same as "nothing to do" — surface it so
// a scheduled run cannot report success while silently skipping packages.
if (unresolved.length) process.exit(1)
