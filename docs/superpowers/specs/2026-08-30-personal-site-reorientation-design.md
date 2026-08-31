# Reorienting lscaturchio.xyz into a personal site

**Date:** 2026-08-30
**Status:** approved in chat, pending spec review

## Goal

The site should convey who Lorenzo is as a person. Projects stay as evidence,
but stop leading. It is not a sales pitch.

## The finding that drives this

The taxonomy was built for the portfolio identity, not for what actually gets
written. Tag counts across all 83 essays:

```
politics 25 · philosophy 24 · economics 24 · technology 18
culture 10 · psychology 9 · institutions 9 · policy 8 · environment 7
```

The eight `TOPIC_HUBS` are `rag-llms`, `ai-society`, `systems-craft`,
`work-economy`, `places-infrastructure`, `open-source-tools`… — an engineer's
filing cabinet holding an essayist's body of work. Correcting that *is* the
reorientation; everything else follows from it.

## Decisions

| Question | Decision |
|---|---|
| What leads the homepage | The writing |
| Identity line | "builds systems, suspicious of them" |
| Hire-me CTA | Demoted from green pill to a plain nav link |
| Blog structure | Restructured by theme, date secondary |
| Colophon | Update the stale post **and** add a `/colophon` page |
| "Changed my mind" page | Out of scope this round |

## A. Identity

`src/constants/identity.ts` is the single source for title, OG cards, schema
and tagline, so this is one edit that propagates.

- `role`: `AI Engineer & Essayist` → `builds systems, suspicious of them`
- `titleDefault`: → `Lorenzo Scaturchio — builds systems, suspicious of them`
- `tagline`: rewritten to match, leading with the writing
- Hero (`src/components/home/Hero.tsx`) rewritten warmer:
  > I build AI systems and I'm suspicious of them. I write about power,
  > attention, and what institutions are actually built to do.

**Correction:** remove the bagpipes claim — it is not true. Two places:
`src/components/about/PersonalFavorites.tsx` (the "Weird skill" entry) and the
`/about` metadata description. Replace the favorites entry with another real
one or drop the row.

## B. Homepage recomposition

`src/app/page.tsx`:

```
BEFORE                          AFTER
Hero                            Hero (warmer)
CurrentlyStrip                  CurrentlyStrip (expanded)
ScrollCaseStudies               WhatIThink       (themed essays)  [new]
HowIWorkSection                 ScrollCaseStudies (demoted, 3 items)
SelectedWriting                 WhoIAm            [new]
NewHereSection                  NewHereSection
```

- `HowIWorkSection` moves off the homepage to `/work-with-me`. Good content,
  wrong room — a process section on a personal homepage is consultancy
  furniture.
- `SelectedWriting` is superseded by `WhatIThink` (themed) and is removed from
  the homepage to avoid two writing sections.
- `WhoIAm` is a new section drawing on the existing About favorites data.

## C. Navigation

`src/constants/navlinks.tsx`:

- `Work With Me` (green pill) → `Hire me`, plain link, same weight as others.
- **Proposed, needs confirmation:** add `Garden` as a top-level item. Books,
  movies, photos, now, lab and links are the most personal surfaces on the
  site and are currently reachable only from the footer. On a personal site
  the garden should not be in the basement.

## D. Blog restructured by theme

Replace the eight engineering-shaped hubs with five themes derived from the
real tag distribution:

| Theme | Tags | Approx. posts |
|---|---|---|
| Power & institutions | politics, institutions, policy, united-states, immigration | ~35 |
| Philosophy & the self | philosophy, psychology, religion, taoism | ~30 |
| Money & work | economics, labor, work, productivity | ~28 |
| Technology & attention | technology, attention, design | ~22 |
| Place & climate | environment, urban, community, climate | ~12 |

- `src/constants/topics.ts` rewritten to these five.
- `/blog` index gets theme as the primary axis, date secondary.
- Existing stage filters (Seedling / Budding / Evergreen) stay.
- Posts map to a theme by tag; a post matching none falls back to an
  "Everything else" group rather than disappearing. Overlaps resolve to the
  theme matching the post's *first* listed tag, so each post appears once.

## E2. Music

Lorenzo produces indie/folk with industrial textures. It is one line on the
About page with no evidence anywhere.

New route: `/music`, listed under Garden. Build the surface; it stays empty
until he supplies material, exactly like `/photos`. Empty state in the same voice as the photography page ("an empty
gallery beats a borrowed one"). No fabricated track list.

## E3. Colophon

The blog post `how-i-built-this-site` (dated 2025-01-19) claims **Next.js 14**;
the repo runs **Next.js 16 / React 19**.

1. Correct the drifted technical facts in the post. Voice and argument
   untouched — only claims that are now false.
   - Constraint: read `docs/writing-style.md` first, and re-run
     `bun run sync-retrieval-corpus` or CI's drift check fails.
2. Add a `/colophon` page: a short living summary of how the site is built and
   why, linking to the post for the long version. A dated essay ages; a
   colophon does not.

## Out of scope

- "Changed my mind" page (E1) — deferred.
- The dead vector-search bug (see PR #187) — separate concern.
- `/photos` — Lorenzo is adding his own images.

## Testing

- `bun run typecheck`, `bun run lint`, `bunx knip`, `bun run test`,
  `bun run build` all green.
- New theme-mapping logic gets unit tests: every post lands in exactly one
  theme; a post with no matching tag lands in the fallback group.
- Render `/`, `/blog`, `/colophon`, `/music`, `/about` against the production
  build in both colour schemes; no HTTP >= 400 and no horizontal overflow at
  390px and 768px.
- Confirm no remaining reference to bagpipes or to "AI Engineer & Essayist".
