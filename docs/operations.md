# Operations Guide

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Examples use `npm`, but `bun install` and `bun run ...` also work.

## Core Validation Commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Use these when a change affects UI behavior, routing, or performance:

```bash
npm run test:e2e
npm run perf:lighthouse
```

Additional quality gates that CI enforces (run locally before pushing if in doubt):

```bash
# Unit tests with coverage thresholds (ratcheted just below actual coverage;
# raise the thresholds in vitest.config.ts as coverage improves)
npm run test:coverage

# Dead code / unused dependency detection
npm run knip
```

`bun.lock` is the canonical lockfile (`package-lock.json` is gitignored). When
`package.json` dependencies change, run `bun install` to update it.

## Environment Overview

The repo ships an annotated [`.env.example`](../.env.example). At a high level:

- `DATABASE_URL`: required for the full data-backed feature set
- `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, Ollama vars: AI provider configuration
- `RESEND_API_KEY`, contact sender vars: email delivery
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: persistent rate limiting
- `NEXT_PUBLIC_SITE_URL`, Sentry vars: production metadata and monitoring

## Content And Retrieval Workflows

```bash
# Rebuild embeddings from public/my-data content
npm run generate-embeddings

# Generate missing blog audio via OpenAI TTS
npm run generate-tts-openai

# Rebuild the generated audio manifest after audio changes
npm run generate-audio-manifest

# Suggest internal links for posts
npm run suggest-internal-links

