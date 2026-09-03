# Personal Site Reorientation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn lscaturchio.xyz from a portfolio that sells into a personal site that conveys who Lorenzo is, with the writing leading and projects as supporting evidence.

**Architecture:** Six surgical changes to existing constants and composition — `IDENTITY` propagates the new self-description to title/OG/schema in one edit; the homepage section order is rearranged in `src/app/page.tsx`; a new `src/lib/blog-themes.ts` provides the only genuinely new logic (mapping 83 posts onto five themes derived from real tag frequency). Two new routes (`/music`, `/colophon`) follow the existing page patterns.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind, Bun, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-30-personal-site-reorientation-design.md`

## Global Constraints

- Package manager is **Bun**. Never `npm install`. Verify with `bun run typecheck`, `bun run lint`, `bun run test`, `bunx knip`, `bun run build`.
- `bun run lint` runs `eslint --max-warnings 0` — zero warnings allowed.
- `bunx knip` must report no unused files. Deleting a component means deleting its now-orphaned imports.
- Editing any `content.mdx` requires reading `docs/writing-style.md` first, then running `bun run sync-retrieval-corpus`, or CI's drift check fails.
- Never verify UI with `next dev` — it 403s on static chunks in this environment. Use `bun run build && bun run start`.
- Identity strings live **only** in `src/constants/identity.ts`. Do not hardcode the role anywhere else.
- The bagpipes claim is **false** and must not survive anywhere in `src/`.
- Do not touch `/photos` — Lorenzo is supplying images himself.

---

### Task 1: Identity, hero, and the bagpipes correction

**Files:**
- Modify: `src/constants/identity.ts`
- Modify: `src/components/home/Hero.tsx:19-27`
- Modify: `src/components/about/PersonalFavorites.tsx:45`
- Modify: `src/app/about/page.tsx:15`
- Test: `src/__tests__/constants/identity.test.ts` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: `IDENTITY.role`, `IDENTITY.titleDefault`, `IDENTITY.tagline` — consumed by `src/app/layout.tsx`, `src/app/page.tsx`, and every `ogCardUrl()` caller.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/constants/identity.test.ts
import { describe, it, expect } from 'vitest';
import { IDENTITY } from '@/constants/identity';

describe('IDENTITY', () => {
  it('no longer describes Lorenzo with a job title', () => {
    expect(IDENTITY.role).not.toContain('AI Engineer');
    expect(IDENTITY.titleDefault).not.toContain('AI Engineer & Essayist');
  });

  it('uses the agreed self-description', () => {
    expect(IDENTITY.role).toBe('builds systems, suspicious of them');
    expect(IDENTITY.titleDefault).toBe(
      'Lorenzo Scaturchio — builds systems, suspicious of them'
    );
  });

  it('leads the tagline with the writing', () => {
    expect(IDENTITY.tagline).toMatch(/writes about/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/constants/identity.test.ts`
Expected: FAIL — `role` is still `"AI Engineer & Essayist"`.

- [ ] **Step 3: Update the identity constant**

```ts
// src/constants/identity.ts — replace the IDENTITY object body
export const IDENTITY = {
  name: "Lorenzo Scaturchio",
  /** Short self-description — used on OG cards and as schema.org Person.description. */
  role: "builds systems, suspicious of them",
  /** Default <title> and OpenGraph/Twitter title. */
  titleDefault: "Lorenzo Scaturchio — builds systems, suspicious of them",
  /** One-sentence description that echoes the homepage hero. */
  tagline:
    "Lorenzo Scaturchio writes about power, attention, and what institutions are actually built to do — and builds the AI systems those essays are suspicious of.",
} as const;
```

- [ ] **Step 4: Rewrite the hero copy**

In `src/components/home/Hero.tsx`, replace the eyebrow and paragraph:

```tsx
          <span className="label-mono block">Essays · Systems · Los Angeles</span>

          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Hey, I&apos;m <span className="text-primary">Lorenzo Scaturchio</span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
            I build AI systems and I&apos;m suspicious of them. I write about power,
            attention, and what institutions are actually built to do.
          </p>
```

- [ ] **Step 5: Remove the bagpipes claim**

In `src/components/about/PersonalFavorites.tsx`, replace the "Weird skill" entry value:

```tsx
  {
    label: "Weird Skill",
    value: "I can name a film from a single frame"
  },
```

In `src/app/about/page.tsx:15`, replace the metadata description:

```ts
  description: "Writer and engineer from Southern California — absurdism, Arctic Monkeys, film as introspection, and the seam between how systems are meant to work and how they do.",
```

- [ ] **Step 6: Verify no bagpipes survive and tests pass**

```bash
grep -ri "bagpipe" src/ && echo "STILL PRESENT — fix" || echo "clean"
bun run test src/__tests__/constants/identity.test.ts
bun run typecheck
```
Expected: `clean`, tests PASS, types OK.

- [ ] **Step 7: Commit**

```bash
git add src/constants/identity.ts src/components/home/Hero.tsx \
        src/components/about/PersonalFavorites.tsx src/app/about/page.tsx \
        src/__tests__/constants/identity.test.ts
git commit -m "feat(identity): describe Lorenzo as a person, not a job title

Also removes the bagpipes claim, which is not true."
```

---

### Task 2: Blog theme mapping

**Files:**
- Create: `src/lib/blog-themes.ts`
- Test: `src/__tests__/lib/blog-themes.test.ts` (create)

**Interfaces:**
- Consumes: `BlogMeta`-shaped objects; only `.tags: string[]` is read.
- Produces:
  - `export interface BlogTheme { slug: string; title: string; description: string; tags: string[] }`
  - `export const BLOG_THEMES: BlogTheme[]`
  - `export const FALLBACK_THEME_SLUG = 'everything-else'`
  - `export function themeForTags(tags: string[]): string` — returns a theme slug, never null.
  - `export function groupByTheme<T extends { tags: string[] }>(posts: T[]): Array<{ theme: BlogTheme; posts: T[] }>` — themes in `BLOG_THEMES` order, empty themes omitted, fallback last.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/lib/blog-themes.test.ts
import { describe, it, expect } from 'vitest';
import {
  BLOG_THEMES,
  FALLBACK_THEME_SLUG,
  themeForTags,
  groupByTheme,
} from '@/lib/blog-themes';

describe('themeForTags', () => {
  it('maps a post to the theme matching its first listed tag', () => {
    // "politics" is Power & Institutions; "philosophy" is Philosophy & the Self.
    // First tag wins so a post lands in exactly one theme.
    expect(themeForTags(['politics', 'philosophy'])).toBe('power-institutions');
    expect(themeForTags(['philosophy', 'politics'])).toBe('philosophy-self');
  });

  it('falls back rather than dropping a post with no known tag', () => {
    expect(themeForTags(['completely-unknown-tag'])).toBe(FALLBACK_THEME_SLUG);
    expect(themeForTags([])).toBe(FALLBACK_THEME_SLUG);
  });

  it('is case-insensitive', () => {
    expect(themeForTags(['Politics'])).toBe('power-institutions');
  });
});

