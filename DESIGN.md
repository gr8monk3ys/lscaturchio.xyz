---
name: lscaturchio.xyz
description: A museum catalogue set as full-bleed ruled plates on warm-grey paper, in forest ink, handwriting, an old-style serif and monospace labels.
colors:
  forest-ink: "#184e35"
  forest-ink-dark: "#42a979"
  moss: "#397f5e"
  paper: "#e5e2d7"
  paper-card: "#ebe9e0"
  paper-tinted: "#d8d5ca"
  paper-warm: "#f5ebe0"
  ink: "#1a1f23"
  ink-muted: "#49505a"
  hairline: "#c7c1b3"
  night: "#111317"
  night-card: "#16181d"
  night-tinted: "#25272d"
  night-ink: "#fafafa"
  night-ink-muted: "#abb0ba"
  night-hairline: "#292c32"
  signal-error: "#a61b1b"
  signal-success: "#16a249"
  signal-warning: "#f59f0a"
  signal-info: "#3c83f6"
typography:
  display:
    fontFamily: "Lorenzo Hand, Fraunces, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.2vw, 4.9rem)"
    fontWeight: 720
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Lorenzo Hand, Fraunces, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.6vw, 3.2rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Lorenzo Hand, Fraunces, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.55rem, 2.4vw, 2.25rem)"
    fontWeight: 650
    lineHeight: 1.18
    letterSpacing: "-0.026em"
  card-title:
    fontFamily: "Lorenzo Hand, Fraunces, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 620
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Instrument Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.16em"
rounded:
  none: "0px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  card: "12px"
  xl: "14px"
  2xl: "18px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"
  24: "96px"
components:
  button-primary:
    backgroundColor: "{colors.forest-ink}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "40px"
  button-primary-disabled:
    backgroundColor: "{colors.paper-tinted}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "40px"
  button-default:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "40px"
  button-default-hover:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.forest-ink}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
    height: "40px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.forest-ink}"
    padding: "0"
  badge-outline:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  badge-filled:
    backgroundColor: "{colors.forest-ink}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  card:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  card-hover:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  input-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 112px 0 0"
    height: "56px"
  input-field:
    backgroundColor: "{colors.paper-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  wall-label:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "0"
---

# Design System: lscaturchio.xyz

## Overview

**Creative North Star: "The Museum Catalogue"** (the field notebook, set as full-bleed ruled plates)

The site is a working notebook kept on warm paper. Everything in it is a record: an essay, a film watched on a date, a book with a rating, a job with a sourced number. The page itself is the paper, a pale warm grey with a near-invisible grain; titles are in my own handwriting and statements in an old-style serif; the accent is a single green ink used the way one pen is used, for the marks that matter. Beside every entry sits a small monospace label, the way a specimen is catalogued: kicker, date, count, place. Structure comes from hairline rules and from tinted patches of the same paper, never from boxes floating above it. On the surfaces set as plates (the header, the footer and the home page, as of phase 1) content runs the full width of the viewport and is divided into cells by 1px rules in the ink colour that run edge to edge, like an engraved plate; see Plates at the end of this document.

The mood is quiet and unhurried. Nothing competes for attention; whitespace and rules do the organising, and the reader is trusted to move through it at their own pace. It is warm and papery: the ground, the grain, and the sand-toned borders all read as paper rather than screen. It is precise and catalogued: tabular numerals, uppercase mono labels, and dates give the site the feel of a place that keeps records honestly. And it is literary: the handwriting carries the personality and EB Garamond the statements, so the type is the only decoration the system needs.

The system deliberately is not three things. It is not neumorphic: the soft double-shadow blooms that once covered the site were its single biggest "AI template" signal and were removed in favour of ink-on-paper. It is not SaaS landing-page chrome: no gradient blobs, no glassy card grids, no badge-pill features in three columns. And it is not the dark-mode-first developer aesthetic: mono is a label beside the work, never the voice of the work, and dark mode is a night-reading variant of the same notebook, not a terminal.

