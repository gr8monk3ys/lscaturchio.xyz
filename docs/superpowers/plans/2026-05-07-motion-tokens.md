# Motion Tokens & Reduced-Motion Compliance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-bucket duration scale + reduced-motion-aware `useMotionPreset` hook to `src/lib/motion.ts`, migrate ~23 inline framer-motion transition callsites to the hook, and add explicit reduced-motion gates to 4 spring-based callsites that can't use the hook.

**Architecture:** Three-task refactor. Task 1 adds the hook + a unit test. Task 2 mechanically migrates 23 plain-duration callsites (15 direct `transition={{}}` props + 5 Variants-object `transition:` keys + 3 in `ProjectViewToggle`). Task 3 adds `useReducedMotion()` gates to the 4 spring-based callsites. One deliberate exception (`testimonial-card.tsx:38-43` outer transition) keeps its bespoke ease — it's intent, not drift.

**Tech Stack:** TypeScript, React 19, framer-motion (re-exported via `src/lib/motion.ts`), vitest + @testing-library/react.

**Spec:** [`docs/superpowers/specs/2026-05-07-motion-tokens-design.md`](../specs/2026-05-07-motion-tokens-design.md)

---

## Task 1: Add `useMotionPreset` to `src/lib/motion.ts`

This task adds the new exports + a unit test. After this task, no consumer uses the hook yet — it just exists.

**Files:**
- Modify: `src/lib/motion.ts` (add exports)
- Create: `src/__tests__/lib/motion.test.tsx`

### - [ ] Step 1.1: Write the failing unit test

Create `src/__tests__/lib/motion.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock useReducedMotion before importing the module under test.
const useReducedMotionMock = vi.fn();
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  };
});

import { DURATIONS, EASINGS, useMotionPreset } from '@/lib/motion';

describe('motion presets', () => {
  it('exposes a 3-bucket duration scale', () => {
    expect(DURATIONS).toEqual({ fast: 0.2, default: 0.35, slow: 0.5 });
  });

  it('exposes a standard easing tuple', () => {
    expect(EASINGS.standard).toEqual([0.22, 1, 0.36, 1]);
  });
});

describe('useMotionPreset', () => {
  it('returns the requested duration and standard easing by default', () => {
    useReducedMotionMock.mockReturnValue(false);
    const { result } = renderHook(() => useMotionPreset('default'));
    expect(result.current.duration).toBe(0.35);
    expect(result.current.ease).toEqual([0.22, 1, 0.36, 1]);
  });

  it('honours the duration argument', () => {
    useReducedMotionMock.mockReturnValue(false);
    const { result } = renderHook(() => useMotionPreset('fast'));
    expect(result.current.duration).toBe(0.2);
  });

  it('returns duration 0 when reduced-motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    const { result } = renderHook(() => useMotionPreset('slow'));
    expect(result.current.duration).toBe(0);
  });

  it('keeps the easing tuple even when reduced-motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    const { result } = renderHook(() => useMotionPreset('default'));
    expect(result.current.ease).toEqual([0.22, 1, 0.36, 1]);
  });

  it('defaults to "default" duration and "standard" easing', () => {
    useReducedMotionMock.mockReturnValue(false);
    const { result } = renderHook(() => useMotionPreset());
    expect(result.current.duration).toBe(0.35);
    expect(result.current.ease).toEqual([0.22, 1, 0.36, 1]);
  });
});
```

### - [ ] Step 1.2: Run the test, verify it fails

Run: `npx vitest run src/__tests__/lib/motion.test.tsx`
Expected: import error or `useMotionPreset is not a function` — these exports don't exist yet.

### - [ ] Step 1.3: Add the exports to `src/lib/motion.ts`

Replace the contents of `src/lib/motion.ts` with:

```ts
import { useReducedMotion } from 'framer-motion';

export {
  AnimatePresence,
  LayoutGroup,
  LazyMotion,
  MotionConfig,
  m,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'

export const loadMotionFeatures = (): Promise<typeof import('framer-motion')['domAnimation']> =>
  import('framer-motion').then((mod) => mod.domAnimation)

// CSS --duration-* tokens are scoped to hover/focus (150–300ms).
// These JS-side tokens are for framer-motion entrance, exit, and
// layout animations, which cover larger movement and run 2–3× longer.
export const DURATIONS = {
  fast: 0.2,      // crisp UI feedback (toggle states, small reveals)
  default: 0.35,  // default entrance — most callsites should use this
  slow: 0.5,      // expressive reveals (hero, big section enter)
} as const;

export const EASINGS = {
  standard: [0.22, 1, 0.36, 1] as const,  // matches CSS --reveal-ease
} as const;

export function useMotionPreset(
  duration: keyof typeof DURATIONS = 'default',
  easing: keyof typeof EASINGS = 'standard',
): { duration: number; ease: readonly number[] } {
  const reduce = useReducedMotion();
  return {
    duration: reduce ? 0 : DURATIONS[duration],
    ease: EASINGS[easing],
  };
}
```

### - [ ] Step 1.4: Run the test, verify all 6 cases pass

Run: `npx vitest run src/__tests__/lib/motion.test.tsx`
Expected: 6 tests pass.

### - [ ] Step 1.5: Run the full validation gauntlet

Run: `npm run lint && npm run typecheck && npm test`
Expected: lint clean, types generated, all tests pass (414 = 408 existing + 6 new).

### - [ ] Step 1.6: Commit

```bash
git add src/lib/motion.ts src/__tests__/lib/motion.test.tsx
git commit -m "feat(motion): add useMotionPreset hook with reduced-motion support

Step 1 of the motion tokens refactor (see
docs/superpowers/specs/2026-05-07-motion-tokens-design.md).

Adds DURATIONS (3-bucket scale: fast/default/slow), EASINGS
(standard cubic matching CSS --reveal-ease), and a
useMotionPreset hook that returns transition values and respects
prefers-reduced-motion. No consumers yet — migrations land in
the next two commits."
```

---

## Task 2: Migrate 23 callsites to `useMotionPreset`

Each callsite below maps a current inline transition to a `useMotionPreset` invocation. Where the existing transition has additional keys (`delay`, `staggerChildren`, etc.), spread `useMotionPreset(...)` into the new object.

**Files (12 total):**
- Modify: `src/app/secret/secret-page-content.tsx`
- Modify: `src/components/Paragraph.tsx`
- Modify: `src/components/home/testimonial-card.tsx` (whileHover only — outer transition keeps bespoke ease)
- Modify: `src/components/pages/unsubscribe-page-client.tsx`
- Modify: `src/components/projects/EnhancedProjectCard.tsx`
- Modify: `src/components/projects/Product.tsx`
- Modify: `src/components/projects/ProjectGallery.tsx`
- Modify: `src/components/projects/ProjectRail.tsx`
- Modify: `src/components/projects/ProjectTimeline.tsx`
- Modify: `src/components/projects/ProjectViewToggle.tsx`
- Modify: `src/components/projects/product-sections.tsx`
- Modify: `src/components/services/faq-section.tsx`
- Modify: `src/components/services/service-section.tsx`
- Modify: `src/components/ui/section-heading.tsx`

### - [ ] Step 2.1: `src/components/services/service-section.tsx`

Add `useMotionPreset` to the existing import from `@/lib/motion`. Replace 3 callsites:

| Line | Before | After |
|------|--------|-------|
| 32 | `transition={{ duration: 0.5 }}` | `transition={useMotionPreset('slow')}` |
| 72 | `transition={{ duration: 0.5 }}` | `transition={useMotionPreset('slow')}` |
| 96 | `transition={{ duration: 0.3 }}` | `transition={useMotionPreset('default')}` |

### - [ ] Step 2.2: `src/components/services/faq-section.tsx`

Add `useMotionPreset` import. Replace 4 callsites:

| Line | Before | After |
|------|--------|-------|
| 37 | `transition={{ duration: 0.5 }}` | `transition={useMotionPreset('slow')}` |
| 46 | `transition={{ duration: 0.5, delay: 0.2 }}` | `transition={{ ...useMotionPreset('slow'), delay: 0.2 }}` |
| 54 | `transition={{ duration: 0.5, delay: 0.3 }}` | `transition={{ ...useMotionPreset('slow'), delay: 0.3 }}` |
| 77 | `transition={{ duration: 0.3 }}` | `transition={useMotionPreset('default')}` |

### - [ ] Step 2.3: `src/components/projects/ProjectViewToggle.tsx`

Add `useMotionPreset` import. Replace 3 plain-transition callsites (line 62 is a spring — handled in Task 3):

| Line | Before | After |
|------|--------|-------|
| 98 | `transition={{ duration: 0.2 }}` | `transition={useMotionPreset('fast')}` |
| 108 | `transition={{ duration: 0.2 }}` | `transition={useMotionPreset('fast')}` |
| 118 | `transition={{ duration: 0.2 }}` | `transition={useMotionPreset('fast')}` |

### - [ ] Step 2.4: `src/components/projects/product-sections.tsx`

Add `useMotionPreset` import. Replace 2 callsites:

| Line | Before | After |
|------|--------|-------|
| 210 | `transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}` | `transition={useMotionPreset('default')}` |
| 389 | `transition={{ duration: 0.5, delay: 0.3 }}` | `transition={{ ...useMotionPreset('slow'), delay: 0.3 }}` |

### - [ ] Step 2.5: `src/components/projects/Product.tsx`

Add `useMotionPreset` import. Replace 1 callsite:

| Line | Before | After |
|------|--------|-------|
| 70 | `transition={{ duration: 0.25 }}` | `transition={useMotionPreset('fast')}` |

### - [ ] Step 2.6: `src/components/projects/ProjectGallery.tsx`

Add `useMotionPreset` import. Replace 1 callsite:

| Line | Before | After |
|------|--------|-------|
| 151 | `transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}` | `transition={useMotionPreset('fast')}` |

### - [ ] Step 2.7: `src/components/projects/ProjectTimeline.tsx`

Add `useMotionPreset` import. Replace 1 callsite:

| Line | Before | After |
|------|--------|-------|
| 111 | `transition={{ duration: 0.4, delay: index * 0.1 }}` | `transition={{ ...useMotionPreset('default'), delay: index * 0.1 }}` |

### - [ ] Step 2.8: `src/components/projects/ProjectRail.tsx`

Add `useMotionPreset` import. The transition lives inside a Variants object on line 86. Replace:

```tsx
// Before (line 86, inside Variants)
transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
```

This is a Variants-object form, not a `transition={{}}` prop. The hook can't be called inside a top-level Variants definition, but it CAN be called inside the component body, and the result spread into the Variants. Refactor pattern:

```tsx
// Move the Variants definition into the component body if it's not already there,
// and use the hook result. Example structure:
function MyComponent() {
  const transition = useMotionPreset('fast');
  const variants = {
    // ...other variant keys...
    hover: { /* ...*/, transition },
  };
  return <m.div variants={variants} ... />;
}
```

If `ProjectRail.tsx` already declares the Variants outside the component, move the variant inside the component body and inject the transition. Read the file first to confirm structure before editing.

### - [ ] Step 2.9: `src/components/projects/EnhancedProjectCard.tsx`

Add `useMotionPreset` import. Replace 1 whileHover-inline transition:

```tsx
// Before (line 48)
: { whileHover: { y: -4, transition: { duration: 0.2 } } };

// After — call the hook in the component body and reference the result:
// (in component body)
const fastTransition = useMotionPreset('fast');
// (in the conditional/return)
: { whileHover: { y: -4, transition: fastTransition } };
```

If `whileHover` is part of a constant declared at module scope, move it into the component body so the hook can be invoked.

### - [ ] Step 2.10: `src/components/home/testimonial-card.tsx`

