# Motion Tokens & Reduced-Motion Compliance

**Status:** approved, ready for implementation plan
**Author:** Lorenzo (with Claude)
**Date:** 2026-05-07

## Problem

Two related issues across the framer-motion surface, identified in the
2026-05-07 site-quality review:

1. **Tokens that aren't used.** 29 inline `transition={{}}` props
   with hand-picked duration/ease values are scattered across 22+
   component files. The codebase uses 9 distinct duration values
   (0.18, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6) — drift, not
   intent. Existing CSS `--duration-fast/default/slow` tokens are
   scoped to hover/focus interactions (150–300ms range) and don't
   apply to the longer entrance/exit animations framer-motion does.

2. **Reduced-motion is sporadic.** Only 6 of 32 framer-motion
   components check `useReducedMotion()`. Users with vestibular
   conditions or `prefers-reduced-motion: reduce` set get the full
   animation experience regardless of OS preference.

## Goals

- Define a 3-bucket duration scale + 1 standard easing for
  framer-motion entrance/exit/layout animations.
- Add a single hook (`useMotionPreset`) that returns transition
  values AND respects `prefers-reduced-motion` automatically.
- Migrate ~22 inline-transition callsites to the hook.
- Add reduced-motion checks to 3 spring-based callsites that can't
  use the hook (springs have no `duration`).
- No visible regression beyond minor cadence consolidation: 0.6 → 0.5
  on 2 callsites, 0.45 → 0.5 on 1, 0.4 → 0.35 on 3. Differences are
  below human perception threshold for entrance animations.

## Non-goals

- Don't touch existing CSS `--duration-*` tokens. They serve hover
  and focus transitions; working as intended.
- Don't add a `MotionConfig` provider override (more invasive,
  deferred).
- Don't add a lint rule forbidding raw decimals in `transition={}`
  props (deferred — easy follow-up).
- Don't refactor the `Reveal`, `home-atmosphere`, or
  `selected-writing-media` components — each handles its own
  reduced-motion correctly via CSS or an explicit check.
- Don't change spring physics for spring-based callsites; only add a
  reduced-motion gate.

## Architecture

Add three exports to `src/lib/motion.ts` (currently a barrel file):

```ts
import { useReducedMotion } from 'framer-motion';

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

## Migration mapping

Each of the ~22 plain-transition callsites is converted from:

```tsx
<m.div transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} ... />
```

to:

```tsx
<m.div transition={useMotionPreset('slow')} ... />
```

Bucket assignment:

| Existing duration  | Maps to     |
|--------------------|-------------|
| 0.18–0.25          | `'fast'`    |
| 0.3–0.4            | `'default'` |
| 0.45–0.6           | `'slow'`    |

Existing eases:

| Existing ease                            | Maps to      |
|------------------------------------------|--------------|
| `[0.22, 1, 0.36, 1]` (3×)                | `'standard'` |
| `'easeOut'` / `"easeOut"` (2×)           | `'standard'` |
| `'easeInOut'` (1×)                       | `'standard'` |
| `[0.6, -0.05, 0.05, 0.99]` (Paragraph.tsx) | Verify intent: if decorative drift, migrate to `'standard'`; if deliberate, keep inline as a documented exception. |

Callsites that have additional transition keys (`delay`, `staggerChildren`,
etc.) keep those keys via spread:

```tsx
<m.div transition={{ ...useMotionPreset('default'), delay: 0.2 }} ... />
```

## Spring-based callsites

Three components use `type: "spring"` and cannot use `useMotionPreset`
(springs have no `duration` field):

- `src/components/ui/pricing-tab.tsx:35`
- `src/components/projects/ProjectSortToggle.tsx:55`
- `src/components/projects/ProjectViewToggle.tsx:62`

For each, add a `useReducedMotion()` check and swap the spring config
for an instant transition when reduced:

```tsx
const reduce = useReducedMotion();
// ...
<m.div
  transition={
    reduce
      ? { duration: 0 }
      : { type: 'spring', bounce: 0.2, duration: 0.4 }
  }
  ...
/>
```

## Files affected

| File | Change |
|------|--------|
| `src/lib/motion.ts` | Add `DURATIONS`, `EASINGS`, `useMotionPreset` exports. ~25 lines added. |
| ~22 component files (list in plan) | Replace inline `transition={{}}` with `transition={useMotionPreset(...)}`, optionally spread for `delay`/`stagger` |
| 3 spring-based components | Add `useReducedMotion()` import + check + transition swap |

Total: 1 new module surface + ~25 file edits.

## Testing strategy

- **typecheck** is the primary contract gate. The hook's return type
  must satisfy framer-motion's `Transition` shape, which it does
  (`{ duration: number; ease: readonly number[] }` is a valid
  `Transition`).
- **build** — `npm run build` to catch SSG breakage on prerendered
  routes that include animated components.
- **tests** — existing 408 tests should pass unchanged. No
  framer-motion code paths are unit-tested.
- **manual visual check** — developer-only. Verify two surfaces:
  - `/projects/talker` (hero, sections, sidebar — multiple
    reveal animations on a single page).
  - `/work-with-me` (FAQ accordion, services section).
  
  Optional: enable OS-level `prefers-reduced-motion` and confirm
  that animations on those pages effectively don't run.
- **Hook unit test** — add a small vitest covering `useMotionPreset`:
  returns expected duration when reduced-motion is off; returns
  `duration: 0` when on. Mock `useReducedMotion` from
  framer-motion. ~20 lines.

## Risks

1. **Spring + reduced-motion oversight.** If a spring callsite's
   reduced-motion branch isn't the simple `{ duration: 0 }` pattern,
   animation can leak through. Mitigation: explicit pattern in spec;
   spec reviewer must spot-check all 3 spring sites.
2. **Visual drift on consolidation.** 0.6 → 0.5 / 0.45 → 0.5 / 0.4 →
   0.35 changes are below perception threshold for entrance
   animations, but the reviewer should confirm slow-motion callsites
   still feel deliberate after migration.
3. **`Paragraph.tsx` bespoke ease.** Cannot tell from code alone
   whether `[0.6, -0.05, 0.05, 0.99]` is intentional or drift. If
   migrated to `'standard'` and the rendering changes meaningfully,
   revert that single callsite. Otherwise drop it for consistency.
4. **Two `'easeOut'` string callsites.** Mapping to the standard
   cubic loses the slight "ease-out" character. If reviewer feels
   the mapped form is wrong, add a second easing entry rather than
   inflating the bucket count.

## Out of scope (separate work)

- A lint rule (eslint custom or knip-style) that forbids raw decimal
  durations in `transition={{}}` props. Easy follow-up once the
  initial migration lands.
- A `MotionConfig` framer-motion provider that makes the hook
  defaults the implicit defaults for any unannotated component.
  More invasive; defer.
- The earlier audit's broader recommendations (drop `/professional`,
  trim sitemap, fix `theme-color`) are tracked separately.