# Send queued webmentions
npm run send-webmentions
```

Additional maintenance helpers:

- `npm run audit-media`: quick media footprint audit
- `npm run smoke:chat`: smoke-test a target deployment
- `npm run smoke:chat:prod`: smoke-test production chat

### Embeddings: Cautions Learned The Hard Way

- **`.env.local` and Vercel production point at the same Neon database.**
  `generate-embeddings` run locally mutates what production serves. There is
  no staging copy.
- The script replaces rows per source (delete, then insert). It now runs a
  provider preflight before touching anything, because a dead `OPENAI_API_KEY`
  discovered mid-run once emptied the production embeddings table
  (2026-08-03; recovered via the Ollama fallback).
- **Query and stored vectors must share an embedding space.** Production
  embeds queries with whatever provider its env gives it. After rotating
  `OPENAI_API_KEY` (in Vercel and `.env.local`), re-run
  `npm run generate-embeddings` with that key so stored vectors are OpenAI
  vectors too — dimensions matching (768) is not enough, the spaces differ.
- Lexical search needs the `content_tsv` column from
  `supabase/migrations/20260619_hybrid_search.sql`. If retrieval returns
  nothing and no errors are logged, check the column exists before debugging
  code.

### Refreshing Books And Movies

`/books` and `/movies` read the CSV exports in `public/my-data/goodreads/` and
`public/my-data/letterboxd/` directly.

Incremental refresh (public RSS, no auth, dry-run by default):

```bash
npm run refresh-media-data           # report what would change
npm run refresh-media-data -- --write
```

[`.github/workflows/media-refresh.yml`](../.github/workflows/media-refresh.yml)
automates this weekly (Mondays 09:30 UTC) and on `workflow_dispatch`. Changes
land as a rolling PR on `chore/refresh-media-data` — never a direct push. Both
feeds are public RSS, so the workflow needs no secrets.

This replaced a launchd job that ran from a single Mac. That setup only ran when
that machine happened to be awake, and its failures went to a local log file
nobody read: on 2026-08-10 it pushed its branch but never opened a PR, and the
change sat unnoticed until someone went looking for stale branches. The workflow
therefore verifies that a PR is actually open before reporting success, and
fails the run if not.

The feeds only carry recent history (Letterboxd ~50 entries, Goodreads ~100 per
shelf), so a long gap still needs a one-time full export from each service,
replacing the files in place. See
[repository-guide.md](repository-guide.md#reading-the-goodreads-and-letterboxd-exports)
for the two parsing traps these exports carry.

### Reviewing `/now`

`/now` splits into two halves. Reading, watching, and recent writing are derived
from the data exports and the blog at render time, so they cannot go stale. The
hand-written parts (location, what I am building, what I am thinking about) live
in `src/lib/now-data.ts`; bump `NOW_LAST_UPDATED` whenever you revise them, or
the page will start showing a staleness notice after
`NOW_STALE_AFTER_DAYS` (120).

## Serving Audio From A CDN

`public/audio/` holds 83 MP3s totalling **~459MB**, all tracked in git. They are
the bulk of the repository's size. `.gitignore` has carried a
`public/audio/*.mp3` rule since the initial scaffold claiming they are "served
from CDN in production", but the files were force-added, the rule never applied
to them, and no CDN was ever configured. Production serves them from the repo.

Two consequences worth knowing now:

- Every clone pays ~459MB, and git cannot delta-compress MP3s.
- The rule *does* apply to new files. Audio generated for the next post would be
  silently ignored, never deploy, and 404 while every existing post works. Until
  this migration lands, `git add -f` any new MP3.

### Migration

The code side is already done — `getAudioUrl()` in `src/lib/audio-url.ts` reads
`NEXT_PUBLIC_AUDIO_CDN_URL` and falls back to `/audio/<slug>.mp3`. What is
missing is a populated origin.

1. **Provision a bucket** and put the 83 files at its root, keeping the
   `<slug>.mp3` names. Any static origin works; pick whichever you already pay
   for. Objects must be publicly readable and served as `audio/mpeg`.

   ```bash
   # S3-compatible (S3, R2 via the S3 API, B2, Spaces)
   aws s3 sync public/audio/ s3://<bucket>/ --exclude '*' --include '*.mp3' \
     --content-type audio/mpeg --acl public-read

   # Cloudflare R2 via wrangler
   for f in public/audio/*.mp3; do
     npx wrangler r2 object put "<bucket>/$(basename "$f")" --file "$f" \
       --content-type audio/mpeg
   done
   ```

2. **Verify before trusting it.** This is the gate — do not skip it:

   ```bash
   npm run verify-audio-cdn -- --base-url https://cdn.example.com/audio
   ```

   It checks all 83 slugs from `src/generated/audio-manifest.ts` and fails on a
   missing file, a non-audio `content-type` (a 200 serving an HTML error page),
   a missing `content-length`, or any byte-size mismatch. It exits non-zero
   unless all 83 pass.

3. **Point production at it.** Set `NEXT_PUBLIC_AUDIO_CDN_URL` in Vercel and
   redeploy. Confirm a post plays, and that `/api/rss` enclosure URLs point at
   the CDN.

4. **Only then remove the files from git:**

   ```bash
   git rm --cached public/audio/*.mp3
   git commit -m "chore(audio): serve audio from CDN, drop 459MB from the repo"
   ```

   The `.gitignore` rule takes over from here, and its comment should be
   simplified since it stops being inert at that point.

`src/generated/audio-manifest.ts` stays committed regardless — it is the source
of the byte sizes used for RSS enclosures, it is not regenerated during
`next build`, and nothing about it depends on the MP3s being present. That is
what makes step 4 safe.

Removing the files from the index does **not** shrink existing history; it only
stops growth. Reclaiming the 459MB already committed needs a history rewrite
(`git filter-repo`), a separate decision with the usual force-push and
fork-divergence costs.

## Database (Neon)

Engagement data, embeddings, and newsletter state live in a single
Neon Postgres database. The directory is `supabase/migrations/` for
historical reasons — Supabase was the original provider; the SQL is
provider-agnostic Postgres.

```bash
# Apply the combined baseline to a fresh database
DATABASE_URL='postgres://...' npm run db:migrate
```

For incremental migrations against an existing database, see
[`supabase/migrations/README.md`](../supabase/migrations/README.md)
— in short, paste the new SQL into the Neon SQL editor or run via
`psql`, then fold it into `neon_combined_migration.sql` so the
baseline stays current.

## Deployment Notes

- Production deploys target Vercel from `main`
- CI runs lint, knip, type-check, unit tests with coverage thresholds, Playwright e2e, build, and Lighthouse; CodeQL scans on pushes to `main` and weekly
- Post-deploy smoke and the scheduled uptime probe are separate safety nets:
  the smoke job only runs on push to `main`, so a dependency that rots
  *between* deploys is invisible to it (see Monitoring below)
- The canonical sitemap is generated by `src/app/sitemap.ts`
- After deploys, `npm run smoke:chat:prod` is the fastest end-to-end chat check
- A green Vercel status on the commit does not prove the domain updated: an
  instant rollback pins the production domain and silently pauses
  auto-promotion of later deployments (this shipped a 4.5-month-stale site
  once). After user-visible merges, check
  `curl -sI https://lscaturchio.xyz | grep -i age` — an age measured in days
  means the domain is pinned; fix with `vercel promote <deployment-url>`

## Monitoring

- `.github/workflows/uptime.yml` probes production every 15 minutes and on
  `workflow_dispatch`. On failure it opens (or comments on) an issue labelled
  `uptime` and fails the run; on the next passing run it closes that issue.
- Run the same probe locally against any environment:

```bash
npm run uptime:check
npm run uptime:check -- --base-url http://localhost:3000
npm run uptime:check -- --json
```

- **Checks assert on the response body, not just the status code.** This is the
  lesson from the 2026-07-25 outage: the Upstash instance behind rate limiting
  answers `HTTP 200` with an `{"error": ...}` body, and `/api/health` can return
  `200` while reporting `"status":"unhealthy"`. A status-only probe stays green
  through both. Preserve this property when adding checks.
- `/api/chat` is deliberately **not** probed on a schedule — it bills a real
  model call per request. Chat is covered post-deploy by `smoke:chat:prod`, and
  `/api/rag-status` verifies the same dependencies for free.
- GitHub's scheduled runners are best-effort and get delayed under load. Treat
  this as "we hear about it within the hour", not an SLA monitor; move to a
  hosted checker if it ever needs to page someone.

## Dependency Maintenance

Routine bumps are handled by
[`.github/workflows/dep-refresh.yml`](../.github/workflows/dep-refresh.yml),
monthly and on `workflow_dispatch`. It runs `scripts/bump-deps.mjs` (minor and
patch only), regenerates `bun.lock`, and runs lint, typecheck, knip, coverage,
and build **before** opening a rolling PR on `chore/dep-refresh`. Majors are
never included; the run summary lists the ones it held back.

Locally, the same path is:

```bash
node scripts/bump-deps.mjs --dry-run   # report only
node scripts/bump-deps.mjs             # minor + patch
node scripts/bump-deps.mjs --majors    # include majors, one at a time please
bun install                            # regenerate bun.lock — required
bun run predeploy                      # the gates CI enforces
```

### Why Dependabot does not do this

Dependabot's npm updater maintains `package-lock.json`. The bun migration
(`56095cc`) removed that file and CI installs from `bun.lock`, which Dependabot
never writes — so its PRs leave the lockfile stale and
`bun install --frozen-lockfile` rejects them. This is the mechanism behind the
recurring "Dependabot Updates" run failures.

The practical consequence: **Dependabot security alerts will not fix
themselves here.** When GitHub reports an advisory, resolve it through the bun
path above. Check whether the vulnerable package is also pinned by a *parent*
dependency before assuming a direct bump is enough — `next` pins `sharp` as an
optional dependency, so bumping `sharp` alone left `next` resolving a nested
vulnerable copy, and the advisory (`GHSA-f88m-g3jw-g9cj`) stayed open for about
two months. Confirm single-copy resolution afterwards:

```bash
grep -o '"sharp": \["sharp@[^"]*"' bun.lock | sort -u
```

`.github/dependabot.yml` is scoped to GitHub Actions only, where the updater
works fine and nothing else tracks version drift.

## Housekeeping Checklist

- remove dead files when the workflow that needed them is gone
- keep docs aligned with actual scripts and config
- avoid committing local artifacts or scratch outputs
- update `README.md`, `CONTRIBUTING.md`, and `SECURITY.md` when workflows materially change
