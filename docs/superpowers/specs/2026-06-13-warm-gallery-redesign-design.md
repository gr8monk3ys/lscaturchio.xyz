# Warm gallery redesign

Date: 2026-06-13
Status: approved (option "warm gallery — evolve")

## Intent

Treat the site like an exhibition. Keep the warm palette (ivory, forest green)
and Fraunces/Instrument Sans, but replace card-based density with gallery
language: hairline rules, generous negative space, monospace "wall-label"
metadata, and catalogue numbering. Refined and quiet — the Claude-site /
museum register, not hard brutalism.

## Decisions

- **Third typeface:** IBM Plex Mono (`--site-font-mono`), via next/font, used
  only for metadata — kickers, dates, tags, section numbers, the currently
  strip, nav. Body stays Instrument Sans; display stays Fraunces.
- **Kill the box.** Sections sit on the ivory divided by full-width hairline
  rules + whitespace, not `neu-card` borders. The `neu-card` utility stays
  (used in 45+ files) but specific gallery surfaces opt out via a new
  `gallery-section` / plain layout.

## Changes

### Type foundation (`globals.css`, `layout.tsx`)
- Add `--site-font-mono` (IBM Plex Mono) in layout, expose `--font-mono` in
  `@theme`, apply the variable on `<body className>`.
- New utility `.label-mono`: mono, uppercase, tracked-out, small, muted — the
  wall-label / kicker style.
- New utility `.rule` / use `border-border` hairlines for section dividers.

### Section + SectionHeader (`components/ui/Section.tsx`)
- `SectionHeader` becomes a label block: mono kicker (optional `index` +
  `eyebrow`) → Fraunces title → full-width hairline rule beneath.
- Increase default section padding (museum mat): `default` → larger; add a
  `gallery` padding option.

### Hero (`components/home/Hero.tsx`)
- Reduce first-viewport elements: mono label, name (huge, the artwork),
  one-line thesis, chat input. Suggestion chips + the buttons drop below with
  air; buttons become underlined text links. Portrait kept but quieter.

### Home sections
- Case studies, How-I-Work, Selected Writing, New-Here: drop card chrome where
  it reads as a box; divide with rules; lead items with mono index numbers.

### Blog card (`components/home/selected-writing.tsx` + blog index card)
- Tags render as mono text separated by middots, no pills.

## Non-goals

- No palette change, no Fraunges replacement, no hard-brutalist reset.
- Mobile menu and the essay reading typography are out of scope this pass
  (reading-experience polish is a separate future pass).

## Verification

- lint, typecheck, full test suite, production build green.
- Visual check: home + blog + a garden page, light and dark, desktop + mobile.
