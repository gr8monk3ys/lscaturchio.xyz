/**
 * The page's three column widths, in one place.
 *
 * DESIGN.md, "Layout": *"The page is a single centred column on open paper,
 * with three widths: narrow (42rem) for reading, medium (56rem) for mixed
 * content, wide (72rem) for the masthead, galleries and index pages."*
 *
 * Before this module there were two scales and neither was that one.
 * `Container` offered 56 / 80 / 100rem — its widest, `max-w-400`, resolves to
 * `calc(0.25rem * 400)`, so eleven routes including /about were laid out to
 * 1600px and read as full-bleed on any normal laptop. `Section` offered a
 * different 48 / 64 / 80rem. The home page used both at once, which is why the
 * masthead's right edge never lined up with the sections beneath it.
 *
 * Tailwind v4's container scale supplies all three exactly: 2xl is 42rem,
 * 4xl is 56rem, 6xl is 72rem. Nothing here needs a custom token.
 */
export const PAGE_WIDTHS = {
  /** 42rem. Reading: an essay, a policy page, anything that is mostly prose. */
  narrow: "max-w-2xl",
  /** 56rem. Mixed content: prose with rows, figures or a sidebar beside it. */
  medium: "max-w-4xl",
  /** 72rem. The masthead, galleries and index pages. The widest the page goes. */
  wide: "max-w-6xl",
  /** No constraint. Full-bleed sections that manage their own inner width. */
  full: "max-w-none",
} as const;

export type PageWidth = keyof typeof PAGE_WIDTHS;
