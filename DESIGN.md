---
name: lscaturchio.xyz
description: A field notebook on warm paper, written in forest ink and catalogued in monospace.
colors:
  forest-ink: "#184e35"
  forest-ink-dark: "#42a979"
  moss: "#397f5e"
  paper: "#f9f8f5"
  paper-card: "#fbfaf9"
  paper-tinted: "#eeece7"
  paper-warm: "#f5ebe0"
  ink: "#1a1f23"
  ink-muted: "#606976"
  hairline: "#e2dbd5"
  night: "#111317"
  night-card: "#16181d"
  night-tinted: "#25272d"
  night-ink: "#fafafa"
  night-ink-muted: "#abb0ba"
  night-hairline: "#292c32"
  signal-error: "#ef4444"
  signal-success: "#16a249"
  signal-warning: "#f59f0a"
  signal-info: "#3c83f6"
typography:
  display:
    fontFamily: "Fraunces, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 5.2vw, 4.9rem)"
    fontWeight: 720
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Fraunces, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3.6vw, 3.2rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Fraunces, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.55rem, 2.4vw, 2.25rem)"
    fontWeight: 650
    lineHeight: 1.18
    letterSpacing: "-0.026em"
  card-title:
    fontFamily: "Fraunces, ui-sans-serif, system-ui, sans-serif"
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

**Creative North Star: "The Field Notebook"**

The site is a working notebook kept on warm paper. Everything in it is a record: an essay, a film watched on a date, a book with a rating, a job with a sourced number. The page itself is the paper, off-white with a near-invisible grain; the writing is set in a serif with personality; the accent is a single green ink used the way one pen is used, for the marks that matter. Beside every entry sits a small monospace label, the way a specimen is catalogued: kicker, date, count, place. Structure comes from hairline rules and from tinted patches of the same paper, never from boxes floating above it.

The mood is quiet and unhurried. Nothing competes for attention; whitespace and rules do the organising, and the reader is trusted to move through it at their own pace. It is warm and papery: the ground, the grain, and the sand-toned borders all read as paper rather than screen. It is precise and catalogued: tabular numerals, uppercase mono labels, and dates give the site the feel of a place that keeps records honestly. And it is literary and serif-led: Fraunces carries the personality, so the display type is the only decoration the system needs.

The system deliberately is not three things. It is not neumorphic: the soft double-shadow blooms that once covered the site were its single biggest "AI template" signal and were removed in favour of ink-on-paper. It is not SaaS landing-page chrome: no gradient blobs, no glassy card grids, no badge-pill features in three columns. And it is not the dark-mode-first developer aesthetic: mono is a label beside the work, never the voice of the work, and dark mode is a night-reading variant of the same notebook, not a terminal.

**Key Characteristics:**
- One paper ground, warm off-white with a fixed 3.5% noise grain; dark mode is a night variant of the same page.
- One ink accent, Forest Ink, spent sparingly: links, the drop cap, text selection, the single primary CTA.
- Hairline rules and tint shifts structure the page; there are no floating cards and no decorative shadows.
- Three type voices with fixed jobs: Fraunces speaks, Instrument Sans reads, IBM Plex Mono catalogues.
- Motion is a soft settle, never a performance: 150–300ms hover, a 650ms reveal, all off under reduced motion.

## Colors

A warm, low-chroma paper palette with one deep green ink and a sand-toned hairline; dark mode inverts to a cool night page with the same green lifted for contrast.

