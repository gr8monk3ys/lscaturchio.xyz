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
# Regenerate the chat corpus (public/my-data/blog-*.md) from the essays.
# Run after editing any essay; CI runs this with --check and fails on drift.
npm run sync-retrieval-corpus

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

Run it locally and open a PR with the result; there is no scheduled job for
this any more.

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

## Publishing Via The Admin Portal

`/admin` is a login-protected portal for publishing blog posts, gallery
photos, the `/now` page, and the `/links` page without a local checkout.
Publishing commits the generated files straight to `main` via the GitHub API
(one commit per publish); Vercel deploys the change in about two minutes.

Setup (one-time):

1. Create a GitHub OAuth app (Settings → Developer settings → OAuth Apps)
   with callback URL `https://lscaturchio.xyz/api/admin/auth/callback`.
   Record the client ID and secret.
2. Create a fine-grained personal access token scoped to **this repository
   only** with **Contents: read and write** — nothing else.
3. Generate a session secret: `openssl rand -hex 32`.
4. Set the env vars in Vercel (see `.env.example`): `GITHUB_OAUTH_CLIENT_ID`,
   `GITHUB_OAUTH_CLIENT_SECRET`, `ADMIN_ALLOWED_LOGIN`,
   `ADMIN_SESSION_SECRET`, `GITHUB_CONTENT_TOKEN`.

Behaviour and failure modes:

- Only the GitHub account named by `ADMIN_ALLOWED_LOGIN` can sign in.
- Posts are validated before committing (Zod on the meta, a real MDX compile
  on the body); invalid content is rejected at publish time and nothing is
  committed. If a bad commit ever lands anyway, the failed Vercel build
  leaves the previous deploy live — the failure mode is "not published",
  never "site down".
- Photo uploads are converted server-side to webp (q85, max 1920px) and the
  gallery entry is written to `src/data/photos.json` in the same commit.
- The `/now` and `/links` editors write `src/data/now.json` and
  `src/data/links.json`; the portal reads the current versions from `main`,
  so edits are always against what is deployed.
- With any env var unset, `/admin` renders a "not configured" notice and the
  admin APIs refuse to run.

Rotation: revoke and re-issue the PAT (step 2) and update
`GITHUB_CONTENT_TOKEN` in Vercel; sessions are invalidated by changing
`ADMIN_SESSION_SECRET`.

## Serving Audio From A CDN

Blog audio is served from **Vercel Blob** (store `lscaturchio-audio`,
`store_EklDXPD3MP5h44QJ`, origin
`https://ekldxpd3mp5h44qj.public.blob.vercel-storage.com`). The 83 MP3s were
migrated out of git on 2026-08-17; `NEXT_PUBLIC_AUDIO_CDN_URL` points at the
Blob origin in every Vercel environment, `getAudioUrl()` builds the URLs, and
the CSP `media-src` allows the origin. Without the env var, dev falls back to
`public/audio/` (untracked — a fresh clone has no local MP3s, so set the env
var in `.env.local`).

### Adding audio for a new post

1. Generate the MP3 (`npm run generate-tts-openai`) and regenerate the
   manifest (`npm run generate-audio-manifest`) — the manifest stays committed
   because RSS enclosures read byte sizes from it.
2. Upload to the store, keeping the `<slug>.mp3` name:

   ```bash
   vercel blob put public/audio/<slug>.mp3 --access public \
     --pathname <slug>.mp3 --content-type audio/mpeg \
     --cache-control-max-age 31536000 \
     --rw-token "$BLOB_READ_WRITE_TOKEN"
   ```

   (If `VERCEL_OIDC_TOKEN` is in your env, the CLI insists on explicit
   credentials — pass `--rw-token` as above.)

3. **Verify before trusting it** — the gate checks all slugs in the manifest
   for presence, `audio/mpeg` content type, and exact byte size:

   ```bash
   npm run verify-audio-cdn
   ```

Do not commit MP3s — `.gitignore` excludes them, and this time the rule is
real (the old files were force-added before the rule existed).

Removing the files from the index did **not** shrink existing history; the
~459MB of MP3 blobs (plus old `.next/` caches) remain in the pack until a
history rewrite (`git filter-repo` + force-push + a GitHub support ticket to
drop cached PR refs) — a separate decision with fork-divergence costs.

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
  `workflow_dispatch`. It sorts every failure into one of two buckets, and they
  escalate very differently:

| Probe result | Exit | Run | Issue |
| --- | --- | --- | --- |
| healthy | 0 | green | closes any open `uptime` / `uptime-blocked` issue |
| **blocked** — every failure was refused *before* reaching the app | 75 | green + warning | none, until blocked continuously for 6h (then one `uptime-blocked` issue) |
| **down** — a failure the app produced, or nothing answered | 1 | red | one `uptime` issue after **2 consecutive** down runs (~30 min) |

- **A 403 is not an outage.** `lscaturchio.xyz` is proxied through Cloudflare in
  front of Vercel, and Cloudflare's bot/WAF layer intermittently refuses the
  probe because it runs from an Azure datacentre IP. Between 2026-08-29 and
  08-31 that filed six outage issues (#181-#185, #188) for a site that was
  serving 200s to real traffic the whole time; every one auto-closed within
  ~20 minutes. A monitor that cries wolf six times in two days is worse than no
  monitor, because it also masks the real thing.
- The tell is that Vercel's routing headers (`x-matched-path`, `x-vercel-id`)
  are **absent**: the request never reached the deployment. `classifyFailure()`
  in `scripts/check-uptime.mjs` keys on exactly that, plus `cf-mitigated` and
  the Cloudflare block-page body. A 403 that *does* carry those headers is our
  own application refusing, and still counts as down.
- Failing results now record the status, the interesting response headers and
  the first 300 characters of the body. The old probe reported only
  `expected 200, got 403`, which is why six issues never revealed who sent it.
- To stop being blocked at all: add a Cloudflare WAF **skip** rule matching a
  secret header, then set the repo variable `UPTIME_BYPASS_HEADER` and the
  secret `UPTIME_BYPASS_TOKEN`. The probe sends the header when both are set.
- Streak state lives in an Actions cache (`uptime-state-*`). A cache miss resets
  the streak, which can only delay an alert by one run — never invent one.
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
- **Every JSON endpoint answers in one envelope** — `{ data, success }` on
  success, `{ error, success: false }` on failure (`src/lib/api-response.ts`).
  Body assertions therefore read through `body.data`; a check written against a
  bare payload silently sees `undefined` and reports a false failure.
- `/api/chat` is deliberately **not** probed on a schedule — it bills a real
  model call per request. Chat is covered post-deploy by `smoke:chat:prod`, and
  `/api/rag-status` verifies the same dependencies for free.
- GitHub's scheduled runners are best-effort and get delayed under load. Treat
  this as "we hear about it within the hour", not an SLA monitor; move to a
  hosted checker if it ever needs to page someone.

## Dependency Maintenance

Routine bumps are manual. `scripts/bump-deps.mjs` takes minors and patches,
regenerates `bun.lock`, and leaves majors for individual review.



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
- update `README.md` when workflows materially change