**Key Characteristics:**
- One paper ground, a pale warm grey (#e5e2d7) with a fixed 3.5% noise grain; dark mode is a night variant of the same page.
- One ink accent, Forest Ink, spent sparingly: links, text selection, the single primary CTA.
- Hairline rules and tint shifts structure the page; there are no floating cards and no decorative shadows.
- Three type voices on the plates: my own handwriting (Lorenzo Hand) speaks, EB Garamond states and reads, IBM Plex Mono catalogues. Instrument Sans is still the body and control face everywhere else.
- The hand writes; everything else settles. Headings in my handwriting are inked in from the left; beyond that, motion is 150–300ms on hover and focus and one 300ms drawer. Nothing waits on a script to become readable, and all of it is off under reduced motion.

## Colors

A warm-grey, low-chroma paper palette with one deep green ink, a sand-toned hairline and an ink rule between plates; dark mode inverts to a cool night page with the same green lifted for contrast.

### Primary
- **Forest Ink** (#184e35 light / #42a979 dark; `--primary`): the one pen. Links, the hover colour of any interactive text, the 22% tint behind selected text, the fill of the single primary button, the underline that grows beneath a hovered nav item, and the border that warms on a hovered surface. The dark value is lighter so the ink stays legible on night paper.
- **Moss** (#397f5e; `--secondary`): a lighter green for secondary fills and status tints. Rarely seen; it exists so a second green never has to be invented.

### Neutral
- **Paper** (#e5e2d7; `--background`): the page. A pale warm grey, hue 47 at 87% lightness, with the noise grain laid over it. It was #f9f8f5 until the museum redesign.
- **Paper Card** (#ebe9e0; `--card`): a surface one shade lighter than the page, used for buttons, list rows and cards so they sit on the paper rather than above it.
- **Paper Tinted** (#d8d5ca; `--muted`): the "recessed" tone. Used at 55% opacity for pressed or secondary surfaces, and full-strength for disabled controls.
- **Paper Warm** (#f5ebe0; `--accent`): a sand highlight for hover fills and the rare emphasised block.
- **Ink** (#1a1f23; `--foreground`): body text. A cool near-black with a blue cast that keeps the warm paper from going yellow.
- **Ink Muted** (#49505a; `--muted-foreground`): captions, wall labels, descriptions, placeholders. Everything that is metadata rather than the work. Darkened from #606976 with the paper: the old value measured 4.26:1 on #e5e2d7, this one 6.24:1 (5.54:1 on Paper Tinted).
- **Hairline** (#c7c1b3; `--border`): the soft rule of every surface not yet set as a plate. A sand tone, never grey, drawn at 1px and often at 40–90% opacity. **Ink Rule** (`--rule`, Tailwind `border-rule` / `bg-rule` / `divide-rule`): the 1px line between plates and cells. It is Ink (#1a1f23) by day and #6a7181 at night, 3.8:1 on the night page. It is a separate token so restyling a surface as plates never changes a border anywhere else.
- **Night** (#111317), **Night Card** (#16181d), **Night Tinted** (#25272d), **Night Ink** (#fafafa), **Night Ink Muted** (#abb0ba), **Night Hairline** (#292c32): the dark-mode counterparts, hue 220, cool rather than warm.

### Signal
- **Error** (#a61b1b light / #e87c7c dark), **Success** (#16a249), **Warning** (#f59f0a), **Info** (#3c83f6): status colours for form errors, toasts and badges only. Each has a 10–15% tinted background variant. They never appear as decoration.
- Error was #ef4444 in both this document and the stylesheet, which measures **3.58:1 on Paper** — under the 4.5:1 body floor, and this palette renders error text as body copy. Its dark value was shadcn's untouched #7f1d1d at **1.86:1 on night paper**, the only token in the set that got *darker* at night. Both are corrected; the rule they broke is the one below.

### Named Rules
**The One Pen Rule.** Forest Ink is the only chromatic accent on any surface, and it marks action or emphasis, never area. If a screen has green in more than a few places, it has too many.

**The Sand Hairline Rule.** Dividers are 1px of Hairline, sand-toned, never neutral grey and never thicker; on a plate they are 1px of Ink Rule instead, and never both on one surface. Depth of structure is expressed by more rules and more space, not by darker lines.

**The Tinted Paper Rule.** A "contained" surface is the same paper at a different tint (Paper Card lighter, Paper Tinted darker), bordered by a hairline. It is never a white box on a grey page.

## Typography

**Display Font:** Lorenzo Hand, my own print handwriting, Bold cut only, self-hosted via next/font/local with `preload: false` and `size-adjust: 125%` (its x-height is 0.39em against Fraunces' 0.44em). Fraunces stays behind it in the stack for any glyph the hand lacks (accented letters).
**Body Font:** Instrument Sans (with ui-sans-serif, system-ui fallback).
**Label/Mono Font:** IBM Plex Mono, weights 400/500/600 (with ui-monospace, Menlo fallback). **Serif Font:** EB Garamond via next/font/google (`--site-font-serif`, Tailwind `font-serif`, `preload: false`), used through `text-statement` (clamp 1.7–3.25rem, 1.12) and `text-lede` (1.2rem, 1.45) on the plates only; body text site-wide is unchanged.

**Character:** A high-contrast, slightly wonky serif doing the talking, a plain humanist sans doing the reading, and a monospace doing the filing. Fraunces at heavy weights and tight tracking gives headings a printed, editorial presence; Instrument Sans at 1.65 line-height stays out of the way; Plex Mono, small, uppercase and widely tracked, is the wall label beside the work.

### Hierarchy
- **Display** (Lorenzo Hand, clamp 2.4–4.9rem, 1.1, -0.035em, oldstyle numerals): reserved. The home masthead now sets its greeting at the Headline step with the name in Forest Ink, and gives display scale to the statement beneath it in EB Garamond (`text-statement`).
- **Headline** (Lorenzo Hand, clamp 1.9–3.2rem, 1.12, -0.03em): one per page, the page title.
- **Title** (Lorenzo Hand, clamp 1.55–2.25rem, 1.18, -0.026em): section headings. Framer-motion section headings use the 3xl/4xl steps at weight 700.
- **Card Title** (Lorenzo Hand, 1.25rem, 1.2, -0.02em): headings inside a list row or card. A subsection step exists at 1.075rem / 560.
- **Body** (Instrument Sans 400, 1rem, 1.65): reading text. Essays use the typography plugin's `prose-lg` at full width of the reading column. There is no drop cap: the rule that specified one never matched the rendered DOM, and 81 of the 83 essays open on a section heading rather than a paragraph, so there is no opening letter to set.
- **Description** (Instrument Sans 400, 0.875–1rem, Ink Muted): secondary copy under a title.
- **Label** (IBM Plex Mono 500, 0.72rem, 0.16em tracking, uppercase, tabular numerals, Ink Muted): the wall label. Kickers ("Essays · Systems · Los Angeles"), dates, counts, captions, footer links, suggested-question chips. The same class with normal case and tracking is the small mono link style.

### Named Rules
**The Wall Label Rule.** Every piece of metadata (a date, a count, a place, a category) is set as a Label: mono, small, uppercase, tracked, muted. Metadata never borrows the body or heading voice.

**The Hand Speaks Rule.** The handwriting appears wherever the site is speaking: every heading and the masthead. It is the brand's signature, so it is not rationed. Never in body copy, UI controls or labels.

**The Fluid Heading Rule.** Headings scale with `clamp()`, not breakpoints; weights step down the hierarchy (720 → 700 → 650 → 620 → 560) and tracking loosens as size falls.

## Layout

Outside the plates, the page is a single centred column on open paper, with three widths: narrow (42rem) for reading, medium (56rem) for mixed content, wide (72rem) for the masthead, galleries and index pages.

An index page's *header* is wide; its **row list caps at 42rem** (the `2xl` tier). This is the resolution of a collision this document created: the width above and the Measure Rule were both applied literally to `/blog`, and a review measured the result at 1152px of hairline divider under 606px of text — 546px of rule past the content it divides, on every one of 84 rows, on the most-seen composition on the site. Moving the date and stage to the right edge would have used the width, but that contradicts the row pattern below, which puts the label above the title and the description under it. 42rem is a sanctioned tier — `width-scale` in the drift suite rejects a fourth named one, and rejected a first attempt at 48rem — and it is the reading width, which is the right measure for a list whose purpose is choosing what to read. Galleries with a preview rail keep the full 72rem, because they have something at the right edge to justify it. Horizontal padding is 16px, rising to 24px and 32px at the sm and lg breakpoints.

Vertical rhythm is generous. Sections breathe at 64px, then 80px at sm and 96px at lg; small sections at 32/48/64px. Cards and list rows pad at 24px (32px at sm) or 16px (24px at sm). Between sections sits a full-width hairline, the gallery rule, rather than a background change.

Two-column compositions are asymmetric editorial splits, never equal halves: the home plates are `2fr / 1fr` (masthead and portrait, cover and label) or `1fr / 2fr` (placard and entries), the ledger on other pages is `280–360px / 1fr` with a sticky left rail, and the footer is one ruled row of `1.5fr` plus four `1fr` columns. Lists are stacked rows separated by hairlines with the label above the title and the description below, not tiled cards.

The desktop navigation is fixed, 80px tall and full-bleed, on opaque paper with an Ink Rule beneath and no shadow or blur; the page reserves the same 80px above its content. Below the md breakpoint the desktop bar is hidden and a mobile navbar takes over. Breakpoints are Tailwind's defaults (sm 640, md 768, lg 1024, xl 1280).

Right-to-left scripts and long translated strings are a product commitment: keep labels and rows flex-wrapped, avoid fixed widths on text, and let the asymmetric grids collapse to one column below md.

## Elevation & Depth

Flat paper, tint shifts only. Every surface sits on one plane. Hierarchy is drawn with hairlines and with the three paper tints (Card lighter, Tinted darker, Warm for emphasis), and a hover is a colour change (border warming to Forest Ink at 45%, background tinting to Forest Ink at 5–6%), not a lift. The noise grain over the whole page is what stops large flat areas from reading as sterile screen white.

One exception exists and is structural, not decorative (the fixed navigation bar carried a wide, soft shadow until it became a flat signage row closed by an Ink Rule): the primary CTA carries a 1px ledge (`0 1px 0` of Forest Ink at 25%) beneath its border so the one filled button feels pressed onto the page.

The old neumorphic shadow tokens (`--neu-shadow-*`) are **gone** from the stylesheet, and every `neu-*` utility is now flat: background, hairline, tint. `neu-card` no longer lifts on hover either — it warms its border and tints the paper, like everything else. What survives is only the naming: 26 files still reference `neu-*` class names that no longer mean anything neumorphic. Treat the names as debt to be renamed, not as vocabulary to extend.

No unsanctioned shadow remains. The navigation's control pill lost its inset hairline, the command palette lost `shadow-2xl`, `/topics/<slug>` lost a `hover:shadow-md`, and the `/blog` stat tiles left with the component that carried them. A browser enumeration of every non-`none` `box-shadow` returned exactly the two objects this rule then permitted, plus one all-transparent Tailwind ring stack on the chat textarea that paints nothing. With the navigation flat, one *visible* shadow is the assertion.

One animated layout property is sanctioned, and only one: `.site-shell`'s
`padding-inline-end`, which is how the ask drawer pushes the page open above
2xl. There is no transform that reproduces "the shell narrows and the content
reflows", so the cost is taken deliberately. The detector flags it; that is
correct, and this paragraph is the answer.

### Named Rules
**The Flat Paper Rule.** No shadow on any content surface, at rest or on hover. A hovered surface changes tint and border colour; it does not rise.

**The Two Sheets Rule.** The only elevated object is the primary CTA's 1px ledge (the fixed navigation was the second sheet and is now flat). Nothing else may add a shadow without changing this file first.

**The Measure Rule.** Running text caps at 65–75 characters per line, **measured, not assumed**. The rule is written down because a review measured the `/blog` section descriptions and the `/lab` lede at ~96 characters. Wall labels, metadata rows and single-line captions are not running text and are exempt.

Two things this rule previously got wrong about itself, both found by measuring per-character `Range` rects rather than trusting the unit. It claimed the essay body "already runs at ~72": it ran at **78** (p50 over 81 full lines at 18px, p90 84, max 88) on `max-w-2xl`. And it prescribed `ch` over pixels, on the reasoning that `max-w-prose` (65ch) "holds the measure when the scale moves" — but `ch` is the advance width of the `0` glyph, which in a proportional face is wider than the average character. Switching the essay to `max-w-prose` made it **worse**: 693px and 81 characters. The essay column is `max-w-xl` (576px). Measured with per-character `Range` rects on the same column: **p50 66 / p90 71 / max 76** on one essay and **p50 69 / p90 73 / max 76** on another, because line length varies with the prose, not with the column. Both are inside the band; quote a range, not a single number, and re-measure on more than one essay. Check a measure with the DOM; do not infer it from the unit.

**The Scrim Rule.** A modal separates with a scrim, not a shadow. `.overlay-scrim` — `hsl(var(--scrim) / var(--scrim-alpha))`, covering the viewport, with an optional small blur — is the third sanctioned separation mechanism alongside the two sheets, and the only one available to an overlay, since the Two Sheets Rule has already spent both of its shadows.

The token matters, and this rule got it wrong once. It specified `--foreground` at 25%, which is correct on paper and inverted at night: `--foreground` is 12% lightness in light mode and 98% in dark, so the same declaration laid a *white* veil over the dark page and washed it to mid-grey until `--popover` (10% lightness) was darker than its own backdrop — the same failure as the `bg-background/80` it replaced, token-flipped. `--scrim` is ink (`0 0% 4%`) in both themes, and `--scrim-alpha` carries the difference: 25% on paper, 55% at night, because the gap between a 4% scrim and a 10% panel is small and needs more opacity to read as separation. A scrim is defined by being darker than the page, so it cannot be built from a token that follows the text colour.

This exists because the previous two rules, read together, left a hole. The command palette correctly carried no shadow and was therefore a bordered paper rectangle on a bordered paper page, backed by `bg-background/80`: the page's own colour laid over the page, which lightens rather than separates. A design review found the masthead reading through around it and concluded, reasonably, that it did not look like a modal. The drawer had already solved the same problem with `.ask-scrim` at ink-25% without anyone writing the rule down, so the pattern existed in the code and not in the document — which is how two overlays in one system ended up with two different answers.

A scrim is not elevation: nothing rises, nothing casts. Flat paper holds.

## Shapes

The form language is soft-cornered paper with one square exception. Buttons and controls use 14px corners (the xl step); small buttons 10px; the shadcn-style Card wrapper 18px; the raw `neu-card` utility 12px. Chips, badges, the ask button and the navigation's control pill are fully round. Radius never goes below 6px on a control, and never above 18px on a container.

Two elements are deliberately square: the portrait plate in the masthead (a hairline-bordered square photograph with a mono caption below, like a placard) and the underline input, which has no radius and no box, only a bottom rule. Squareness marks the work; roundness marks the interface.

Borders are always 1px Hairline, frequently at reduced opacity (40% under the nav, 60% above the footer, 70–90% on tinted surfaces). Glass utilities (`glass`, `glass-subtle`, `glass-heavy`: 40–75% paper with 8–20px blur) exist for overlays and are not for content surfaces.

This paragraph used to name the command palette as the example, and the palette does not use them: it is opaque `bg-popover` inside a 1px hairline, and it is better that way — glass over body copy at the palette's size smears the text behind it into noise. The implementation was right and the document was wrong, so the document follows it. What the palette needs to read as a layer is the scrim (see the Scrim Rule), not translucency. Glass remains available for chrome that sits over *itself*; the fixed navigation bar was the real instance and no longer uses it.

## Components

The controls are refined and restrained: hairline borders, tint on hover, a fill only on the one primary action, and inputs that are an underline drawn on the page.

### Buttons
- **Shape:** softly rounded (14px), 40px tall, 16px horizontal padding; small 36px / 10px radius; large 48px / 32px padding. Text is Instrument Sans 500 at 0.875rem.
- **Primary** (`cta-primary`): Forest Ink fill, white text, a 1px border of Forest Ink at 42%, and the 1px ledge shadow. One per view. On the masthead it is a square "Ask →" block inside the underline input.
- **Default** (`neu-button`): Paper Card fill, hairline border, Ink text.
- **Outline**: same as default without the press; **Ghost**: transparent until hovered, then Paper Card with a hairline; **Link**: Forest Ink text, underline on hover; **Destructive**: default shape with Error text.
- **Hover / Focus:** hover tints the fill to Forest Ink at 6% and warms the border to 45% and the text to Forest Ink; primary brightens 5%. Active presses 1px down. Focus is a 2px Forest Ink outline offset 2px. Transitions 150ms.
- **Disabled:** Paper Tinted fill, Ink Muted text, hairline border, no ledge, 50% opacity.

### Chips / Badges
- **Style:** fully round, 12px horizontal / 4px vertical padding, 0.75rem semibold.
- **Outline / Secondary:** Paper Card fill with a hairline, Ink text, hover text to Forest Ink. This is the house chip.
- **Filled:** Forest Ink fill, white text. Reserve for a single status or count; it still carries the legacy double shadow and should not be multiplied.
- **Suggested questions and tag lists** are not chips at all: they are wall-label links (mono, normal case, underline on hover) separated by gap, not pills.

### Cards / Containers
- **Corner Style:** 18px on the Card component, 12px on bare `neu-card`.
- **Background:** Paper Card on Paper. Pressed or secondary containers use Paper Tinted at 55% with a 70% hairline.
- **Shadow Strategy:** none (see Elevation). Hover warms the border to Forest Ink at 45%.
- **Border:** 1px Hairline.
- **Internal Padding:** 24px, 32px at sm.
- **Preferred alternative:** most "cards" on the site are not cards. Index pages use stacked rows divided by hairlines: a mono label, a semibold title that turns Forest Ink on hover, a two-line clamped description in Ink Muted.

### Inputs / Fields
- **Underline** (the masthead ask field): 56px tall, transparent, no radius, a 1px Ink Rule beneath, 1.125rem text, placeholder Ink Muted at 70%. Focus turns the rule Forest Ink with no ring. The submit button sits inside at the right.
- **Field** (`neu-input`): Paper Card fill, hairline border, 8px radius, 40px tall. Focus: border Forest Ink at 50% plus a 2px Forest Ink outline offset 2px.
- **Error / Disabled:** errors use Error text below the field; disabled controls take the Paper Tinted / Ink Muted treatment.

### Navigation
- **Desktop:** fixed 80px full-bleed bar, opaque Paper, an Ink Rule beneath, no shadow, no blur and no pill. Logo at left (inverted in dark mode), links across, then the ask trigger, search and theme toggle. Hovered links grow a 2px Forest Ink underline from the left over 200ms; the active link keeps it. Links are wall labels (mono, uppercase, tracked): on a signage row a destination is a label.
- **Mobile:** below md the bar is replaced by a mobile navbar: the same opaque paper and Ink Rule, 64px tall.
- **Footer:** full-bleed, an Ink Rule above, one ruled row of five cells (the colophon, then a cell per site-map column; two-up on a phone with the colophon across), column headings in wall-label mono, links in body sans with the ink underline, turning Forest Ink on hover, and an Ink Rule before the legal line. (This document had the two voices the other way round for a while. The implementation is the correct one: the column name is metadata, and the Wall Label Rule says metadata is mono, while the links are the thing you actually read.)

### Wall Label (signature)
The `label-mono` utility: IBM Plex Mono 500, 0.72rem, 0.16em tracking, uppercase, tabular numerals, Ink Muted. It is the placard beside every piece of work: the masthead kicker and portrait caption, the "Ask the site anything" heading, section counts, dates on rows, footer links. With `normal-case tracking-normal` it becomes the small mono link. Any new section should introduce itself with one.

### Masthead (signature)
A wide cell and a tall one. The wide cell holds the wall-label kicker, the handwritten greeting at the Headline step with the name in Forest Ink, the statement in EB Garamond at display scale, the VivanceData line as a serif lede and, below an Ink Rule, the underline ask field with a square primary "Ask" inside it and three mono suggested questions. The tall cell is the portrait in full colour, as tall as the cell beside it, with its mono caption in a ruled strip beneath. It is the catalogue's title page.

### Essay Body (signature)
`prose prose-lg` at the reading width, handwritten headings with 6rem scroll margin, hairline rules between sections.

### Motion
**The hand writes; everything else settles.** Headings are set in my own handwriting, so they are written rather than faded: ink wiped in from the left edge with `clip-path`, on the site's standard ease. This is the one authored movement on the site and the one thing that animates itself in.

- **The home masthead** is the focal moment: "Hey, I'm" writes in over 450ms, then the name over 850ms, each on its own line (`.ink-line`).
- **A page's one h1** writes in over 700ms each time the page opens, and the hairline that closes its placard is ruled from the left after it.
- **Section headings** (`text-section-title`, and an essay's h2s) are written as they are scrolled to, with `animation-timeline: view()` over the heading's own entry. The progress is the scroll position: a heading wholly inside the viewport is wholly written. Card titles are excluded, because a card that clips its overflow is a scroll container and would time its title against itself.
- **Hairline rules** below the fold are ruled across the first eighth of the viewport the same way.

**Nothing waits on a script to become readable.** This rule is older than the write-on and the write-on is built to keep it. Nothing on a page mounts hidden and waits for a scroll observer, a mount transition or an idle callback — the failure mode is a blank page, and it has happened here twice under `LazyMotion strict`. Every rule above is CSS only and starts from the finished page: the timed ones use `backwards` fill, never `both`, and the scroll-driven ones sit behind `@supports (animation-timeline: view())`, so where an animation does not run the heading is simply there. Six components still carry framer-motion entrance variants; all six pass `initial={false}`, which is the doctrine written as a prop. The portrait, the mobile LCP element, is never animated.

Everything else that moves is the interface responding to the reader:

- **Hover and focus** transition at 150ms (fast), 200ms (default) or 300ms (slow) with `ease`, from `--duration-fast` / `-default` / `-slow`.
- **The ask drawer** — the one composed movement on the site — pushes the shell and the header at 300ms on `cubic-bezier(0.22, 1, 0.36, 1)`. That curve is the site's standard ease; anything larger than a hover uses it.
- **Scroll-linked progress** (the work timeline's rail) is driven by scroll position rather than by a timer, so it has no duration to specify.

Every transition collapses under `prefers-reduced-motion`, with one stated exception.

This was an unqualified claim and it was false. There was no global rule — only a block slowing `animate-pulse`/`animate-spin` and two component-specific `transition: none` declarations — so every `transition` and `transition-all` in the codebase kept running. Measured: the skip link, the first focusable control on every route, travelled 114px over ~180ms with a trajectory byte-identical under `reduce` and `no-preference`, and nineteen elements on `/` retained transform-capable transitions. `globals.css` now collapses `transition-duration` and `animation-duration` to `0.01ms` for `*, *::before, *::after` under `reduce` (0.01ms rather than 0s, because a zero duration can skip `transitionend` and hang code waiting on it). Verified after: zero elements retain a transition under `reduce`.

The exception is `animate-pulse` and `animate-spin`, which stay at 3s. They mean "something is loading", and freezing them leaves a shape that reads as broken rather than as waiting. It is stated here rather than left as a silent contradiction of the sentence above it.

**Scroll carries momentum.** The document scrolls through Lenis at 1.05s with an
exponential ease-out, which is the one place the site animates continuously
rather than in response to a discrete event. Three constraints define the
implementation and are not negotiable:

- **It drives the real scroll position, never a transformed wrapper.** Nine
  `sticky` elements do load-bearing work here — the essay contents rail, the
  ledger rails, the project gallery's detail pane, the work timeline's date
  column — and a wrapper transform breaks `position: sticky` outright. It would
  also break the reading-progress bar, the timeline's `useScroll`, and the
  rail's `IntersectionObserver`, all of which read native scroll.
- **One owner.** Everything that moves the page goes through `scrollToY` or
  `scrollToElement` in `lib/smooth-scroll.ts`. Two things easing the same scroll
  position is a stutter, and a raw `behavior: "smooth"` also skips the
  reduced-motion check — three of the four original call sites did exactly that.
  The `raw-smooth-scroll` drift rule enforces it.
- **Under `prefers-reduced-motion` the scroller is never constructed.** Not
  created and stopped: never created, so a reader who asks for no motion has
  none of this code in the path.

Nested scroll areas opt out with `data-lenis-prevent` — the mobile nav panel,
both drawer panes, the chat transcript, the command palette list, the contents
rail. The ask drawer pauses the scroller while `body` is locked.

This section previously specified a `reveal` utility — 14px rise, 650ms, staggered by a delay variable — and a 1.5s skeleton shimmer; it was then corrected to say that skeletons use Tailwind's `animate-pulse`. Both claims are dead now: `reveal` has no match anywhere in `src/`, and the site ships no skeletons at all — see the settled argument on placeholders below. The corrections stay here rather than being quietly deleted, because a spec nobody implements still gets implemented eventually.

## Settled arguments, and one open one

Design reviews keep re-raising these. Each is recorded with the measurement
behind it so the next pass reads the reasoning instead of re-litigating it. A
finding here can still be reopened — but with new evidence, not a fresh opinion.

**A placeholder a reader cannot resolve is worse than an empty space.** The
site ships no skeletons. `app/loading.tsx` was a `HomeLoading` masthead — a
portrait plate and three cards — and every route without its own `loading.tsx`
inherited it, so `/stats`, `/uses`, `/garden` and `/contact` all announced
themselves with the shape of the home page. That was the visible half of a
worse problem. A `loading.tsx` creates a Suspense boundary, and React's
streaming format writes the fallback into the markup while parking the resolved
content in `<div hidden id="S:n">`, to be moved into place by a `$RC` script.
With JavaScript off that script never runs, so the fallback is final. Measured
on the built output: every route served roughly 410 characters — the skip link
and the ask drawer's copy — plus 17 to 36 pulsing bars, and no content at all.
`/` was 442 characters, `/blog` 415.

Deleting the five `loading.tsx` files removes those boundaries, and the same two
routes then measure 4,718 and 19,252 characters with the scripts still off. That
exposed three more boundaries doing the same thing, none of them needed: the
root layout wrapped `Navbar` and `Footer`, so every route served its content
with no navigation and no site map — the only link in the document was "Skip to
content"; `/about` wrapped a static résumé download link behind `Loading...`;
and `/photos` wrapped a gallery that reads a constant behind a spinner, which
resolved into the shell on one measurement and not the next, because whether a
boundary makes the shell is down to streaming timing. Removing all three leaves
167 prerendered pages with no pending boundary and no placeholder, and `/stats`
at 1,956 characters with the navbar and footer in the HTML.

The rule that came out of it: **wrap something in `<Suspense>` only when it
genuinely suspends, and write a fallback that is true if it is the last thing a
reader ever sees.** `/chat` keeps its boundary and says asking a question needs
JavaScript, which is accurate; `/bookmarks` says its list lives in this
browser's storage. Both are honest states. "Loading…" over content that will
never load is not one.

The cost is the loading UI on a soft navigation, which these pages, static and
on the CDN, can afford; the benefit is that a JavaScript failure degrades the
site to plain HTML rather than to pulsing bars. `no-unresolvable-placeholder`
guards the source and the `no route parks its content behind a script`
invariant guards the response. Both were positive-controlled: restoring one
`loading.tsx` fails the invariant on every route.

The mobile navbar stays client-only. It is `dynamic(..., { ssr: false })` behind
a media-query gate, so below 768px a reader without JavaScript has no header —
the footer is the site map and carries every doorway, which is what it is for.
That is a deliberate architecture with a fallback, not a placeholder.

This argument was opened by the `/stats` finding and is far larger than it:
seventeen design reviews scored this site with JavaScript on, and not one of
them could see any of it.

**"Recorded in DESIGN.md" is not a fix, and this document is where that was
tested.** `/stats` shipping sixty-three `animate-pulse` nodes and no numbers was
declined across several passes as known, with the remedy written down here. A
later review asked whether being recorded had become the way a real defect
stayed out of the count, and the challenge was correct: the fix was one
afternoon's work and the entry had been standing for longer than that. A
recorded defect is a defect with a citation. What this section is for is
arguments that were settled by measurement — not a holding pen for work nobody
intends to do.


**The arrow glyph is derived, never chosen.** `↗` promises the click leaves the
site. It was on all eight `/garden` cells, on home's "Read the case study", on
the `/lab` search results, and on a same-page anchor that scrolls a few hundred
pixels down the page you are already on — while `/contact` used it correctly for
Calendly and a `mailto:`. One glyph, both meanings, so no meaning.
`LinkArrow` picks it from the `href`, so there is no argument for the arrow and
no way to pass a wrong one. `no-direct-arrow-up-right` keeps `link-arrow.tsx`
the only module allowed to name the icon. A drift rule pairing glyph to href was
the obvious alternative and is the wrong shape: the arrow is a *sibling* of the
href, so any regex has to guess at a relationship across two lines.

**The ask drawer covering the header controls below 1536 is a modal, not a
bug.** It carries `role="dialog"`, `aria-modal="true"`, a full-viewport scrim on
the `drawer` layer with `pointer-events: auto` gated to exactly `max-width: 1535px`, a focus
trap, and its own close button. Covered chrome is what a modal does, announced
by a scrim. Lowering the push breakpoint to 1280 is ruled out against a
measurement recorded in `globals.css`: pushing the shell there took the prose
column from 672px to about 492px and reflowed the paragraph under the reader —
the drawer crushing the thing it exists to keep in view.

**Overlays stack in one named order.** Everything `position: fixed` takes its
z-index from one named order, the `--z-index-*` tokens in `globals.css`: float,
chrome, menu, menu-bar, drawer, lightbox, palette, then the paper grain and the
skip link. Each generates a `z-<name>` utility, and a numeric `z-*` on a fixed
element is drift (`raw-z-on-fixed`). The order follows what opens what: the
palette opens from inside the menu, the drawer and the lightbox, so it is the
top overlay; the phone bar carries the menu's close toggle, so it sits above the
menu; the drawer is a modal on a phone, so it covers the bar. Chosen as numbers
file by file, the palette landed under the menu that opens it, and the bar over
the drawer's close button.

**A separator leads its item; it never trails.** Every `·` is glued to the item
*after* it inside an `inline-flex`. This is chosen, not accidental: a trailing
separator can be orphaned as the last thing on a wrapped line, and a leading one
cannot, because it has something attached to its right. The cost is that a `·`
can begin a wrapped line. Both options put a dot somewhere awkward; this one
never leaves it dangling in mid-air.

**The home page leads with the writing.** Section order is Hero → Currently →
What I think → Projects → Who I am → New here. Reviews read "New here? Start
with these" sitting last as a wayfinding defect. It is a deliberate sequence —
this is a personal site, not a portfolio — and an independent external audit
called the same ordering a strength. Changing it is an editorial decision, not a
repair.

**`lang` and `dir` are set on the client, and that is correct.** They were
resolved server-side from the locale cookie, and reading a cookie in the root
layout made all 84 essays dynamic: `cache-control: private, no-cache, no-store`
with `x-vercel-cache: MISS` on every page. The justification was that
hardcoding them shipped Arabic mirrored-wrong. It was the reverse — translation
is the client-side Google Translate widget, so the server HTML is English in
every locale, and `/ar` was serving `<html lang="ar" dir="rtl">` with zero
Arabic characters: English text mirrored right-to-left, permanently so with
JavaScript off. `HtmlLangSync` sets both attributes alongside the widget that
actually changes the language, so the label tracks the content rather than
preceding it.

**Open: page-top spacing has two conventions.** Fifteen pages use
`Container className="mt-16 lg:mt-32"`, putting `<main>` at y=208 and the kicker
at y=288 on a 1440px viewport. Five (`/blog`, `/garden`, `/stats`, `/uses`,
`/links`) use tighter ad-hoc padding and start at y=80, with kickers between 176
and 268. A review called the roomy value dead paper; it is in fact the majority
convention, and this document specifies neither. Unifying is worth doing — in
whichever direction the author prefers — but it changes every page visibly and
is a judgment about the notebook's margin, not a defect to quietly fix.

**Known and unfixed: `/stats` has no honest loading failure.** Its two client
components destructure `{ data, isLoading }` from SWR and drop `error`, and the
page server-renders no numbers, so with JavaScript off or a hanging request it
shows skeleton placeholders indefinitely — a reader cannot tell "loading" from
"broken". `src/lib/popular-posts.ts` is the pattern for the fix: one server-side
reader, shared by the page and the API route, handed to SWR as `fallbackData`.
Note that `isLoading` stays true through the first request even when
`fallbackData` is supplied, so the skeleton condition has to be
`isLoading && !data` or the fallback renders behind a skeleton and the fix does
nothing.

## Do's and Don'ts

### Do:
- **Do** introduce every section, row and figure with a wall label (mono, 0.72rem, 0.16em, uppercase, Ink Muted) before its title.
- **Do** divide with 1px sand hairlines and 64–96px of vertical space; let whitespace and rules do the structuring.
- **Do** spend Forest Ink on action and emphasis only: links, hover, one primary button per view.
- **Do** build lists as stacked hairline-divided rows (label, title, clamped description), and use asymmetric editorial grids (`2fr / 1fr`, `1fr / 2fr`, `280–360px / 1fr`) when two columns are needed.
- **Do** keep numerals tabular in labels and oldstyle in display, and set every date and count in mono.
- **Do** design dark mode as the same notebook at night: cool hue-220 page, the same green lifted to #42a979, hairlines at 18% lightness.
- **Do** give an empty section an honest empty state in the same voice and typography as a full one.
- **Do** collapse to one column below md, flex-wrap every row of labels, and avoid fixed text widths so right-to-left and long translated strings survive.

### Don't:
- **Don't** add shadows to content surfaces at rest or on hover; the CTA ledge is the only elevated object.
- **Don't** reintroduce neumorphic double shadows, inset "pressed" shadows or glassy card grids; the `--neu-shadow-*` tokens are legacy and must not spread.
- **Don't** build SaaS landing-page furniture: gradient blobs, three-column feature tiles, pill badges as decoration, glowing buttons.
- **Don't** use monospace as a voice. It is the label beside the work, never headings or body copy; the site is not a terminal.
- **Don't** set the handwriting in body text, controls or labels, and don't set body copy in anything but Instrument Sans, or EB Garamond on a plate.
- **Don't** use neutral grey for rules or muted surfaces; every neutral is warm paper (hue 30–38) in light mode and cool night (hue 220) in dark.
- **Don't** introduce a second accent colour; Moss exists for secondary fills and the four signal colours are for status only.
- **Don't** round the portrait plate or box the underline input; squareness marks the work, roundness marks the interface. Nothing on a plate is rounded.
- **Don't** define `--spacing-xs..4xl` tokens in `@theme`; in Tailwind v4 they shadow the `max-w-*` container scale and collapse layouts.

- **Don't** ship a skeleton, shimmer or pulsing placeholder; a `loading.tsx` parks the real content behind a script, so the fallback is what a reader without JavaScript keeps.

## Plates

Added with the museum redesign. Phase 1 sets the header, the footer and the home page this way; every other page still uses the centred column described under Layout and will move over in later phases.

- **Full bleed.** A plate has no centred max-width column. Its rows run the width of the viewport and its cells divide that width (`2fr / 1fr`, `1fr / 2fr`, four equal cells). Only text inside a cell carries a measure cap.
- **Ruled.** Rows and cells are divided by 1px of Ink Rule (`--rule`) that runs edge to edge. `plate-grid` draws the rules between cells as the grid's own 1px gap over an ink ground, so they follow the columns at every breakpoint and never double; a section closes with `border-b border-rule`. `--border` is not used on a plate.
- **Modest padding.** A cell pads with `plate-cell`, `clamp(14px, 1.5vw, 24px)`. Space inside a cell does the breathing; there is no 64–96px band between plates.
- **Three voices.** The handwriting for titles, the site name and short notes; EB Garamond for the statement and for ledes and blurbs (`text-statement`, `text-lede`); IBM Plex Mono for the wall label.
- **Images whole and in colour.** The portrait is a tall cell beside the statement. A project cover takes two thirds of its row at its own 16:10, uncropped, with its text as the ruled label cell beside it.
- **Flat.** No shadow, no blur, no pill and no rounded corner on a plate.
- **One column on a phone.** Every row stacks below `lg` (the masthead below `md`); the currently strip and the footer's site map sit two-up.
- **Night.** Plates use tokens only, so the dark palette applies unchanged; the rule lifts to #6a7181 so it stays a clear hairline on the night page.
