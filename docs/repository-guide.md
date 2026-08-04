# Repository Guide

## Purpose

This repo powers the public `lscaturchio.xyz` site. It is part marketing site, part publishing platform, and part operational sandbox for content, chat, and SEO workflows.

## Top-Level Layout

- `src/app`: Next.js App Router routes, layouts, metadata routes, and API handlers
- `src/components`: reusable UI and page-level sections
- `src/constants`: structured content used by pages and APIs
- `src/lib`: shared business logic, integrations, validation, and data helpers
- `src/generated`: generated TypeScript artifacts
- `public`: static assets, generated audio, and retrieval source data
- `scripts`: recurring maintenance tasks and one-off operational helpers
- `e2e`: Playwright tests
- `supabase/migrations`: SQL history and migration notes
- `.claude`: optional Claude Code prompts, hooks, and orchestration helpers; not required for app runtime

## Route Conventions

- Static pages live in `src/app/<route>/page.tsx`
- API handlers live in `src/app/api/**/route.ts`
- Site metadata routes such as sitemap and robots live directly under `src/app`
- Blog posts live in `src/app/blog/<slug>/`

## Blog And Content Model

Blog routes are backed by per-slug folders under `src/app/blog/<slug>/`. Shared metadata and archive logic are aggregated by helpers in `src/lib/getAllBlogs.ts` and `src/lib/blog-data.ts`.

Related content inputs also live under `public/my-data/`, including:

- exported markdown used for retrieval and chat
- Goodreads and Letterboxd data
- other structured content sources used by page features

If retrieval inputs change and chat relevance matters, regenerate embeddings.

### Reading The Goodreads And Letterboxd Exports

`/books`, `/movies`, and the live sections of `/now` are rendered from the CSV
exports committed under `public/my-data/`. Two things about those files have
already caused bugs:

- **Parse them with `src/lib/csv.ts` (`parseCsv`), never by splitting on
  newlines.** Both services quote free-text fields (reviews, notes) that contain
  literal newlines. Splitting the file into lines first shreds those records and
  silently shifts every following column.
- **Letterboxd uses two URI namespaces.** `ratings.csv`, `watchlist.csv`, and the
  profile's `Favorite Films` column store the *film* URI (`boxd.it/251c`).
  `diary.csv` and `reviews.csv` store the *entry* URI for one specific viewing
  (`boxd.it/8mdUF3`). Joining across those files on `Letterboxd URI` matches
  nothing and fails quietly. Join on title + year — `filmKey()` in
  `src/lib/letterboxd.ts` — and let the most recent viewing win.

To refresh the data, replace the CSVs in place; no build step is required. The
top four films on `/movies` are read from the profile export, so re-pinning
favourites on Letterboxd and re-exporting is enough to change them.

## Generated Files

These are part of the current workflow and should not be edited by hand unless the generating workflow changes:

- `src/generated/audio-manifest.ts`
- files under `public/audio/` produced by the TTS pipeline

## Local Artifacts That Should Stay Out Of Git

These directories are expected during development and audits, but they are not part of the tracked source of truth:

- `.next`
- `coverage`
- `playwright-report`
- `test-results`
- `.lighthouseci`
- `.playwright-cli`
- `.playwright-mcp`
- `tmp`

## Repo Organization Rules

- Prefer keeping operational notes in `docs/` instead of long-lived scratch files
- Remove duplicate or superseded scripts instead of leaving both versions around
- Keep root-level files limited to active docs, config, and entry points
- If a file exists only to support a retired workflow, delete it and update docs in the same change
