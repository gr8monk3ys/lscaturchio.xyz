# Products JSX-as-data Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `Product.content: React.ReactNode` with `Product.details: string[]` across the 8 products and their consumer (`DetailsSection`), and drop the unused `Product.images` array.

**Architecture:** Three-step refactor that keeps the build green at every commit. Task 1 adds `details` alongside existing fields (additive). Task 2 switches the consumer (`DetailsSection`) and call site (`Product.tsx`) to read `details` instead of `content`, with a unit test driving the new signature. Task 3 removes the now-unreferenced `content` and `images` fields and their dead-code consumer in `HeroSection`.

**Tech Stack:** TypeScript, Next.js 16 App Router, React 19, vitest + @testing-library/react. No new dependencies.

**Spec:** [`docs/superpowers/specs/2026-05-07-products-jsx-as-data-design.md`](../specs/2026-05-07-products-jsx-as-data-design.md)

---

## Task 1: Add `details` field — type + data (additive)

This task is purely additive. After this task, every product has both `content` and `details`; the codebase still reads `content`. Build stays green.

**Files:**
- Modify: `src/types/products.ts`
- Modify: `src/constants/products.tsx`

### - [ ] Step 1.1: Add `details?: string[]` to the `Product` type

Modify `src/types/products.ts`. Find the `Product` type and add a `details` field next to `content`:

```ts
export type Product = {
  title: string;
  description: string;
  thumbnail: StaticImageData;
  images: StaticImageData[] | string[];
  href: string;
  slug?: string;
  stack?: string[];
  content?: React.ReactNode | string;
  details?: string[];
  // New fields for enhanced projects page
  categories?: ProjectCategory[];
  featured?: boolean;
  status?: ProjectStatus;
  demoUrl?: string;
  sourceUrl?: string;
  startDate?: string; // Format: "YYYY-MM"
  caseStudy?: CaseStudy;
};
```

### - [ ] Step 1.2: Run typecheck to confirm additive change is clean

Run: `npm run typecheck`
Expected: `✓ Types generated successfully`

### - [ ] Step 1.3: Migrate Talker (`src/constants/products.tsx` line 16-85)

Find the Talker product object. Below the existing `content: (...)` block, before the closing `},` of the product object, add:

```tsx
    details: [
      "Implemented and collaborated on an open source teaching assistant RAG leveraging OLlama2 with a FAISS knowledge base, answering students' questions based on class criteria, syllabus, and slides, increasing student engagement by 30%.",
      "Included features of providing multi-modal results to queries from classrooms such as YouTube videos with video time queues based on question context, enhancing learning efficiency by 25%.",
    ],
```

### - [ ] Step 1.4: Migrate Trading Bot (line 86-150)

Add to the AI-Powered Trading Bot product object:

```tsx
    details: [
      "Engineered an AI-powered trading bot that automates stock trading by analyzing market sentiment using FinBERT and integrating key technical indicators such as SMA and RSI. The bot employs strict risk management strategies, including portfolio-wide and individual position risk limits.",
      "Integrated with the Alpaca Trading API, enabling real-time trading and paper trading for safe strategy testing before live deployment.",
    ],
```

### - [ ] Step 1.5: Migrate LeetCode Solver (line 151-215)

```tsx
    details: [
      "Developed an automated bot that integrates GPT-4 with browser automation to solve LeetCode problems. The bot features automated login, random problem selection, intelligent solution generation, and automatic code submission, enhancing coding practice efficiency.",
      "Implemented persistent login state management and a detailed logging system to monitor activities and outcomes, ensuring reliability and ease of use.",
    ],
```

### - [ ] Step 1.6: Migrate Blog-AI (line 216-286)

```tsx
    details: [
      "Constructed an automated blog content generation system using OpenAI's GPT-4 model and LangChain.",
      "Accomplished workflows for generating SEO-optimized blog titles, descriptions, and detailed sections.",
      "Used Python and ConversationBufferMemory for maintaining context and orchestrating tasks.",
    ],
```

### - [ ] Step 1.7: Migrate Find My Doggo (line 290-315)

```tsx
    details: [
      "Collaborated on developing a web application for the 2019 Hack Merced event that assists users in finding lost dogs. The application allows users to upload a photo of a dog, which is then compared to a database using machine learning-based image recognition to identify potential matches.",
      "Used machine learning to improve the accuracy of image comparisons, providing a valuable tool for pet owners and shelters in reuniting lost dogs with their families.",
    ],
```

### - [ ] Step 1.8: Migrate Eyebook PDF Reader (line 316-341)

