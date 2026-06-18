# Garden Rot-Guards — Design

**Date:** 2026-06-04
**Status:** Approved (pending spec review)
**Author:** Lorenzo + Claude (brainstorm)

## Context

`lscaturchio.xyz` is intentionally a sprawling personal "garden": a home for any
and all endeavors (blog, poems, movies, music, photos, books, guestbook, links,
chat, etc.), and the set of content types is expected to **keep growing**.
Breadth is a feature, not a scope problem.

A recent multi-dimension audit found the codebase is well-engineered (clean
hygiene, thoughtful security, good architecture) but that its *guardrails had
silently rotted*: CI was red for months (lockfile drift), the lint gate was
broken (ESLint walking a gitignored venv), `PROJECT-RULES.md` had drifted into
fiction, dead code and empty directories had accumulated, and the chat's
embeddings can go stale by hand with no signal. Those were already fixed on
branch `fix/reconcile-guardrails`; this design is about preventing the *class* of
problem from recurring.

The failure mode of a one-person garden is **silent rot**: you add faster than
you maintain, and breakage degrades quietly until a visitor finds it.

## Goal

Convert *silent* rot into *loud* rot at a one-person maintenance cost. When
something degrades — a feed dies, embeddings go stale, dead code piles up, CI
drifts — a robot tells you, not a visitor.

## Non-goals

- ❌ Test coverage across all ~270 components. Toys stay untested on purpose.
- ❌ Manual checklists / process you must remember to run.
- ❌ Trimming the garden. Breadth stays and will grow.
- ❌ Rearchitecting features.
- ❌ A maintenance system elaborate enough to itself need maintenance. Every
  guard must be cheap, boring, and (for toys) non-blocking.

## Guiding principles

1. **Make rot loud, not absent.** We surface drift; we don't promise zero drift.
2. **Frictionless growth.** Adding a new content type/section must never be taxed
   by a guard. Guards are non-blocking for "toy" code.
3. **Spend the maintenance budget only where breakage is expensive** (the
   load-bearing tier), and explicitly nowhere else.

## The two tiers

The spine of the design: what gets rigor vs. what is allowed to be scrappy.

**Boundary test:** *"If this breaks, do multiple unrelated features degrade or
silently lie?"* Yes → load-bearing. No → toy.

### 🏗️ Load-bearing (real tests, green CI, accurate docs, drift guards)
- `src/lib/*` shared infra: `db`, `embeddings`, `rate-limit` + `with-rate-limit`,
  `csrf`, `api-response`, `validations`, `chat/*`, `seo`, and the blog/content
  data pipeline (`blog-data`, `getAllBlogs`, `blog-meta`).
- The **MDX / content-rendering substrate** (every content type depends on it).
- API route **contracts** (the response shapes consumers depend on) +
  `middleware.ts`.
- Build/CI/config itself: lockfile, ESLint config, tsconfig, CI workflow.

### 🧸 Toys (explicitly best-effort, allowed to be untested)
- Individual feature pages and their bespoke UI: movies, books, guestbook,
  photos, podcast, links, now, uses, lab, stats, future poems/music, etc.
- The chat **UI component** is a toy even though the chat **lib** is load-bearing.
- Allowed to be untested; isolated enough that one breaking doesn't cascade.

## The guards

Each guard targets a specific rot with real precedent in this repo, runs
automatically, and is cheap.

### Guard 1 — Dead-code detection (knip)
- **Rot:** dead modules (e.g. the abandoned `src/lib/openai.ts`), empty
  scaffolding dirs, unused dependencies accumulating unseen.
- **Mechanism:** `knip.json` already exists but `knip` is not installed. Add
  `knip` as a devDependency, add an `npm run knip` script, and a CI job.
- **Mode:** **report-only** — annotates / produces a summary, never blocks a push.
- **Effort:** XS.

### Guard 2 — CI heartbeat (scheduled run)
- **Rot:** dependency/build rot, dead external feeds, production down — none of
  which a commit triggers. Today CI only runs on push/PR to `main`.
- **Mechanism:** add a `schedule:` cron (weekly) to `.github/workflows/ci.yml`
  that runs install → build → test, plus a smoke check against production using
  the existing `smoke:chat:prod` script.
- **Mode:** scheduled job; failures notify via the normal GitHub Actions failure
  path (email/UI). Does not block development.
