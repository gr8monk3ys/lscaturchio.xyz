# Blog growth-stage metadata — design

Date: 2026-06-24
Branch: `feat/site-polish`
Status: approved, ready for implementation plan

## Goal

Give blog posts an optional digital-garden maturity stage — **seedling**,
**budding**, or **evergreen** (after Maggie Appleton) — surfaced as a mono
wall-label badge on both the index cards and the post header, and usable as a
filter on the blog index. Posts without a stage show nothing and behave exactly
as today.

## Decisions (settled during brainstorming)

- **Vocabulary:** exactly three ordered stages — `seedling`, `budding`,
  `evergreen`.
- **Default:** unmarked posts have no stage and render no badge. Stage is opt-in
  per post.
- **Visual treatment:** mono text in the existing `label-mono` style — **no
  emoji** (house style is "no emoji anywhere"). A faint `text-primary/70` tint
  distinguishes it from the date/tags in the same wall-label line.
- **Scope:** display on index cards + post header, **and** a stage filter on the
  blog index. Filter is server-side via a URL search param (`?stage=`),
  mirroring the existing `?tag=` pattern — no client state.

## Architecture

Single source of truth for the vocabulary; thread an optional `stage` field
through the existing data paths; render via one small presentational component;
filter via URL param.

### 1. Vocabulary module — `src/lib/blog-stage.ts` (new)

```ts
export type BlogStage = "seedling" | "budding" | "evergreen";

// ordered seedling -> evergreen, for filter rows and any future grouping
export const BLOG_STAGES: readonly BlogStage[] = ["seedling", "budding", "evergreen"];

export function isBlogStage(value: unknown): value is BlogStage { /* guard */ }

export const STAGE_LABELS: Record<BlogStage, { label: string; blurb: string }> = {
  seedling:  { label: "SEEDLING",  blurb: "Rough notes, still forming." },
  budding:   { label: "BUDDING",   blurb: "Developing, partially revised." },
  evergreen: { label: "EVERGREEN", blurb: "Considered finished and maintained." },
};
```

`isBlogStage` is the load-bearing piece: every read of stage (from MDX source
and from the `?stage=` param) is routed through it, so a typo degrades to "no
stage" rather than leaking a broken value into the UI or a filter that matches
nothing.

### 2. Data flow — add `stage?: BlogStage` to the three meta paths

The MDX `export const meta` object is the single source of truth, read two ways:

- **`src/lib/blog-meta.ts`** — add `stage?: BlogStage` to `BlogMeta`; in
  `extractBlogMeta`, read the `stage` property as a string and pass it through
  `isBlogStage`. Invalid or absent -> `undefined` (matches the codebase's
  degrade-don't-throw convention).
- **`src/lib/getAllBlogs.ts`** — add `stage?: BlogStage` to its `BlogMeta`
  interface and to `BlogPost`; map it in `readBlog`.
- **`src/lib/blog-data.ts`** — add `stage?: BlogStage` to `BlogPreviewSource`
  and `BlogPreview`; map it in `toBlogPreview`.

The three duplicate `BlogMeta`-shaped interfaces (in `blog-meta.ts`,
`getAllBlogs.ts`, and `BlogLayout.tsx`) all reference the shared `BlogStage`
type so the vocabulary itself is not re-duplicated. Merging the interfaces is
out of scope (see below).

### 3. Display — `StageBadge` server component

`src/components/blog/stage-badge.tsx` (new). Props: `{ stage?: BlogStage }`.
Returns `null` when `stage` is undefined; otherwise renders
`STAGE_LABELS[stage].label` as an inline span in the `label-mono` register with
a `text-primary/70` tint. Used in:

- **`BlogCard.tsx`** — appended to the `·`-joined wall-label under the cover.
  (The card currently builds `label` as a joined string; the badge is a
  separate inline element after it, so the tint is preserved.)
- **`BlogLayout.tsx`** — added to the header wall-label line
  (`date · reading time · tags · views`), and `BlogMeta` there gains
  `stage?: BlogStage`.

### 4. Filter — URL param, server-side (mirrors `?tag=`)

- **`src/app/blog/page.tsx`** — read `?stage=` via the existing
  `getSearchParamValue`, validate with `isBlogStage`, and add a `.filter()` pass
  that composes with the current tag filter. Pagination already keys off the
  filtered length, so it needs no change beyond preserving the param.
- **`src/components/blog/BlogGrid.tsx`** — add a filter row of `<Link>`s
  (`all · seedling · budding · evergreen`) with the active stage marked; reuse
  the existing "Filtered —" banner, empty-state, and "Clear filter" patterns;
  thread `stage` into `getBlogArchiveHref` so pagination and the tag filter
  preserve it.

## Testing

- `blog-stage`: `isBlogStage` accepts the three values, rejects garbage,
  null/undefined, and wrong types.
- `extractBlogMeta`: reads a valid stage; drops an invalid one; omits when
  absent.
- `toBlogPreview`: passes `stage` through when present and when absent.
- `StageBadge`: renders the label when set; renders `null` when unset.
- Filter: `?stage=evergreen` narrows the set; an invalid value falls back to all
  posts; `?stage=` composes correctly with `?tag=`.

Component coverage is thin in this repo, so the new component + lib both get
tests (per project testing rules).

## Out of scope (flagged, not done)

- Merging the three duplicate `BlogMeta` interfaces into one shared type.
- Per-stage routes / sitemap entries (`/stage/[stage]`, a `/garden` index).
- Sorting posts by stage.
- Backfilling stages across the existing corpus — 1–2 posts get a stage as a
  demo only; assigning the rest is editorial work for later.

## Implementation note (learning hand-off)

The `isBlogStage` guard and its invalid-value handling (~6 lines) is a small
spot with a real choice — silently drop an unrecognized stage vs. dev-warn — to
be written by the repo owner during implementation.