```tsx
    details: [
      "Built an e-book reader application that uses eye-tracking technology to provide hands-free control. Features include automatic scrolling when the user's gaze reaches the bottom of the page and navigation to the main menu when focusing on a button for a specified duration.",
      "Implemented using JavaScript and web technologies, this application enhances accessibility and offers a novel reading experience by reducing the need for manual interactions.",
    ],
```

### - [ ] Step 1.9: Migrate LinkFlame (line 342-367)

```tsx
    details: [
      "LinkFlame is a link management tool for creating, managing, and tracking links. It provides detailed analytics and customizable link appearance.",
      "Built with React, Node.js, and MongoDB. Integrates with various marketing platforms.",
    ],
```

### - [ ] Step 1.10: Migrate Paper Summarizer (line 368-393)

```tsx
    details: [
      "A tool for summarizing academic papers using NLP techniques. Extracts key points and generates concise summaries from research documents.",
      "Built with transformers for accurate extraction. Accepts papers from various sources.",
    ],
```

### - [ ] Step 1.11: Verify no HTML entities leaked into the strings

The original JSX used `&apos;` for apostrophes. The migrated strings should contain real `'` characters only.

Run: `grep -nE '&[a-z]+;' src/constants/products.tsx`
Expected: no matches.

### - [ ] Step 1.12: Run the full validation gauntlet

Run:
```bash
npm run lint && npm run typecheck && npm test
```
Expected: lint clean, types generated, 404+ tests pass.

### - [ ] Step 1.13: Commit

```bash
git add src/types/products.ts src/constants/products.tsx
git commit -m "feat(projects): add Product.details alongside content (additive)

Step 1 of the JSX-as-data refactor (see
docs/superpowers/specs/2026-05-07-products-jsx-as-data-design.md).
Adds details: string[] to the Product type and populates it on
all 8 products. Existing content field still works; consumer
switch happens in the next commit."
```

---

## Task 2: Test-drive new DetailsSection signature and switch consumer

This task changes the `DetailsSection` component's prop from `content` to `details` and updates `Product.tsx` to pass `product.details`. A new unit test pins the rendering behavior. After this task, the build is green and the data still flows; `Product.content` and `Product.images` remain in the type (we drop them in Task 3).

**Files:**
- Create: `src/__tests__/components/projects/details-section.test.tsx`
- Modify: `src/components/projects/product-sections.tsx` (the `DetailsSection` export)
- Modify: `src/components/projects/Product.tsx` (lines 62 and 100)

### - [ ] Step 2.1: Write the failing unit test

Create `src/__tests__/components/projects/details-section.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailsSection } from '@/components/projects/product-sections';

describe('DetailsSection', () => {
  it('renders each entry in details as a paragraph', () => {
    render(<DetailsSection details={['First paragraph.', 'Second paragraph.']} />);
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
  });

  it('returns null when details is undefined', () => {
    const { container } = render(<DetailsSection details={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when details is an empty array', () => {
    const { container } = render(<DetailsSection details={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('preserves order of paragraphs in DOM', () => {
    render(<DetailsSection details={['Alpha.', 'Bravo.', 'Charlie.']} />);
    const paragraphs = screen.getAllByText(/^(Alpha|Bravo|Charlie)\.$/);
    expect(paragraphs.map((el) => el.textContent)).toEqual([
      'Alpha.',
      'Bravo.',
      'Charlie.',
    ]);
  });
});
```

### - [ ] Step 2.2: Run the test and confirm it fails

Run: `npx vitest run src/__tests__/components/projects/details-section.test.tsx`
Expected: type error or runtime error — `DetailsSection` does not accept a `details` prop yet.

### - [ ] Step 2.3: Update `DetailsSection` to take `details: string[] | undefined`

In `src/components/projects/product-sections.tsx`, find the `DetailsSection` export (currently around line 390) and replace the entire function with:

```tsx
export function DetailsSection({ details }: { details: string[] | undefined }): React.ReactNode {
  if (!details || details.length === 0) return null

  return (
    <Reveal>
      <section id="details" className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Details</div>
        <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground">
          {details.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </Reveal>
  )
}
```

Note: `key={paragraph}` is safe because each product's paragraphs are unique strings within the same `details` array. This matches the keying convention elsewhere in this file (e.g., `ProcessSection` uses `key={`${step.title}-${step.description}`}`).

### - [ ] Step 2.4: Update `Product.tsx` page-section conditional (line 62)

Find this line in `src/components/projects/Product.tsx`:

```tsx
    ...(product.content ? [{ id: 'details', label: 'Details' }] : []),
```

Replace with:

```tsx
    ...(product.details && product.details.length > 0 ? [{ id: 'details', label: 'Details' }] : []),
```

### - [ ] Step 2.5: Update `Product.tsx` `DetailsSection` call site (line 100)