Add `useMotionPreset` import. **Only migrate the whileHover transition (line 45). Leave the outer `transition={{ duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}` (lines 38-43) inline — the bespoke ease is deliberate per spec.**

| Line | Before | After |
|------|--------|-------|
| 45 (whileHover) | `transition: { duration: 0.2, ease: 'easeOut' as const },` | `transition: useMotionPreset('fast'),` (call the hook in the component body, then reference) |

If the whileHover object is declared at module scope, move it inside the component so the hook can be called.

### - [ ] Step 2.11: `src/components/Paragraph.tsx`

Add `useMotionPreset` to the existing motion import. The `transition` lives inside a Variants object at module scope (lines 19-22). Move the Variants into the component body so the hook can be called. Pattern:

```tsx
// Before (module-scope variants on lines 12-24)
const paragraphVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    }
  }
};

// After — declare inside the component body:
export function Paragraph({ children, className }: ParagraphProps) {
  const transition = useMotionPreset('slow');
  const paragraphVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition },
  };
  return (
    <m.p variants={paragraphVariants} ... />
  );
}
```

### - [ ] Step 2.12: `src/components/pages/unsubscribe-page-client.tsx`

Add `useMotionPreset` import. Replace 1 callsite:

| Line | Before | After |
|------|--------|-------|
| 19 | `transition={{ duration: 0.5 }}` | `transition={useMotionPreset('slow')}` |

### - [ ] Step 2.13: `src/components/ui/section-heading.tsx`

Add `useMotionPreset` import. Replace 1 callsite:

| Line | Before | After |
|------|--------|-------|
| 15 | `transition={{ duration: 0.5 }}` | `transition={useMotionPreset('slow')}` |

### - [ ] Step 2.14: `src/app/secret/secret-page-content.tsx`

Add `useMotionPreset` import. Replace 1 plain-transition callsite (line 51 is a spring, handled in Task 3; the `delay`-only callsites on lines 69, 81, 114, 131, 146 are out of scope per spec).

| Line | Before | After |
|------|--------|-------|
| 45 | `transition={{ duration: 0.6 }}` | `transition={useMotionPreset('slow')}` |

