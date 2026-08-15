# Admin portal — design

**Date:** 2026-08-14
**Status:** approved (design), pending implementation plan

## Purpose

A login-protected portal at `/admin` on lscaturchio.xyz for publishing content
— blog posts, gallery photos, the now page, and the links page — without
editing the codebase locally or pushing commits by hand. The portal creates
the commits itself via the GitHub API; the site keeps its git-as-source-of-
truth architecture and the normal Vercel deploy pipeline.

Out of scope for v1: deploy-status polling via the Vercel API, draft
autosave, multi-user roles, the changelog (auto-generated from shipped PRs),
and the visitor-side bookmarks page (a localStorage feature, not site
content).

## Architecture

- **Routes:** `src/app/admin/*` — login page, dashboard, and one editor per
  content type (posts, photos, now, links). All pages are server-gated on the
  session and marked `noindex`.
- **API:** `src/app/api/admin/*` — `auth/login`, `auth/callback`,
  `auth/logout`, `posts` (list/create/update), `photos` (upload + publish),
  `data/now`, `data/links`. Every mutating route uses the project's existing
  Zod validation (`parseBody`), CSRF (`validateCsrf`), and rate-limit
  (`withRateLimit`) helpers, plus a session check.
- **Auth:** hand-rolled GitHub OAuth (single provider, single user — no
  NextAuth). The callback verifies the GitHub login equals
  `ADMIN_ALLOWED_LOGIN` (`gr8monk3ys`), then sets a signed httpOnly, secure,
  SameSite=Lax session cookie (HMAC with `ADMIN_SESSION_SECRET`, short expiry
  with refresh on activity).
- **Publishing:** a fine-grained GitHub PAT (`GITHUB_CONTENT_TOKEN`,
  contents: read/write, this repo only) held server-side. Multi-file changes
  (post + cover image; photos + JSON) land as **one commit to `main`** via
  the git trees API. Vercel deploys; the portal shows the commit URL and
  "live in ~2 min".
- **Conflict handling:** commits are built against the current `main` head;
  on a concurrent-push failure the server refetches head and retries once.
  Slug/file collisions are checked against GitHub before committing.
- **New env vars** (documented in `.env.example`):
  `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`,
  `ADMIN_ALLOWED_LOGIN`, `ADMIN_SESSION_SECRET`, `GITHUB_CONTENT_TOKEN`.
  When any is unset, `/admin` renders a "not configured" page instead of
  throwing (matching the repo's degrade-gracefully convention).

## Enabling refactor: data files, not code

The portal must never write TypeScript. Before the editors are built:

- `src/constants/photos.ts` keeps the `Photo` types and category list but
  reads entries from `src/data/photos.json`.
- `src/lib/now-data.ts` keeps its type and helpers but reads from
  `src/data/now.json`.
- `linksData` moves out of `src/app/links/page.tsx` into
  `src/data/links.json` (types stay in the page or move to `src/types`).

Rendering is unchanged. The portal's write surface is exactly:
`src/data/*.json`, `src/app/blog/<slug>/{content.mdx,page.tsx}`, and
`public/images/{blog,photos}/**`.

## Editors

### Posts

- Form for the `meta` export: title (auto-slugged, editable), description,
  tags, series + seriesOrder, stage, date (defaults today), optional cover
  image upload → `public/images/blog/<slug>.webp`.
- Markdown body in a textarea with client-side preview.
- Publish generates `content.mdx` (serialized meta block + body) and the
  boilerplate `page.tsx` (identical across posts except the slug).
- Edit mode lists posts from the GitHub tree, fetches `content.mdx`, parses
  the meta block back into the form (the block is machine-generated with a
  fixed shape; the parser targets that shape and falls back to raw-text
  editing if it does not match).
- **Pre-commit validation:** the server compiles the MDX and validates meta
  with Zod; broken content is rejected with the compile error shown in the
  form. If a bad commit ever lands anyway, a failed Vercel build leaves the
  live site on the previous deploy — the failure mode is "not published",
  never "site down".

### Photos

- Multi-file upload. Server pipeline (sharp): convert to webp q85, resize to
  max 1920px wide, compute aspect ratio (square/portrait/landscape).
- Form fields per photo: category, alt, camera, lens, settings, recipe?,
  location?, date.
- One commit adds the images under `public/images/photos/<category>/` and the
  entries to `src/data/photos.json`.
- Uploads are size-capped and content-type checked; sharp decoding is the
  effective image validation.

### Now / Links

- Forms mirroring the JSON shapes (now: focus/projects/etc.; links: sections
  of `{title, link, description}` with add/remove/reorder).
- Publish = one commit updating the JSON file, validated by Zod schemas
  derived from the existing types.

## Security

- PAT and OAuth secret are server-only; never sent to the client.
- Session cookie httpOnly + secure + SameSite=Lax; login endpoint
  rate-limited; OAuth `state` parameter enforced.
- All admin mutations CSRF-checked; `/admin` excluded from sitemap and
  `noindex`.
- The PAT is fine-grained to this single repo with contents scope only, so a
  leak cannot touch other repos or repo settings. Rotation documented in
  `docs/operations.md`.

## Testing

- Unit: slug generation, meta serialization + parsing round-trip, MDX
  pre-commit validation, photos.json entry construction, session
  sign/verify + allowlist.
- Route tests (`src/__tests__/api/admin/*`): auth gate, Zod rejection paths,
  publish flow with the GitHub API mocked (fetch mock), conflict retry.
- E2E: unauthenticated `/admin` redirects to login.
- Refactor safety: existing photos/now/links pages' tests keep passing after
  the JSON extraction.

## Docs

`docs/operations.md` gains a "Publishing via the portal" section: env setup,
creating/rotating the PAT and OAuth app, and the failure modes above.
`.env.example` gains the five new vars.