Find:

```tsx
          <DetailsSection content={product.content} />
```

Replace with:

```tsx
          <DetailsSection details={product.details} />
```

### - [ ] Step 2.6: Run the test and confirm it passes

Run: `npx vitest run src/__tests__/components/projects/details-section.test.tsx`
Expected: 4 tests pass.

### - [ ] Step 2.7: Run the full validation gauntlet

Run:
```bash
npm run lint && npm run typecheck && npm test && npm run build
```
Expected:
- Lint clean
- Types generated
- 408 tests pass (404 existing + 4 new)
- Next build succeeds; `/projects/[slug]` paths prerender (8 of them: talker, ai-powered-trading-bot, leetcode-solver-bot, blog-ai, find-my-doggo, eyebook-pdf-reader, linkflame, paper-summarizer)

### - [ ] Step 2.8: Manual visual check (developer-only)

Start the dev server: `npm run dev`
Open `http://localhost:3000/projects/talker` in a browser. Verify the "Details" section near the bottom of the page renders two paragraphs with the same prose styling as before. Repeat on one archived project (`/projects/find-my-doggo`) to confirm both styles work.

This step **cannot be automated** — Claude cannot verify the visual output. The developer is the only signal here.

### - [ ] Step 2.9: Commit

```bash
git add src/__tests__/components/projects/details-section.test.tsx \
        src/components/projects/product-sections.tsx \
        src/components/projects/Product.tsx
git commit -m "feat(projects): switch DetailsSection to render details: string[]

Step 2 of the JSX-as-data refactor. DetailsSection now takes
details: string[] | undefined and maps paragraphs to <p> nodes
inside the existing prose container. Product.tsx call site and
the page-sections conditional both read product.details.

A new unit test pins the rendering: paragraphs render in order,
empty/undefined details produces null, no markup leaks. Existing
Product.content remains in the type and data; removed in step 3."
```

---

## Task 3: Drop deprecated `content` and `images` fields

After Task 2, nothing reads `Product.content` or `Product.images`. The `images.length > 1` thumbnail browser in `HeroSection` is dead code (every product has a single-element `images: [thumbnail]`). This task removes all of it.

**Files:**
- Modify: `src/types/products.ts`
- Modify: `src/constants/products.tsx`
- Modify: `src/components/projects/product-sections.tsx` (the `HeroSection` export, around line 204)

### - [ ] Step 3.1: Remove `content` and `images` from `Product` type

In `src/types/products.ts`, the `Product` type currently looks like:

```ts
export type Product = {
  title: string;
  description: string;
  thumbnail: StaticImageData;
  images: StaticImageData[] | string[];
  href: string;
  slug?: string;
  stack?: string[];
  content?: React.ReactNode | string;
  details?: string[];
  // ...
};
```

Remove `images` and `content`:

```ts
export type Product = {
  title: string;
  description: string;
  thumbnail: StaticImageData;
  href: string;
  slug?: string;
  stack?: string[];
  details?: string[];
  // ...
};
```

### - [ ] Step 3.2: Run typecheck to surface every reference that needs to go