describe('groupByTheme', () => {
  it('places every post in exactly one theme', () => {
    const posts = [
      { tags: ['politics'] },
      { tags: ['philosophy'] },
      { tags: ['economics'] },
      { tags: ['nonsense'] },
    ];
    const groups = groupByTheme(posts);
    const total = groups.reduce((n, g) => n + g.posts.length, 0);
    expect(total).toBe(posts.length);
  });

  it('omits empty themes and puts the fallback last', () => {
    const groups = groupByTheme([{ tags: ['politics'] }, { tags: ['nonsense'] }]);
    expect(groups).toHaveLength(2);
    expect(groups[0].theme.slug).toBe('power-institutions');
    expect(groups[groups.length - 1].theme.slug).toBe(FALLBACK_THEME_SLUG);
  });

  it('defines five real themes plus a fallback', () => {
    expect(BLOG_THEMES).toHaveLength(5);
    expect(BLOG_THEMES.map((t) => t.slug)).not.toContain(FALLBACK_THEME_SLUG);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/lib/blog-themes.test.ts`
Expected: FAIL — cannot resolve `@/lib/blog-themes`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/blog-themes.ts
/**
 * Themes derived from the actual tag distribution across all 83 essays, not
 * from the engineering-shaped TOPIC_HUBS that preceded them. Measured counts:
 * politics 25 · philosophy 24 · economics 24 · technology 18 · culture 10 ·
 * psychology 9 · institutions 9 · policy 8 · environment 7.
 */
export interface BlogTheme {
  slug: string;
  title: string;
  description: string;
  /** Lowercase blog tags that map into this theme. */
  tags: string[];
}

export const FALLBACK_THEME_SLUG = 'everything-else';

export const BLOG_THEMES: BlogTheme[] = [
  {
    slug: 'power-institutions',
    title: 'Power & institutions',
    description:
      'What systems were actually built to do, as opposed to what they say they do.',
    tags: ['politics', 'institutions', 'policy', 'united-states', 'immigration', 'organizing'],
  },
  {
    slug: 'philosophy-self',
    title: 'Philosophy & the self',
    description:
      'Absurdism, attention to one’s own mind, and the stories we tell to live with both.',
    tags: ['philosophy', 'psychology', 'religion', 'taoism'],
  },
  {
    slug: 'money-work',
    title: 'Money & work',
    description: 'Labour, incentives, and the economic theology we mistake for physics.',
    tags: ['economics', 'labor', 'work', 'productivity'],
  },
  {
    slug: 'technology-attention',
    title: 'Technology & attention',
    description:
      'Building the systems, and being honest about what they do to the people inside them.',
    tags: ['technology', 'attention', 'design', 'ai', 'rag', 'retrieval', 'llms'],
  },
  {
    slug: 'place-climate',
    title: 'Place & climate',
    description: 'Cities, water, community, and the physical substrate everything else sits on.',
    tags: ['environment', 'urban', 'community', 'climate', 'cities', 'housing'],
  },
];

const FALLBACK_THEME: BlogTheme = {
  slug: FALLBACK_THEME_SLUG,
  title: 'Everything else',
  description: 'Pieces that refuse to sit in one drawer.',
  tags: [],
};

/**
 * A post's theme is decided by its FIRST listed tag that matches a theme, so
 * every post appears exactly once. Posts matching nothing land in the fallback
 * rather than vanishing from the index.
 */
export function themeForTags(tags: string[]): string {
  for (const tag of tags) {
    const needle = tag.toLowerCase();
    const theme = BLOG_THEMES.find((t) => t.tags.includes(needle));
    if (theme) return theme.slug;
  }
  return FALLBACK_THEME_SLUG;
}

export function groupByTheme<T extends { tags: string[] }>(
  posts: T[],
): Array<{ theme: BlogTheme; posts: T[] }> {
  const buckets = new Map<string, T[]>();
  for (const post of posts) {
    const slug = themeForTags(post.tags);
    const bucket = buckets.get(slug);
    if (bucket) bucket.push(post);
    else buckets.set(slug, [post]);
  }

  const ordered = [...BLOG_THEMES, FALLBACK_THEME];
  return ordered
    .map((theme) => ({ theme, posts: buckets.get(theme.slug) ?? [] }))
    .filter((group) => group.posts.length > 0);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/__tests__/lib/blog-themes.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Sanity-check against the real corpus**

```bash
bun run test src/__tests__/lib/blog-themes.test.ts && bun run typecheck
```
Expected: PASS, types OK.

- [ ] **Step 6: Commit**

```bash
git add src/lib/blog-themes.ts src/__tests__/lib/blog-themes.test.ts
git commit -m "feat(blog): theme mapping derived from real tag distribution"
```

---

### Task 3: Replace the topic hubs with the five themes

**Files:**
- Modify: `src/constants/topics.ts`
- Modify: any consumer surfaced by `grep -rn "TOPIC_HUBS" src/`

**Interfaces:**
- Consumes: `BLOG_THEMES` from Task 2.
- Produces: `TOPIC_HUBS` keeps its existing `TopicHub[]` shape so `/topics` and `/topics/[slug]` keep compiling; only its contents change.

- [ ] **Step 1: Find every consumer before editing**

```bash
grep -rn "TOPIC_HUBS\|topics" src/app src/components src/lib | grep -v node_modules
```
Record the list. `/topics/[slug]` uses `generateStaticParams` over the hub slugs — changing slugs changes routes.

- [ ] **Step 2: Write the failing test**

```ts
// append to src/__tests__/lib/blog-themes.test.ts
import { TOPIC_HUBS } from '@/constants/topics';

describe('TOPIC_HUBS', () => {
  it('mirrors the five real themes instead of the old engineering hubs', () => {
    expect(TOPIC_HUBS).toHaveLength(5);
    const slugs = TOPIC_HUBS.map((h) => h.slug);
    expect(slugs).toContain('power-institutions');
    expect(slugs).not.toContain('rag-llms');
    expect(slugs).not.toContain('open-source-tools');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun run test src/__tests__/lib/blog-themes.test.ts`
Expected: FAIL — 8 hubs, includes `rag-llms`.

- [ ] **Step 4: Rewrite the constant from the themes**

Replace the `TOPIC_HUBS` array in `src/constants/topics.ts` so each entry derives from `BLOG_THEMES`, preserving the `TopicHub` interface:

```ts
import { BLOG_THEMES } from "@/lib/blog-themes";

export const TOPIC_HUBS: TopicHub[] = BLOG_THEMES.map((theme) => ({
  slug: theme.slug,
  title: theme.title,
  description: theme.description,
  tags: theme.tags,
}));
```

Keep the `TopicHub` interface declaration exactly as it is, including the optional `featuredPosts` / `featuredProjects` fields — dropping them would break any consumer that reads them.

- [ ] **Step 5: Add redirects for the retired hub slugs**

The old slugs were live URLs. In `next.config.mjs`, inside the existing `redirects()` array, add:

```js
      { source: '/topics/rag-llms', destination: '/topics/technology-attention', permanent: true },
      { source: '/topics/ai-society', destination: '/topics/technology-attention', permanent: true },
      { source: '/topics/systems-craft', destination: '/topics/technology-attention', permanent: true },
      { source: '/topics/work-economy', destination: '/topics/money-work', permanent: true },
      { source: '/topics/places-infrastructure', destination: '/topics/place-climate', permanent: true },
      { source: '/topics/open-source-tools', destination: '/topics/technology-attention', permanent: true },
```

- [ ] **Step 6: Run tests and build**

```bash
bun run test src/__tests__/lib/blog-themes.test.ts
bun run typecheck && bun run build
```
Expected: PASS; build emits `/topics/power-institutions` and the other four.

- [ ] **Step 7: Commit**

```bash
git add src/constants/topics.ts next.config.mjs src/__tests__/lib/blog-themes.test.ts
git commit -m "feat(topics): replace engineering hubs with the five real themes

Old hub URLs 308 to their nearest replacement."
```

---

### Task 4: Blog index grouped by theme

**Files:**
- Modify: `src/app/blog/page.tsx:76-133`
- Create: `src/components/blog/ThemedBlogSections.tsx`

**Interfaces:**
- Consumes: `groupByTheme`, `BLOG_THEMES` (Task 2); the existing `BlogGrid` component and `toBlogPreview`.
- Produces: `<ThemedBlogSections posts={...} />` — renders one titled section per non-empty theme.

- [ ] **Step 1: Write the component**

```tsx
// src/components/blog/ThemedBlogSections.tsx
import Link from "next/link";
import { groupByTheme } from "@/lib/blog-themes";
import type { BlogPreview } from "@/lib/blog-data";

// BlogPreview already carries slug/title/description/tags; declaring a local
// structural type here would silently drift from it.
export function ThemedBlogSections({ posts }: { posts: BlogPreview[] }) {
  const groups = groupByTheme(posts);

  return (
    <div className="space-y-14">
      {groups.map(({ theme, posts: themePosts }) => (
        <section key={theme.slug} aria-labelledby={`theme-${theme.slug}`}>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <h2 id={`theme-${theme.slug}`} className="text-xl font-semibold tracking-tight">
              {theme.title}
            </h2>
            <span className="label-mono shrink-0">{themePosts.length}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{theme.description}</p>
          <ul className="mt-6 space-y-4">
            {themePosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  prefetch={false}
                  className="group block"
                >
                  <span className="font-semibold text-foreground group-hover:text-primary">
                    {post.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground line-clamp-2">
                    {post.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the blog index**

In `src/app/blog/page.tsx`, when there is no active `tag`, `stage`, or `page` filter, render `<ThemedBlogSections posts={filteredBlogs.map(toBlogPreview)} />` instead of the paginated `<BlogGrid>`. When any filter IS active, keep the existing `BlogGrid` + pagination path unchanged — filtering is a date-ordered view and must keep working.

```tsx
const hasActiveFilter = Boolean(normalizedTag || stageFilter);
```

- [ ] **Step 3: Update the blog header copy**

```tsx
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Mostly arguments about power, money, and attention — with notes on the systems
            I build in between. Grouped by what they are about; the newest are always
            in the archive.
          </p>
```

- [ ] **Step 4: Verify**

```bash
bun run typecheck && bun run lint && bun run build
```
Then boot and confirm both paths render:
```bash
bun run start -p 3150 &
sleep 16
curl -s -o /dev/null -w "%{http_code} unfiltered\n" "http://localhost:3150/blog"
curl -s -o /dev/null -w "%{http_code} filtered\n"   "http://localhost:3150/blog?tag=politics"
```
Expected: `200` for both.

- [ ] **Step 5: Commit**

```bash
git add src/app/blog/page.tsx src/components/blog/ThemedBlogSections.tsx
git commit -m "feat(blog): group the index by theme, keep filters date-ordered"
```

---

### Task 5: Homepage recomposition

**Files:**
- Modify: `src/app/page.tsx:97-112`
- Create: `src/components/home/what-i-think.tsx`
- Create: `src/components/home/who-i-am.tsx`
- Modify: `src/app/work-with-me/page.tsx` (receive `HowIWorkSection`)
- Delete: nothing yet — `SelectedWriting` is removed from the homepage; run `bunx knip` and delete it only if it reports it unused.

**Interfaces:**
- Consumes: `groupByTheme` (Task 2); `getAllBlogs()` already called in `src/app/page.tsx`.
- Produces: `<WhatIThink posts={...} />`, `<WhoIAm />`.

- [ ] **Step 1: Build `WhatIThink`**

```tsx
// src/components/home/what-i-think.tsx
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { groupByTheme } from "@/lib/blog-themes";
import type { BlogPreview } from "@/lib/blog-data";

export function WhatIThink({ posts }: { posts: BlogPreview[] }) {
  // Top three themes by volume; the homepage is a doorway, not the archive.
  const groups = groupByTheme(posts)
    .sort((a, b) => b.posts.length - a.posts.length)
    .slice(0, 3);

  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="lg:sticky lg:top-28">
          <span className="label-mono mb-3 block">01 — What I think</span>
          <h2 className="text-section-title">Mostly arguments.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Eighty-three essays, grouped by what they are actually about. Politics,
            philosophy and economics outnumber the engineering three to one.
          </p>
          <Link
            href="/blog"
            prefetch={false}
            className="label-mono mt-8 inline-block text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Read everything →
          </Link>
        </div>

        <div className="space-y-10">
          {groups.map(({ theme, posts: themePosts }) => (
            <section key={theme.slug}>
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <h3 className="text-lg font-semibold tracking-tight">{theme.title}</h3>
                <span className="label-mono shrink-0">{themePosts.length}</span>
              </div>
              <ul className="mt-4 space-y-3">
                {themePosts.slice(0, 2).map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} prefetch={false} className="group block">
                      <span className="font-semibold text-foreground group-hover:text-primary">
                        {post.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground line-clamp-2">
                        {post.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Build `WhoIAm`**

First extract the favourites array out of `src/components/about/PersonalFavorites.tsx` into `src/constants/favorites.ts` (exported as `PERSONAL_FAVORITES`) and import it back into that component, so both surfaces read one source. Then:

```tsx
// src/components/home/who-i-am.tsx
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { PERSONAL_FAVORITES } from "@/constants/favorites";

export function WhoIAm() {
  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="lg:sticky lg:top-28">
          <span className="label-mono mb-3 block">03 — Who I am</span>
          <h2 className="text-section-title">The rest of it.</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Southern California. Absurdism, film as a way of thinking, and music
            made at home. I climb, run, and surf badly enough to keep enjoying it.
          </p>
          <Link
            href="/about"
            prefetch={false}
            className="label-mono mt-8 inline-block text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            More about me →
          </Link>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {PERSONAL_FAVORITES.slice(0, 8).map((item) => (
            <div key={item.label} className="border-b border-border pb-3">
              <dt className="label-mono">{item.label}</dt>
              <dd className="mt-1 text-sm text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Reorder the homepage**

```tsx
        <Hero />
        <CurrentlyStrip latestPost={latestPost} latestRepo={latestRepo} />
        <WhatIThink posts={selectedWriting} />
        <ScrollCaseStudies />
        <WhoIAm />
        <NewHereSection popularPosts={popularPosts} />
```

Remove `<HowIWorkSection />` and `<SelectedWriting ... />` from this file and drop their imports.

- [ ] **Step 4: Move `HowIWorkSection` to `/work-with-me`**

Import it in `src/app/work-with-me/page.tsx` and render it after the hero section. It is a client-safe presentational component; no prop changes needed.

- [ ] **Step 5: Renumber the section eyebrows**

`WhatIThink` = `01 — What I think`; `ScrollCaseStudies` = `02 — Things I made`; `WhoIAm` = `03 — Who I am`; `NewHereSection` = `04 — Start here`. Update the `index`/`label-mono` strings inside each component so the ledger reads in order.

- [ ] **Step 6: Verify**

```bash
bun run typecheck && bun run lint && bunx knip && bun run test && bun run build
```
Expected: all green; knip reports no unused files (delete `SelectedWriting` if it does).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): lead with the writing, demote projects, move process off the homepage"
```

---

### Task 6: Navigation

**Files:**
- Modify: `src/constants/navlinks.tsx:80-85` and `:120-160`
- Modify: `src/components/ui/navbar.tsx:15`

**Interfaces:**
- Consumes: nothing.
- Produces: `primaryNavigation` gains `Garden`; `Work With Me` becomes `Hire me`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/constants/navlinks.test.ts
import { describe, it, expect } from 'vitest';
import { primaryNavigation } from '@/constants/navlinks';

describe('primaryNavigation', () => {
  it('surfaces the garden at the top level', () => {
    expect(primaryNavigation.map((i) => i.name)).toContain('Garden');
  });

  it('no longer shouts Work With Me', () => {
    const names = primaryNavigation.map((i) => i.name);
    expect(names).not.toContain('Work With Me');
    expect(names).toContain('Hire me');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/constants/navlinks.test.ts`
Expected: FAIL — `Work With Me` present, `Garden` absent.

- [ ] **Step 3: Update `primaryNavigation`**

```tsx
export const primaryNavigation: NavItem[] = [
  { name: 'Writing', href: '/blog', icon: BookOpen, description: 'Essays and engineering notes' },
  { name: 'Projects', href: '/projects', icon: FolderKanban, description: 'Things I built' },
  { name: 'Garden', href: '/now', icon: Sparkles, description: 'Books, films, photos, experiments' },
  { name: 'About', href: '/about', icon: User, description: 'Who I am' },
  { name: 'Hire me', href: '/work-with-me', icon: Briefcase, description: 'Consulting and build work' },
];
```

- [ ] **Step 4: Remove the accent treatment**

In `src/components/ui/navbar.tsx:15`, set `const ACCENT_HREF = "";` so no primary item renders as the filled green pill. Leave the branch in place — it costs nothing and restores in one line if Lorenzo changes his mind.

- [ ] **Step 5: Add `/music` to the footer Garden column**

In `footerColumns`, add `{ name: 'Music', href: '/music' }` to the `Garden` category (the route arrives in Task 7; the link is added here so the nav change is one commit).

- [ ] **Step 6: Verify**

```bash
bun run test src/__tests__/constants/navlinks.test.ts && bun run typecheck && bun run lint
```
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/constants/navlinks.tsx src/components/ui/navbar.tsx src/__tests__/constants/navlinks.test.ts
git commit -m "feat(nav): surface the garden, stop shouting the hire-me CTA"
```

---

### Task 7: `/music`

**Files:**
- Create: `src/app/music/page.tsx`

**Interfaces:**
- Consumes: `Container`, `Heading`, `Paragraph` from `@/components/*` — follow `src/app/photos/page.tsx` exactly.
- Produces: route `/music`.

- [ ] **Step 1: Read the pattern to copy**

```bash
cat src/app/photos/page.tsx
```
Match its structure, metadata shape, and empty-state voice.

- [ ] **Step 2: Write the page**

Mirror `/photos`, with the kicker `Garden · Music`, an honest empty state in the same register as the photography page's "an empty gallery beats a borrowed one", and **no fabricated track list**. Something true and specific: indie/folk with industrial textures, produced at home.

- [ ] **Step 3: Verify**

```bash
bun run build && bun run start -p 3151 &
sleep 16
curl -s -o /dev/null -w "%{http_code} /music\n" http://localhost:3151/music
```
Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add src/app/music/page.tsx
git commit -m "feat(music): add the surface, empty until there is something real in it"
```

---

### Task 8: `/colophon` and the stale build post

**Files:**
- Create: `src/app/colophon/page.tsx`
- Modify: `src/app/blog/how-i-built-this-site/content.mdx`

**Interfaces:**
- Consumes: nothing.
- Produces: route `/colophon`.

- [ ] **Step 1: Read the writing-style rules first — this is mandatory**

```bash
cat docs/writing-style.md
```
Do not edit the post before reading this.

- [ ] **Step 2: Find every drifted technical claim**

```bash
grep -n "Next.js 14\|React 18\|Next 14" src/app/blog/how-i-built-this-site/content.mdx
node -e "const p=require('./package.json');console.log('next',p.dependencies.next,'react',p.dependencies.react)"
```
Correct **only** claims that are now false — versions, counts, stack names. Leave voice, argument, and structure untouched. Where a sentence explains *why* a choice was made, keep the reasoning even if the version number in it changes.

- [ ] **Step 3: Re-sync the retrieval corpus — skipping this fails CI**

```bash
bun run sync-retrieval-corpus
```

- [ ] **Step 4: Write the colophon page**

A short living page: what the site runs on, why those choices, what the garden staging means, how the RAG search works, and a link to the post for the long version. A dated essay ages; this should not. Follow the page pattern in `src/app/uses/page.tsx`.

- [ ] **Step 5: Verify**

```bash
bun run lint && bun run typecheck && bun run build
bun run start -p 3152 &
sleep 16
curl -s -o /dev/null -w "%{http_code} /colophon\n" http://localhost:3152/colophon
grep -c "Next.js 14" src/app/blog/how-i-built-this-site/content.mdx
```
Expected: `200`; grep count `0`. `bun run lint` includes the corpus drift check — if it fails, Step 3 was skipped.

- [ ] **Step 6: Commit**

```bash
git add src/app/colophon/page.tsx src/app/blog/how-i-built-this-site/content.mdx public/my-data
git commit -m "feat(colophon): add a living build page, correct the stale post's facts"
```

---

### Task 9: Whole-site verification

**Files:** none — verification only.

- [ ] **Step 1: Full check suite**

```bash
bun run typecheck && bun run lint && bunx knip && bun run test && bun run build
```
Expected: all green, knip clean.

- [ ] **Step 2: Confirm the reorientation actually landed**

```bash
grep -ri "bagpipe" src/ && echo FAIL || echo "no bagpipes"
grep -rn "AI Engineer & Essayist" src/ && echo FAIL || echo "no job title"
```
Expected: both clean.

- [ ] **Step 3: Render every touched route in both colour schemes**

Boot `bun run start -p 3153`, then with Playwright load `/`, `/blog`, `/blog?tag=politics`, `/projects`, `/about`, `/music`, `/colophon`, `/topics`, `/topics/power-institutions`, `/work-with-me` in `dark` and `light`. Assert: no response `>= 400`, and `document.documentElement.scrollWidth <= window.innerWidth + 1` at 390px and 768px.

- [ ] **Step 4: Confirm the old topic URLs still resolve**

```bash
for s in rag-llms ai-society systems-craft work-economy places-infrastructure open-source-tools; do
  curl -s -o /dev/null -w "%{http_code} /topics/$s\n" -L "http://localhost:3153/topics/$s"
done
```
Expected: `200` for all six (via 308).

- [ ] **Step 5: Commit any fixes, then open the PR**

Base the PR on `fix/site-audit-cleanup` (this work stacks on PR #187). Never `--draft`.