- **Effort:** XS.

### Guard 3 — Embeddings freshness
- **Rot:** chat **silently** degrades when `public/my-data` changes but
  embeddings are not regenerated. `CLAUDE.md` even documents the rebuild as a
  manual step — a guaranteed-drift step.
- **Mechanism:** `scripts/generate-embeddings.ts` writes
  `src/generated/embeddings-manifest.ts` (a `file → content-hash` map of what it
  embedded), following the existing auto-generated `audio-manifest.ts`
  convention ("auto-generated, do not edit"). A check script recomputes hashes of
  `public/my-data` and reports any file that has drifted from what was last
  embedded.
- **Mode:** the *check* (a pure hash compare — no embeddings provider needed)
  runs in CI. It **defaults to report-only** and may be promoted to blocking on
  `main` (see Open Questions); the fix when it fires is a one-command rebuild.
- **Effort:** S–M.

### Guard 4 — Coverage re-scoping (make the tier policy real)
- **Rot:** the global vitest thresholds (statements 75 / branches 66 /
  functions 72 / lines 76) are a polite fiction — untested toy components dilute
  the number, so nobody trusts or enforces it.
- **Mechanism:** re-scope vitest `coverage` to the load-bearing set: a high bar
  on `src/lib/**` (and API route contracts), and exclude toy components from the
  gate entirely (`coverage.include` / per-glob thresholds).
- **Mode:** blocking for load-bearing code (that's the point); silent for toys.
- **Effort:** S. (May require a few tests to bring load-bearing modules to bar;
  most `src/lib` is already covered.)

### Guard 5 — Feed sandbox + health surface (optional, Phase 3)
- **Rot:** a dead Letterboxd / Goodreads / GitHub / webmention feed →
  silently empty page.
- **Mechanism:** wrap the four feed libs (`src/lib/goodreads.ts`,
  `letterboxd.ts`, `github-repos.ts`, `webmentions.ts`) in one uniform
  "try → degrade gracefully → record last-success/last-failure" helper, and
  surface each integration's status in `api/health` so dead feeds appear in one
  place instead of as quietly empty UI.
- **Mode:** non-blocking; observability only.
- **Effort:** M.

### Explicitly excluded
- A full internal-link crawler: fragile, needs a build step, and the guard
  itself would become rot. Excluded unless a cheap version falls out for free.

## Sequencing

Three independently-shippable phases, ordered by signal-per-effort. Each phase is
a clean stopping point.

- **Phase 1 — Automated spine (Guards 1, 2, 4).** Almost pure config/CI. Delivers
  most of the "stops rotting" value for near-zero effort; alone it would have
  caught everything the audit found.
- **Phase 2 — Protect the crown jewel (Guard 3).** Embeddings freshness. Chat is
  the most distinctive feature and its rot is the most invisible.
- **Phase 3 — Feeds go loud (Guard 5).** Optional. The feed sandbox + health
  surface.

## Acceptance criteria

- **Phase 1:** `knip` runs in CI report-only and currently flags the known dead
  code; CI has a weekly scheduled run that exercises build/test + prod smoke;
  vitest coverage gate applies to load-bearing code only and passes, with toys
  excluded; `npm run lint`, `npm run typecheck`, `npm test`, and
  `bun install --frozen-lockfile` all green.
- **Phase 2:** editing a file under `public/my-data` without rebuilding
  embeddings causes the freshness check to fail/report with the specific drifted
  files; after `npm run generate-embeddings`, the manifest updates and the check
  passes.
- **Phase 3:** killing a feed (simulated fetch failure) leaves its page
  gracefully empty AND shows a non-OK status for that integration in
  `api/health`.

## Open questions (resolve during planning)

1. **Guard 3 mode:** blocking on `main` vs. report-only. Leaning blocking for the
   content source since stale chat is invisible otherwise, but the rebuild
   requires an embeddings provider — confirm CI can run the *check* (hash compare,
   no provider needed) even if it cannot run the *rebuild*.
2. **knip baseline:** the repo has existing dead code; decide whether Phase 1
   also *removes* the currently-flagged dead code (`lib/openai.ts`, empty dirs)
   or just starts reporting it.

## Out of scope (possible later projects)

- Reconciling the dual API-response envelope across ~17 routes.
- Component test coverage beyond load-bearing.
- A content-authoring framework to make new content types even cheaper to add.