Run: `npm run typecheck`
Expected: type errors in `src/constants/products.tsx` (8 × `images:` lines, 8 × `content:` blocks) and `src/components/projects/product-sections.tsx` (the `HeroSection`'s `product.images` references, around line 232 and 234). The errors are the worklist for the next steps.

### - [ ] Step 3.3: Remove `images: [...]` from all 8 products

In `src/constants/products.tsx`, delete the `images: [<...>],` line from each of the 8 product objects:

- Talker (line 22): delete `images: [TAlker],`
- Trading Bot (line 92): delete `images: [tradingBot],`
- LeetCode Solver (line 157): delete `images: [leetcodeSolver],`
- Blog-AI (line 222): delete `images: [blogAI],`
- Find My Doggo (line 296): delete `images: [findMyDoggo],`
- Eyebook PDF Reader (line 322): delete `images: [eyebookReader],`
- LinkFlame (line 348): delete `images: [linkFlame],`
- Paper Summarizer (line 374): delete `images: [paperSummarizer],`

### - [ ] Step 3.4: Remove `content: (...)` JSX blocks from all 8 products

In each product object, delete the entire `content: (` ... `),` block. After this step, every product still has `details: [...]` (added in Task 1) but no `content` field.

This is a deletion-only step. After deletion, each product object should look like:

```tsx
  {
    href: "...",
    title: "...",
    description: "...",
    thumbnail: ...,
    stack: [...],
    slug: "...",
    featured: ...,
    categories: [...],
    status: "...",
    startDate: "...",
    sourceUrl: "...",
    caseStudy: { ... },
    details: [...],
  },
```

### - [ ] Step 3.5: Remove the dead thumbnail-browser block in `HeroSection`

In `src/components/projects/product-sections.tsx`, find the `HeroSection` export. Currently lines ~232-254 contain:

```tsx
        {product.images.length > 1 && (
          <div className="flex flex-row justify-center my-4 flex-wrap gap-2 px-6 pb-6">
            {product.images.map((image, index) => (
              <button
                key={`image-thumbnail-${image}`}
                type="button"
                onClick={() => onSelectImage(image)}
                className={cn(
                  'relative rounded-lg overflow-hidden border-2 transition-all bg-background',
                  activeImage === image ? 'border-primary' : 'border-border hover:border-primary/50'
                )}
              >
                <Image
                  src={image}
                  alt={`${product.title} thumbnail ${index + 1}`}
                  width={80}
                  height={60}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
```

Delete this entire block. The `HeroSection` should keep its top-level `<m.div>` with the main `<Image>`, but no longer render the thumbnail picker.

### - [ ] Step 3.6: Check whether `onSelectImage` is now unused

After step 3.5, `onSelectImage` is no longer referenced inside `HeroSection`. The prop type still declares it. Two cleanup options:

1. **Keep the prop** for now (state in `Product.tsx` still tracks `activeImage` via `useState`). Conservative.
2. **Remove the prop** and the `useState<StaticImageData | string>` in `Product.tsx`.

Choose option 2 (clean removal). In `src/components/projects/product-sections.tsx`, change the `HeroSectionProps` type:

```tsx
type HeroSectionProps = {
  activeImage: StaticImageData | string
  product: Product
  shared: boolean
}

export function HeroSection({ activeImage, product, shared }: HeroSectionProps): React.ReactNode {
```

(Drop `onSelectImage` from the type and the destructure.)

In `src/components/projects/Product.tsx`, simplify the state:

```tsx
// Before (line 27)
const [activeImage, setActiveImage] = useState<StaticImageData | string>(product.thumbnail)

// After
const activeImage: StaticImageData | string = product.thumbnail
```

And update the `HeroSection` call (line 90-95) to drop `onSelectImage`:

```tsx
          <HeroSection
            activeImage={activeImage}
            product={product}
            shared={shared}
          />
```

If `useState` is now unused in `Product.tsx`, remove it from the React import (line 3):

```tsx
// Before
import { useMemo, useState } from 'react'

// After
import { useMemo } from 'react'
```

### - [ ] Step 3.7: Run the full validation gauntlet

Run:
```bash
npm run lint && npm run typecheck && npm test && npm run build
```
Expected: lint clean, types generated, all tests pass, build succeeds with all 8 `/projects/[slug]` pages prerendered.

### - [ ] Step 3.8: Run knip to confirm no new dead code

Run: `npx knip`
Expected: no new findings beyond what existed before this refactor (`@tailwindcss/typography` is the existing one and is intentional).

### - [ ] Step 3.9: Manual visual re-verify (developer-only)

`npm run dev`, open `/projects/talker` again, confirm:
- Hero image still renders.
- No thumbnail picker below the hero (was always empty anyway).
- "Details" section still renders the same paragraphs as Task 2.

### - [ ] Step 3.10: Commit

```bash
git add src/types/products.ts \
        src/constants/products.tsx \
        src/components/projects/product-sections.tsx \
        src/components/projects/Product.tsx
git commit -m "refactor(projects): remove unused Product.content and images fields

Step 3 of the JSX-as-data refactor. Drops Product.content
(superseded by details), Product.images (always single-element,
duplicated thumbnail), and the HeroSection thumbnail-browser
block which was dead code (always rendered against
images.length === 1).

Also collapses the now-unused activeImage useState in Product.tsx
to a const since there's no longer anything that mutates it."
```

---

## Final Verification

### - [ ] Step F.1: Run the full check one more time on a clean tree

```bash
git status
npm run lint && npm run typecheck && npm test && npm run build
```
Expected: clean working tree, all checks pass, 8 `/projects/[slug]` pages prerendered, no new lint or knip findings.

### - [ ] Step F.2: Push the three commits

```bash
git push origin main
```

(Push will trigger Vercel deployment + CI on `main`. The two prior commits in this session's stack should already have been pushed; this push adds the three new commits from this plan.)

### - [ ] Step F.3: Smoke-test production after deploy

After the Vercel deploy goes green:

```bash
npm run smoke:chat:prod
```

(The chat smoke test isn't directly related to this refactor, but it's the standard post-deploy check per `docs/operations.md`.)

Verify `/projects/talker` and `/projects/find-my-doggo` on production load and render the Details section correctly.