### Primary
- **Forest Ink** (#184e35 light / #42a979 dark; `--primary`): the one pen. Links, the essay drop cap, the hover colour of any interactive text, the 22% tint behind selected text, the fill of the single primary button, the underline that grows beneath a hovered nav item, and the border that warms on a hovered surface. The dark value is lighter so the ink stays legible on night paper.
- **Moss** (#397f5e; `--secondary`): a lighter green for secondary fills and status tints. Rarely seen; it exists so a second green never has to be invented.

### Neutral
- **Paper** (#f9f8f5; `--background`): the page. Warm off-white, hue 38, with the noise grain laid over it.
- **Paper Card** (#fbfaf9; `--card`): a surface one shade lighter than the page, used for buttons, list rows and cards so they sit on the paper rather than above it.
- **Paper Tinted** (#eeece7; `--muted`): the "recessed" tone. Used at 55% opacity for pressed or secondary surfaces, and full-strength for disabled controls.
- **Paper Warm** (#f5ebe0; `--accent`): a sand highlight for hover fills and the rare emphasised block.
- **Ink** (#1a1f23; `--foreground`): body text. A cool near-black with a blue cast that keeps the warm paper from going yellow.
- **Ink Muted** (#606976; `--muted-foreground`): captions, wall labels, descriptions, placeholders. Everything that is metadata rather than the work.
- **Hairline** (#e2dbd5; `--border`): the rule. A sand tone, never grey, drawn at 1px and often at 40–90% opacity.
- **Night** (#111317), **Night Card** (#16181d), **Night Tinted** (#25272d), **Night Ink** (#fafafa), **Night Ink Muted** (#abb0ba), **Night Hairline** (#292c32): the dark-mode counterparts, hue 220, cool rather than warm.

### Signal
- **Error** (#ef4444), **Success** (#16a249), **Warning** (#f59f0a), **Info** (#3c83f6): status colours for form errors, toasts and badges only. Each has a 10–15% tinted background variant. They never appear as decoration.

### Named Rules
**The One Pen Rule.** Forest Ink is the only chromatic accent on any surface, and it marks action or emphasis, never area. If a screen has green in more than a few places, it has too many.

**The Sand Hairline Rule.** Dividers are 1px of Hairline, sand-toned, never neutral grey and never thicker. Depth of structure is expressed by more rules and more space, not by darker lines.

**The Tinted Paper Rule.** A "contained" surface is the same paper at a different tint (Paper Card lighter, Paper Tinted darker), bordered by a hairline. It is never a white box on a grey page.

## Typography

**Display Font:** Fraunces (with ui-sans-serif, system-ui fallback), variable optical size, loaded via next/font with `preload: false`.
**Body Font:** Instrument Sans (with ui-sans-serif, system-ui fallback).
**Label/Mono Font:** IBM Plex Mono, weights 400/500/600 (with ui-monospace, Menlo fallback).

**Character:** A high-contrast, slightly wonky serif doing the talking, a plain humanist sans doing the reading, and a monospace doing the filing. Fraunces at heavy weights and tight tracking gives headings a printed, editorial presence; Instrument Sans at 1.65 line-height stays out of the way; Plex Mono, small, uppercase and widely tracked, is the wall label beside the work.

### Hierarchy
- **Display** (Fraunces 720, clamp 2.4–4.9rem, 1.02, -0.035em, oldstyle numerals): the home masthead and nothing else. The hero itself uses the Tailwind 5xl/6xl/7xl steps at weight 600 and line-height 0.98, with the name in Forest Ink.
- **Headline** (Fraunces 700, clamp 1.9–3.2rem, 1.12, -0.03em): one per page, the page title.
- **Title** (Fraunces 650, clamp 1.55–2.25rem, 1.18, -0.026em): section headings. Framer-motion section headings use the 3xl/4xl steps at weight 700.
- **Card Title** (Fraunces 620, 1.25rem, 1.2, -0.02em): headings inside a list row or card. A subsection step exists at 1.075rem / 560.
- **Body** (Instrument Sans 400, 1rem, 1.65): reading text. Essays use the typography plugin's `prose-lg` at full width of the reading column, with the opening letter set as a 3.4em Fraunces drop cap in Forest Ink.
- **Description** (Instrument Sans 400, 0.875–1rem, Ink Muted): secondary copy under a title.
- **Label** (IBM Plex Mono 500, 0.72rem, 0.16em tracking, uppercase, tabular numerals, Ink Muted): the wall label. Kickers ("Essays · Systems · Los Angeles"), dates, counts, captions, footer links, suggested-question chips. The same class with normal case and tracking is the small mono link style.

### Named Rules
**The Wall Label Rule.** Every piece of metadata (a date, a count, a place, a category) is set as a Label: mono, small, uppercase, tracked, muted. Metadata never borrows the body or heading voice.

**The Serif Speaks Rule.** Fraunces appears only where the site is speaking: headings, the drop cap, the masthead. Never in body copy, UI controls or labels.

**The Fluid Heading Rule.** Headings scale with `clamp()`, not breakpoints; weights step down the hierarchy (720 → 700 → 650 → 620 → 560) and tracking loosens as size falls.

## Layout

The page is a single centred column on open paper, with three widths: narrow (42rem) for reading, medium (56rem) for mixed content, wide (72rem) for the masthead, galleries and index pages. Horizontal padding is 16px, rising to 24px and 32px at the sm and lg breakpoints.

Vertical rhythm is generous. Sections breathe at 64px, then 80px at sm and 96px at lg; small sections at 32/48/64px. Cards and list rows pad at 24px (32px at sm) or 16px (24px at sm). Between sections sits a full-width hairline, the gallery rule, rather than a background change.

Two-column compositions are asymmetric editorial splits, never equal halves: the masthead is `1fr / 300px` with the portrait plate at the right edge, the theme index is `280–360px / 1fr` with a sticky left rail, the footer is `1.1fr / 2fr`. Lists are stacked rows separated by hairlines with the label above the title and the description below, not tiled cards.

The desktop navigation is fixed, 80px tall, on 90% paper with a 12px blur and a 40%-opacity hairline beneath; the page reserves the same 80px above its content. Below the md breakpoint the desktop bar is hidden and a mobile navbar takes over. Breakpoints are Tailwind's defaults (sm 640, md 768, lg 1024, xl 1280).

Right-to-left scripts and long translated strings are a product commitment: keep labels and rows flex-wrapped, avoid fixed widths on text, and let the asymmetric grids collapse to one column below md.

## Elevation & Depth

Flat paper, tint shifts only. Every surface sits on one plane. Hierarchy is drawn with hairlines and with the three paper tints (Card lighter, Tinted darker, Warm for emphasis), and a hover is a colour change (border warming to Forest Ink at 45%, background tinting to Forest Ink at 5–6%), not a lift. The noise grain over the whole page is what stops large flat areas from reading as sterile screen white.

Two exceptions exist and are structural, not decorative: the fixed navigation bar carries a wide, soft shadow (`0 8px 30px rgba(0,0,0,0.08)`) so it reads as a separate sheet when content scrolls under it, and the primary CTA carries a 1px ledge (`0 1px 0` of Forest Ink at 25%) beneath its border so the one filled button feels pressed onto the page.

The old neumorphic shadow tokens (`--neu-shadow-*`) still exist in the stylesheet because forty-odd files reference the `neu-*` class names, but the classes themselves are now flat: background, hairline, tint. The filled and destructive badge variants are the last places the double-shadow values are still applied; treat that as debt, not vocabulary. The `neu-card` utility keeps a 2px hover lift; it is a leftover, not the doctrine.

### Named Rules
**The Flat Paper Rule.** No shadow on any content surface, at rest or on hover. A hovered surface changes tint and border colour; it does not rise.

**The Two Sheets Rule.** The only elevated objects are the fixed navigation and the primary CTA's 1px ledge. Nothing else may add a shadow without changing this file first.

## Shapes

The form language is soft-cornered paper with one square exception. Buttons and controls use 14px corners (the xl step); small buttons 10px; the shadcn-style Card wrapper 18px; the raw `neu-card` utility 12px. Chips, badges, the ask button and the navigation's control pill are fully round. Radius never goes below 6px on a control, and never above 18px on a container.

Two elements are deliberately square: the portrait plate in the masthead (a hairline-bordered square photograph with a mono caption below, like a placard) and the underline input, which has no radius and no box, only a bottom rule. Squareness marks the work; roundness marks the interface.

Borders are always 1px Hairline, frequently at reduced opacity (40% under the nav, 60% above the footer, 70–90% on tinted surfaces). Glass utilities (`glass`, `glass-subtle`, `glass-heavy`: 40–75% paper with 8–20px blur) exist for overlays such as the command palette and are not for content surfaces.

## Components

The controls are refined and restrained: hairline borders, tint on hover, a fill only on the one primary action, and inputs that are an underline drawn on the page.

### Buttons
- **Shape:** softly rounded (14px), 40px tall, 16px horizontal padding; small 36px / 10px radius; large 48px / 32px padding. Text is Instrument Sans 500 at 0.875rem.
- **Primary** (`cta-primary`): Forest Ink fill, white text, a 1px border of Forest Ink at 42%, and the 1px ledge shadow. One per view. On the masthead it is a fully round "Ask →" pill inside the underline input.
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
- **Underline** (the masthead ask field): 56px tall, transparent, no radius, a 1px Hairline bottom rule, 1.125rem text, placeholder Ink Muted at 70%. Focus turns the rule Forest Ink with no ring. The submit button sits inside at the right.
- **Field** (`neu-input`): Paper Card fill, hairline border, 8px radius, 40px tall. Focus: border Forest Ink at 50% plus a 2px Forest Ink outline offset 2px.
- **Error / Disabled:** errors use Error text below the field; disabled controls take the Paper Tinted / Ink Muted treatment.

### Navigation
- **Desktop:** fixed 80px bar, 90% Paper with 12px blur, 40% hairline beneath, the one structural shadow. Logo at left (inverted in dark mode), links across, a fully round hairline pill at right holding the theme toggle and controls. Hovered links grow a 2px Forest Ink underline from the left over 300ms; the active link keeps it. Links use the body font, not mono.
- **Mobile:** below md the bar is replaced by a mobile navbar.
- **Footer:** hairline above at 60%, a `1.1fr / 2fr` grid, column headings as small uppercase tracked sans in Ink Muted, links in wall-label mono that turn Forest Ink on hover, a hairline before the legal line.

### Wall Label (signature)
The `label-mono` utility: IBM Plex Mono 500, 0.72rem, 0.16em tracking, uppercase, tabular numerals, Ink Muted. It is the placard beside every piece of work: the masthead kicker and portrait caption, the "Ask the site anything" heading, section counts, dates on rows, footer links. With `normal-case tracking-normal` it becomes the small mono link. Any new section should introduce itself with one.

### Masthead (signature)
Wall-label kicker, a Fraunces name at 5xl–7xl with the surname in Forest Ink, a one-sentence muted thesis, and a square hairline-bordered portrait with a mono caption at the right edge. Below a hairline, the underline ask field with a round primary "Ask" inside it and three mono suggested questions. It is the notebook's title page.

### Essay Body (signature)
`prose prose-lg` at the reading width, Fraunces headings with 6rem scroll margin, a 3.4em Forest Ink drop cap on the first paragraph, hairline rules between sections.

### Motion
Hover and focus transitions are 150ms (fast), 200ms (default) or 300ms (slow) with `ease`. Entrance and layout motion is framer-motion at 0.2/0.35/0.5s on the standard curve `cubic-bezier(0.22, 1, 0.36, 1)`. Below-fold content uses the `reveal` utility: 14px rise, 650ms, same curve, staggered by a delay variable. Skeletons shimmer once per 1.5s. Every motion collapses to none under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** introduce every section, row and figure with a wall label (mono, 0.72rem, 0.16em, uppercase, Ink Muted) before its title.
- **Do** divide with 1px sand hairlines and 64–96px of vertical space; let whitespace and rules do the structuring.
- **Do** spend Forest Ink on action and emphasis only: links, hover, the drop cap, one primary button per view.
- **Do** build lists as stacked hairline-divided rows (label, title, clamped description), and use asymmetric editorial grids (`1fr / 300px`, `280–360px / 1fr`) when two columns are needed.
- **Do** keep numerals tabular in labels and oldstyle in display, and set every date and count in mono.
- **Do** design dark mode as the same notebook at night: cool hue-220 page, the same green lifted to #42a979, hairlines at 18% lightness.
- **Do** give an empty section an honest empty state in the same voice and typography as a full one.
- **Do** collapse to one column below md, flex-wrap every row of labels, and avoid fixed text widths so right-to-left and long translated strings survive.

### Don't:
- **Don't** add shadows to content surfaces at rest or on hover; the nav sheet and the CTA ledge are the only elevated objects.
- **Don't** reintroduce neumorphic double shadows, inset "pressed" shadows or glassy card grids; the `--neu-shadow-*` tokens are legacy and must not spread.
- **Don't** build SaaS landing-page furniture: gradient blobs, three-column feature tiles, pill badges as decoration, glowing buttons.
- **Don't** use monospace as a voice. It is the label beside the work, never headings or body copy; the site is not a terminal.
- **Don't** set Fraunces in body text, controls or labels, and don't set body copy in anything but Instrument Sans.
- **Don't** use neutral grey for rules or muted surfaces; every neutral is warm paper (hue 30–38) in light mode and cool night (hue 220) in dark.
- **Don't** introduce a second accent colour; Moss exists for secondary fills and the four signal colours are for status only.
- **Don't** round the portrait plate or box the underline input; squareness marks the work, roundness marks the interface.
- **Don't** define `--spacing-xs..4xl` tokens in `@theme`; in Tailwind v4 they shadow the `max-w-*` container scale and collapse layouts.