(Note: 0.6 collapses to 0.5 per the spec's bucket consolidation. Imperceptible.)

### - [ ] Step 2.15: Run the full validation gauntlet

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected:
- Lint clean.
- Types generated; the hook return type satisfies framer-motion's `Transition`.
- 414 tests pass.
- Build succeeds; all prerendered pages render.

### - [ ] Step 2.16: Commit

```bash
git add src/components/Paragraph.tsx \
        src/components/home/testimonial-card.tsx \
        src/components/pages/unsubscribe-page-client.tsx \
        src/components/projects/EnhancedProjectCard.tsx \
        src/components/projects/Product.tsx \
        src/components/projects/ProjectGallery.tsx \
        src/components/projects/ProjectRail.tsx \
        src/components/projects/ProjectTimeline.tsx \
        src/components/projects/ProjectViewToggle.tsx \
        src/components/projects/product-sections.tsx \
        src/components/services/faq-section.tsx \
        src/components/services/service-section.tsx \
        src/components/ui/section-heading.tsx \
        src/app/secret/secret-page-content.tsx
git commit -m "refactor(motion): migrate 23 callsites to useMotionPreset

Step 2 of the motion tokens refactor. Replaces inline duration/
ease values with the new useMotionPreset hook, which respects
prefers-reduced-motion automatically.

Bucket consolidation:
- 0.6 -> 0.5 (slow), 0.45 -> 0.5, 0.4 -> 0.35 (default).
  All differences below human perception threshold.

Exception: testimonial-card.tsx outer transition keeps its
bespoke ease [0.6, -0.05, 0.01, 0.99] — deliberate intent per
spec, not drift."
```

---

## Task 3: Add reduced-motion gates to 4 spring-based callsites

Springs have no `duration` field, so they can't use `useMotionPreset`. Each callsite below gets a `useReducedMotion()` check that swaps the spring config for `{ duration: 0 }` when reduced-motion is preferred.

**Files (4 total):**
- Modify: `src/components/ui/pricing-tab.tsx`
- Modify: `src/components/projects/ProjectSortToggle.tsx`
- Modify: `src/components/projects/ProjectViewToggle.tsx`
- Modify: `src/app/secret/secret-page-content.tsx`

### - [ ] Step 3.1: `src/components/ui/pricing-tab.tsx`

Add `useReducedMotion` to the import from `@/lib/motion`. In the component body, declare:

```tsx
const reduce = useReducedMotion();
```

Replace line 35:

```tsx
// Before
transition={{ type: "spring" as const, duration: 0.4 }}

// After
transition={reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.4 }}
```

### - [ ] Step 3.2: `src/components/projects/ProjectSortToggle.tsx`

Add `useReducedMotion` import. In the component body, declare `const reduce = useReducedMotion();`. Replace line 55:

```tsx
// Before
transition={{ type: "spring" as const, bounce: 0.2, duration: 0.45 }}

// After
transition={reduce ? { duration: 0 } : { type: 'spring' as const, bounce: 0.2, duration: 0.45 }}
```

### - [ ] Step 3.3: `src/components/projects/ProjectViewToggle.tsx`

The other 3 transitions in this file were migrated in Task 2.6. This step handles the spring on line 62.

Add `useReducedMotion` to the import (it may already be imported alongside `useMotionPreset` from Task 2.6). In the component body:

```tsx
const reduce = useReducedMotion();
```

Replace line 62:

```tsx
// Before
transition={{ type: "spring" as const, bounce: 0.2, duration: 0.4 }}

// After
transition={reduce ? { duration: 0 } : { type: 'spring' as const, bounce: 0.2, duration: 0.4 }}
```

### - [ ] Step 3.4: `src/app/secret/secret-page-content.tsx`

Add `useReducedMotion` to the import (it may already be imported alongside `useMotionPreset` from Task 2.14). In the component body:

```tsx
const reduce = useReducedMotion();
```

Replace line 51:

```tsx
// Before
transition={{ delay: 0.2, type: "spring" as const, damping: 10 }}

// After
transition={
  reduce
    ? { duration: 0 }
    : { delay: 0.2, type: 'spring' as const, damping: 10 }
}
```

### - [ ] Step 3.5: Run the full validation gauntlet

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: all green.

### - [ ] Step 3.6: Commit

```bash
git add src/components/ui/pricing-tab.tsx \
        src/components/projects/ProjectSortToggle.tsx \
        src/components/projects/ProjectViewToggle.tsx \
        src/app/secret/secret-page-content.tsx
git commit -m "refactor(motion): gate 4 spring transitions on prefers-reduced-motion

Step 3 of the motion tokens refactor. Spring configs lack a
duration field and can't use useMotionPreset, so each callsite
gets a useReducedMotion() check that swaps in { duration: 0 }
when the user prefers reduced motion."
```

---

## Final Verification

### - [ ] Step F.1: One final clean-tree validation

```bash
git status
npm run lint && npm run typecheck && npm test && npm run build
```
Expected: clean working tree, all checks pass, all 8 `/projects/[slug]` pages prerendered.

### - [ ] Step F.2: Manual visual check (developer-only)

`npm run dev` and visit:

- `/` (homepage — testimonial-card hovers, FAQ if visible)
- `/projects` (ProjectGallery, ProjectViewToggle, ProjectSortToggle)
- `/projects/talker` (multiple animated sections, hero reveal, sidebar)
- `/work-with-me` (FAQ accordion, services section, pricing toggles)
- `/secret` (the spring entrance + delays)

Then enable OS-level "Reduce motion" and confirm:
- `/` and `/projects/talker` animations effectively don't run.
- Spring components (pricing-tab, ProjectSortToggle, ProjectViewToggle, secret) snap instantly instead of bouncing.

Claude cannot perform this step. The developer is the only signal here.

### - [ ] Step F.3: Push the three commits

```bash
git push origin main
```
