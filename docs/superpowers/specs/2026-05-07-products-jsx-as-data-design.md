# Products: replace JSX-as-data with `details: string[]`

**Status:** approved, ready for implementation plan
**Author:** Lorenzo (with Claude)
**Date:** 2026-05-07

## Problem

`src/constants/products.tsx` is a 394-line data file. Each of the 8
product entries declares a `content` field of type `React.ReactNode`
that contains hard-coded JSX wrapping 1–3 paragraphs of plain text:

```tsx
content: (
  <div>
    <p>Implemented and collaborated on an open source teaching assistant…</p>
    <p>Included features of providing multi-modal results to queries…</p>
  </div>
),
```

This causes three concrete problems:

1. **Mixes data and markup.** Slugs, dates, metrics, results, and
   case studies are typed structured data; `content` is a JSX literal
   inside the same object.
2. **Cross-boundary fragility.** `Product.content?: React.ReactNode |
   string` is a type union that can't be safely serialized across
   server/client boundaries. Today this works only because the data
   is imported directly into client components, but it constrains
   future moves (Server Components, JSON output via the API route,
   etc.).
3. **Awkward editing.** Updating copy means editing TSX, including
   writing `&apos;` for apostrophes inside JSX.

Inspection of all 8 entries confirms none of the `content` JSX uses
richer features (no links, lists, bold, headings, code). It is
uniformly paragraphs of plain text.

## Goals

- Eliminate `React.ReactNode` from data files.
- Keep the same rendered output and visual treatment on
  `/projects/[slug]` pages.
- Stay narrowly scoped — do not refactor adjacent concerns.

## Non-goals

- Splitting `product-sections.tsx` into per-section files.
- Moving products data to JSON, MDX, or a CMS.
- Refactoring `deriveMetricsFromResults` or `defaultProcessSteps`.
- Changing the rich case-study fields (`metrics`, `process`,
  `whatIdDoNext`); they are already plain string-shaped.

## Architecture

Single contract change: replace `Product.content` with
`Product.details: string[]`. Each string is one paragraph of plain
text. `DetailsSection` maps `details` to `<p>` elements inside the
existing `prose` container.

Bundled cleanup: drop `Product.images: StaticImageData[] | string[]`.
All 8 products currently set `images: [thumbnail]` — a single-element
array that duplicates the existing `thumbnail` field. The
`HeroSection` thumbnail-browser conditional `product.images.length >
1` is dead code (always false).

## Components affected

| File | Change |
|------|--------|
| `src/types/products.ts` | Remove `content` and `images` from `Product`; add `details?: string[]` |
| `src/constants/products.tsx` | Migrate 8 entries: convert each `content` JSX block to a `details` string array; remove `images: [...]` lines |
| `src/components/projects/product-sections.tsx` | `DetailsSection` signature changes from `content: Product['content']` to `details: string[] \| undefined`; render each string as `<p>` inside the existing prose div. `HeroSection` drops the dead `images.length > 1` thumbnail-browser block |
| `src/components/projects/Product.tsx` | Pass `product.details` instead of `product.content`; the page-section conditional checks `details?.length` |

Total blast radius: 4 files.

## Data flow

Unchanged in shape. The constant is still imported directly by server
and client components; data still flows through the `Product` type
into `<DetailsSection>`. The only difference is that the data passing
through is now a `string[]` instead of a JSX tree.

## Error handling

`details` is optional. When `details` is `undefined` or an empty
array, `DetailsSection` returns `null` (mirrors today's
`if (!content) return null`).

## Migration notes

Every `content` block in `products.tsx` follows this pattern:

```tsx
// Before
content: (
  <div>
    <p>Constructed an automated blog content generation system using OpenAI&apos;s GPT-4 model…</p>
    <p>Accomplished workflows for generating SEO-optimized blog titles…</p>
  </div>
),

// After
details: [
  "Constructed an automated blog content generation system using OpenAI's GPT-4 model…",
  "Accomplished workflows for generating SEO-optimized blog titles…",
],
```

Conversion rules:

- Each `<p>` becomes one element in the array.
- HTML entities (`&apos;`, `&amp;`, etc.) decode back to their
  plain-text equivalents.
- The wrapping `<div>` is dropped — `DetailsSection` already wraps
  with the prose container.

## Testing strategy

- **`npm run typecheck`**: the type contract is the actual change;
  this is the primary gate.
- **`npm test`**: should pass unchanged. No existing test inspects
  the `content` field's structure or the products constant directly.
- **`npm run build`**: full Next build to catch SSG breakage on
  prerendered `/projects/[slug]` paths.
- **Manual visual check** on one project page (`/projects/talker`):
  required before declaring this done. Confirms paragraphs render
  with the same prose styling. Claude cannot verify this; the
  developer verifies.

## Risks and rollback

- **Risk:** A `&amp;` or other HTML entity inside a `content` JSX
  block doesn't get caught during conversion and ends up rendered
  literally. Mitigation: do a final pass searching `details` strings
  for `&[a-z]+;` patterns before committing.
- **Risk:** A consumer of `Product.content` (or `Product.images`)
  exists outside the four files listed and breaks at typecheck.
  Mitigation: typecheck is exhaustive — any missed reference fails
  the build, not at runtime.
- **Rollback:** single-commit change; `git revert` restores the
  prior shape.

## Out of scope, but related

These are deliberately deferred to separate specs:

1. Splitting `product-sections.tsx` (531 lines, 12 small named
   exports). Currently grouped, could be one-file-per-section. Pure
   organization, no behavior change.
2. Moving `deriveMetricsFromResults` and `defaultProcessSteps` to
   `src/lib/projects/` so `product-sections.tsx` is 100% UI.
3. Migrating products to a data-only file (JSON or per-project MDX)
   so editing copy doesn't require touching TSX. Debatable benefit
   for a single-author site.
