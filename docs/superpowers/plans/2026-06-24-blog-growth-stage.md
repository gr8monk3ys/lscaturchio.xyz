# Blog Growth-Stage Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional digital-garden maturity stage (seedling / budding / evergreen) to blog posts, shown as a mono wall-label badge on index cards and post headers, and usable as a server-side filter on the blog index.

**Architecture:** One module owns the stage vocabulary and a validating guard. An optional `stage` field threads through the three existing meta paths (`blog-meta.ts` AST reader, `getAllBlogs.ts`, `blog-data.ts`). A small `StageBadge` server component renders it in both card and post header. The filter is a `?stage=` URL search param filtered server-side, mirroring the existing `?tag=` pattern — no client state.

**Tech Stack:** Next.js 16 App Router (React 19, server components), TypeScript strict, Tailwind v4 (`label-mono` utility), Vitest + Testing Library.

## Global Constraints

- TypeScript `strict` — no `any`, no `@ts-ignore`. Use `unknown` + narrowing.
- No emoji anywhere. Stage renders as uppercase mono text in the `label-mono` register, tinted `text-primary/70`.
- Server Components by default; add `"use client"` only for state/effects/handlers (none needed here).
- Degrade gracefully: an unknown/absent stage value resolves to `undefined` and renders nothing — never throw.
- 2-space indent, double quotes, semicolons (match surrounding files).
- Stage vocabulary is exactly the ordered triple: `seedling`, `budding`, `evergreen`.
- Run a single test file with `npx vitest run <path>`; full suite with `npm test`.

---

### Task 0: Commit the pending AssumedAudience essay edit

The working tree has one unrelated loose change (`building-rag-systems/content.mdx` uses `<AssumedAudience>`). Commit it first so later stage edits to the same file stay clean.

**Files:**
- Modify: `src/app/blog/building-rag-systems/content.mdx` (already edited, uncommitted)

- [ ] **Step 1: Confirm the only loose change is the essay edit**

Run: `git status --short`
Expected: a single ` M src/app/blog/building-rag-systems/content.mdx`

- [ ] **Step 2: Commit it**

```bash
git add src/app/blog/building-rag-systems/content.mdx
git commit -m "content(blog): add assumed-audience note to the RAG essay"
```

---

### Task 1: Stage vocabulary module

**Files:**
- Create: `src/lib/blog-stage.ts`
- Test: `src/__tests__/lib/blog-stage.test.ts`

**Interfaces:**
- Produces:
  - `type BlogStage = "seedling" | "budding" | "evergreen"`
  - `const BLOG_STAGES: readonly BlogStage[]`
  - `function isBlogStage(value: unknown): value is BlogStage`
  - `function filterByStage<T extends { stage?: BlogStage }>(items: T[], stage: string): T[]`
  - `const STAGE_LABELS: Record<BlogStage, { label: string; blurb: string }>`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/lib/blog-stage.test.ts
import { describe, it, expect } from "vitest";
import {
  BLOG_STAGES,
  isBlogStage,
  filterByStage,
  STAGE_LABELS,
} from "@/lib/blog-stage";

describe("isBlogStage", () => {
  it("accepts the three known stages", () => {
    expect(isBlogStage("seedling")).toBe(true);
    expect(isBlogStage("budding")).toBe(true);
    expect(isBlogStage("evergreen")).toBe(true);
  });

  it("rejects unknown strings and non-strings", () => {
    expect(isBlogStage("evergeen")).toBe(false);
    expect(isBlogStage("")).toBe(false);
    expect(isBlogStage(undefined)).toBe(false);
    expect(isBlogStage(null)).toBe(false);
    expect(isBlogStage(3)).toBe(false);
  });
});

describe("filterByStage", () => {
  const posts = [
    { slug: "a", stage: "evergreen" as const },
    { slug: "b", stage: "seedling" as const },
    { slug: "c" },
  ];

  it("narrows to the matching stage", () => {
    expect(filterByStage(posts, "evergreen").map((p) => p.slug)).toEqual(["a"]);
  });

  it("returns all posts when the stage is empty or invalid", () => {
    expect(filterByStage(posts, "")).toHaveLength(3);
    expect(filterByStage(posts, "bogus")).toHaveLength(3);
  });
});

describe("STAGE_LABELS / BLOG_STAGES", () => {
  it("has an uppercase label for every stage in order", () => {
    expect(BLOG_STAGES).toEqual(["seedling", "budding", "evergreen"]);
    for (const stage of BLOG_STAGES) {
      expect(STAGE_LABELS[stage].label).toBe(stage.toUpperCase());
      expect(STAGE_LABELS[stage].blurb.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/lib/blog-stage.test.ts`
Expected: FAIL — cannot resolve `@/lib/blog-stage`.

- [ ] **Step 3: Write the module**

```ts
// src/lib/blog-stage.ts

/** Digital-garden maturity stages, ordered seedling -> evergreen. */
export type BlogStage = "seedling" | "budding" | "evergreen";

export const BLOG_STAGES: readonly BlogStage[] = [
  "seedling",
  "budding",
  "evergreen",
];

/**
 * The single gate every stage value passes through. MDX `meta` is untyped at
 * the source level, so a typo like "evergeen" must degrade to "no stage"
 * rather than leak a broken value into the UI or a filter that matches nothing.
 */
export function isBlogStage(value: unknown): value is BlogStage {
  return (
    typeof value === "string" &&
    (BLOG_STAGES as readonly string[]).includes(value)
  );
}

/** Filter a list of stage-bearing items; empty/invalid stage returns all. */
export function filterByStage<T extends { stage?: BlogStage }>(
  items: T[],
  stage: string
): T[] {
  return isBlogStage(stage) ? items.filter((item) => item.stage === stage) : items;
}

export const STAGE_LABELS: Record<BlogStage, { label: string; blurb: string }> = {
  seedling: { label: "SEEDLING", blurb: "Rough notes, still forming." },
  budding: { label: "BUDDING", blurb: "Developing, partially revised." },
  evergreen: { label: "EVERGREEN", blurb: "Considered finished and maintained." },
};
```

> Note for the repo owner (learning hand-off): the `isBlogStage` body is the one
> spot with a real choice — silently drop an unknown stage (shown above) vs.
> emit a `console.warn` in dev. The plan ships the silent-drop version to keep
> the suite deterministic; swap in a guarded warn if you prefer.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/lib/blog-stage.test.ts`
Expected: PASS (3 describe blocks, all green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/blog-stage.ts src/__tests__/lib/blog-stage.test.ts
git commit -m "feat(blog): add growth-stage vocabulary, guard, and filter helper"
```

---

### Task 2: Read `stage` in `extractBlogMeta`

**Files:**
- Modify: `src/lib/blog-meta.ts`
- Test: `src/__tests__/lib/blog-meta.test.ts` (update existing + add cases)

**Interfaces:**
- Consumes: `BlogStage`, `isBlogStage` from `@/lib/blog-stage`.
- Produces: `BlogMeta.stage?: BlogStage` on the exported interface; `extractBlogMeta` now returns a `stage` key.

- [ ] **Step 1: Update the existing test and add new cases**

In `src/__tests__/lib/blog-meta.test.ts`, the first test's `toEqual(...)` object must gain `stage: undefined` (the source has no `stage`, and `extractBlogMeta` now always returns the key). Add `stage: undefined,` alongside `syndication: undefined,`.

Then append these tests inside the `describe('extractBlogMeta', ...)` block:

```ts
  it("reads a valid stage literal", () => {
    const source = `
      export const meta = {
        title: "T",
        date: "2025-02-13",
        stage: "evergreen",
      };
    `;
    expect(extractBlogMeta(source).stage).toBe("evergreen");
  });

  it("drops an unrecognized stage value", () => {
    const source = `
      export const meta = {
        title: "T",
        date: "2025-02-13",
        stage: "evergeen",
      };
    `;
    expect(extractBlogMeta(source).stage).toBeUndefined();
  });

  it("omits stage when absent", () => {
    const source = `
      export const meta = { title: "T", date: "2025-02-13" };
    `;
    expect(extractBlogMeta(source).stage).toBeUndefined();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/lib/blog-meta.test.ts`
Expected: FAIL — the new `stage` reads are `undefined`/missing and the updated `toEqual` won't match (no `stage` key returned yet).

- [ ] **Step 3: Implement the reader**

In `src/lib/blog-meta.ts`:

Add the import at the top (after the `typescript` import):

```ts
import { BlogStage, isBlogStage } from "@/lib/blog-stage";
```

Add `stage` to the `BlogMeta` interface (after `seriesOrder?: number;`):

```ts
  /** Digital-garden maturity stage. */
  stage?: BlogStage;
```

Add a reader function next to `readNumberValue`:

```ts
function readStageValue(expr: ts.Expression | undefined): BlogStage | undefined {
  const value = readStringValue(expr);
  return isBlogStage(value) ? value : undefined;
}
```

Add the field to the object returned by `extractBlogMeta` (after `seriesOrder: ...`):

```ts
    stage: readStageValue(getMetaPropertyExpression(metaObject, "stage")),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/lib/blog-meta.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blog-meta.ts src/__tests__/lib/blog-meta.test.ts
git commit -m "feat(blog): read growth stage from MDX meta via the AST reader"
```

---

### Task 3: Thread `stage` through `getAllBlogs` and `blog-data`

**Files:**
- Modify: `src/lib/getAllBlogs.ts`
- Modify: `src/lib/blog-data.ts`
- Test: `src/__tests__/lib/blog-data.test.ts` (create)

**Interfaces:**
- Consumes: `BlogStage` from `@/lib/blog-stage`; `extractBlogMeta` now returns `stage`.
- Produces: `BlogPost.stage?`, `BlogPreviewSource.stage?`, `BlogPreview.stage?`; `toBlogPreview` copies `stage`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/lib/blog-data.test.ts
import { describe, it, expect } from "vitest";
import { toBlogPreview } from "@/lib/blog-data";

const base = {
  slug: "x",
  title: "T",
  description: "D",
  date: "2025-02-13",
  tags: ["a"],
  image: "/img.webp",
};

describe("toBlogPreview", () => {
  it("passes stage through when present", () => {
    expect(toBlogPreview({ ...base, stage: "evergreen" as const }).stage).toBe(
      "evergreen"
    );
  });

  it("leaves stage undefined when absent", () => {
    expect(toBlogPreview(base).stage).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/lib/blog-data.test.ts`
Expected: FAIL — `stage` is not a property of the result type / is `undefined` for the present case.

- [ ] **Step 3: Implement the threading**

In `src/lib/blog-data.ts`:

Add the type import at the top:

```ts
import type { BlogStage } from "@/lib/blog-stage";
```

Add `stage?: BlogStage;` to both the `BlogPreviewSource` interface and the `BlogPreview` interface.

In `toBlogPreview`, add to the returned object (after `image: ...`):

```ts
    stage: blog.stage,
```

In `src/lib/getAllBlogs.ts`:

Add the type import at the top:

```ts
import type { BlogStage } from "@/lib/blog-stage";
```

Add `stage?: BlogStage;` to the local `BlogMeta` interface (after `seriesOrder?: number;`). `BlogPost extends BlogMeta`, so it inherits the field.

In `readBlog`, add to the returned object (after `seriesOrder: meta.seriesOrder,`):

```ts
    stage: meta.stage,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/lib/blog-data.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/getAllBlogs.ts src/lib/blog-data.ts src/__tests__/lib/blog-data.test.ts
git commit -m "feat(blog): thread growth stage through getAllBlogs and previews"
```

---

### Task 4: `StageBadge` component

**Files:**
- Create: `src/components/blog/stage-badge.tsx`
- Test: `src/__tests__/components/stage-badge.test.tsx`

**Interfaces:**
- Consumes: `BlogStage`, `STAGE_LABELS` from `@/lib/blog-stage`.
- Produces: `function StageBadge({ stage }: { stage?: BlogStage }): JSX.Element | null` — renders the tinted uppercase label, or `null` when stage is unset. Renders no separator (each call site supplies its own).

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/stage-badge.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageBadge } from "@/components/blog/stage-badge";

describe("StageBadge", () => {
  it("renders the uppercase stage label when set", () => {
    render(<StageBadge stage="evergreen" />);
    expect(screen.getByText("EVERGREEN")).toBeInTheDocument();
  });

  it("renders nothing when stage is undefined", () => {
    const { container } = render(<StageBadge />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/components/stage-badge.test.tsx`
Expected: FAIL — cannot resolve `@/components/blog/stage-badge`.

- [ ] **Step 3: Write the component**

```tsx
// src/components/blog/stage-badge.tsx
import type { BlogStage } from "@/lib/blog-stage";
import { STAGE_LABELS } from "@/lib/blog-stage";

/**
 * The maturity badge that hangs in a post's mono wall-label, e.g. EVERGREEN.
 * Tinted to set it apart from the date/tags; renders nothing when a post has
 * no stage. No leading separator — call sites add their own "·" to match the
 * surrounding label.
 */
export function StageBadge({ stage }: { stage?: BlogStage }) {
  if (!stage) return null;
  return <span className="text-primary/70">{STAGE_LABELS[stage].label}</span>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/components/stage-badge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/stage-badge.tsx src/__tests__/components/stage-badge.test.tsx
git commit -m "feat(blog): add StageBadge wall-label component"
```

---

### Task 5: Render the badge in `BlogCard` and `BlogLayout`

**Files:**
- Modify: `src/components/blog/BlogCard.tsx`
- Modify: `src/components/blog/BlogLayout.tsx`

**Interfaces:**
- Consumes: `StageBadge`, `BlogStage`. `BlogCard` receives `stage?` via the `{...blog}` spread (BlogPreview now carries it).

- [ ] **Step 1: Add stage to `BlogCard`**

In `src/components/blog/BlogCard.tsx`:

Add imports:

```ts
import type { BlogStage } from "@/lib/blog-stage";
import { StageBadge } from "@/components/blog/stage-badge";
```

Add `stage?: BlogStage;` to `BlogCardProps`, and add `stage,` to the destructured params.

Replace the label span:

```tsx
        <span className="label-mono mt-4 block">{label}</span>
```

with:

```tsx
        <span className="label-mono mt-4 block">
          {label}
          {stage ? (
            <>
              {"  ·  "}
              <StageBadge stage={stage} />
            </>
          ) : null}
        </span>
```

- [ ] **Step 2: Add stage to `BlogLayout`**

In `src/components/blog/BlogLayout.tsx`:

Add imports:

```ts
import type { BlogStage } from "@/lib/blog-stage";
import { StageBadge } from "@/components/blog/stage-badge";
```

Add `stage?: BlogStage;` to the local `BlogMeta` interface (after `seriesOrder?: number;`).

In the header wall-label `<div className="label-mono ...">`, insert the badge after the tags block and before `<ViewCounter ... />`:

```tsx
                {meta.stage && (
                  <>
                    <span aria-hidden className="text-foreground/25">·</span>
                    <StageBadge stage={meta.stage} />
                  </>
                )}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Run the component tests**

Run: `npx vitest run src/__tests__/components/`
Expected: PASS (existing + stage-badge).

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/BlogCard.tsx src/components/blog/BlogLayout.tsx
git commit -m "feat(blog): show growth-stage badge on cards and post header"
```

---

### Task 6: Stage filter on the blog index

**Files:**
- Modify: `src/app/blog/page.tsx`
- Modify: `src/components/blog/BlogGrid.tsx`

**Interfaces:**
- Consumes: `filterByStage`, `BLOG_STAGES`, `STAGE_LABELS`, `isBlogStage` from `@/lib/blog-stage`.
- Produces: `BlogGrid` gains a `stageFilter?: string` prop; `getBlogArchiveHref(page, tagFilter, stageFilter)` preserves both params.

- [ ] **Step 1: Filter in the page**

In `src/app/blog/page.tsx`:

Add the import:

```ts
import { filterByStage } from "@/lib/blog-stage";
```

Read the param and compose the filters. Replace:

```ts
  const tagFilter = getSearchParamValue(params, "tag");
```
...and the `filteredBlogs` block:
```ts
  const normalizedTag = tagFilter.trim().toLowerCase();
  const filteredBlogs = normalizedTag
    ? blogs.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase() === normalizedTag)
      )
    : blogs;
```

with:

```ts
  const tagFilter = getSearchParamValue(params, "tag");
  const stageFilter = getSearchParamValue(params, "stage");
  const normalizedTag = tagFilter.trim().toLowerCase();
  const tagFilteredBlogs = normalizedTag
    ? blogs.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase() === normalizedTag)
      )
    : blogs;
  const filteredBlogs = filterByStage(tagFilteredBlogs, stageFilter);
```

Pass `stageFilter` to `<BlogGrid ... />` (add the prop alongside `tagFilter={tagFilter}`):

```tsx
          stageFilter={stageFilter}
```

- [ ] **Step 2: Filter row + href threading in `BlogGrid`**

In `src/components/blog/BlogGrid.tsx`:

Add imports:

```ts
import { BLOG_STAGES, STAGE_LABELS, isBlogStage } from "@/lib/blog-stage";
```

Add `stageFilter?: string;` to `BlogGridProps`, and `stageFilter = "",` to the destructured params.

Update `getBlogArchiveHref` to take and preserve the stage:

```ts
function getBlogArchiveHref(
  page: number,
  tagFilter: string,
  stageFilter: string
): string {
  const params = new URLSearchParams();

  if (tagFilter) {
    params.set("tag", tagFilter);
  }

  if (stageFilter) {
    params.set("stage", stageFilter);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}
```

Update the two pagination `getBlogArchiveHref(...)` calls to pass `normalizedTag, stageFilter` (currently they pass `normalizedTag` only — add `, stageFilter`).

Add the stage filter row just inside the returned fragment, before the existing `{normalizedTag && (...)}` banner:

```tsx
      <nav
        aria-label="Filter by growth stage"
        className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4"
      >
        <span className="label-mono text-foreground/70">Stage</span>
        <Link
          href={getBlogArchiveHref(1, normalizedTag, "")}
          prefetch={false}
          aria-current={isBlogStage(stageFilter) ? undefined : "true"}
          className={`label-mono underline-offset-4 transition-colors hover:text-primary hover:underline ${
            isBlogStage(stageFilter) ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          All
        </Link>
        {BLOG_STAGES.map((stage) => {
          const active = stageFilter === stage;
          return (
            <Link
              key={stage}
              href={getBlogArchiveHref(1, normalizedTag, stage)}
              prefetch={false}
              aria-current={active ? "true" : undefined}
              title={STAGE_LABELS[stage].blurb}
              className={`label-mono underline-offset-4 transition-colors hover:text-primary hover:underline ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {STAGE_LABELS[stage].label}
            </Link>
          );
        })}
      </nav>
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/blog/page.tsx src/components/blog/BlogGrid.tsx
git commit -m "feat(blog): filter the index by growth stage via ?stage= param"
```

---

### Task 7: Demo backfill on two posts

**Files:**
- Modify: `src/app/blog/building-rag-systems/content.mdx`
- Modify: `src/app/blog/how-i-built-this-site/content.mdx`

- [ ] **Step 1: Mark the RAG essay evergreen**

In `src/app/blog/building-rag-systems/content.mdx`, add to the `meta` object (after `seriesOrder: 1,`):

```ts
  stage: "evergreen",
```

- [ ] **Step 2: Mark the build-log post budding**

In `src/app/blog/how-i-built-this-site/content.mdx`, add `stage: "budding",` to its `meta` object (place it after the last existing field, before the closing `};`). If the post has no `seriesOrder`, just add the line as a new property.

- [ ] **Step 3: Verify in the browser**

```bash
npm run dev
```

Then in another shell:

```bash
curl -s "http://localhost:3000/blog/building-rag-systems" | grep -o "EVERGREEN" | head -1
curl -s "http://localhost:3000/blog?stage=evergreen" | grep -o "Building RAG Systems" | head -1
curl -s "http://localhost:3000/blog?stage=budding" | grep -o "Building RAG Systems" | head -1
```

Expected: line 1 prints `EVERGREEN` (badge on the post). Line 2 prints the RAG title (it survives the evergreen filter). Line 3 prints nothing (the RAG post is filtered out of `budding`). Stop the dev server afterward (`pkill -f "next dev"`).

- [ ] **Step 4: Commit**

```bash
git add src/app/blog/building-rag-systems/content.mdx src/app/blog/how-i-built-this-site/content.mdx
git commit -m "content(blog): tag two posts with a growth stage (demo)"
```

---

### Task 8: Full verification

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Full test suite**

Run: `npm test`
Expected: all green, including the new `blog-stage`, `blog-data`, `blog-meta`, and `stage-badge` tests. Coverage thresholds (statements 75 / branches 66 / functions 72 / lines 76) still met.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: builds clean (the `/blog` route compiles with the new filter).

- [ ] **Step 5: Final commit (only if anything is uncommitted)**

```bash
git status --short
# If clean, nothing to do. Otherwise stage the specific files and commit.
```

---

## Self-Review

**Spec coverage:**
- Vocabulary module (BlogStage, BLOG_STAGES, isBlogStage, STAGE_LABELS) → Task 1. ✓ (added `filterByStage` for testable filtering.)
- `stage?` through blog-meta / getAllBlogs / blog-data → Tasks 2, 3. ✓
- Invalid/absent → undefined → Task 2 (reader) + Task 1 (guard tests). ✓
- StageBadge server component, `text-primary/70`, null when unset → Task 4. ✓
- Badge in BlogCard + BlogLayout wall-labels → Task 5. ✓
- `?stage=` server filter mirroring `?tag=`, composing with tag, preserving pagination → Task 6. ✓
- Tests for guard, extractBlogMeta, toBlogPreview, StageBadge, filter → Tasks 1–4. ✓
- Demo backfill 1–2 posts → Task 7. ✓
- Out of scope (interface merge, per-stage routes, sorting) → untouched. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. The one "owner may rewrite" note (Task 1) ships working code regardless. ✓

**Type consistency:** `BlogStage`, `isBlogStage`, `filterByStage`, `STAGE_LABELS`, `BLOG_STAGES`, `StageBadge({ stage })` used identically across Tasks 1–6. `extractBlogMeta` returns `stage`; consumers read `meta.stage` / `blog.stage`. `getBlogArchiveHref(page, tagFilter, stageFilter)` — all call sites updated in Task 6. ✓

**Note:** Task 2 must add `stage: undefined` to the existing `toEqual` assertion in `blog-meta.test.ts`, or that test breaks — called out explicitly in Task 2 Step 1.
