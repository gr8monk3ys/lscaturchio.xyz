import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { LinkArrow } from "@/components/ui/link-arrow";
import { footerColumns, primaryNavigation } from "@/constants/navlinks";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Garden",
  description:
    "Books, films, music, photographs, experiments, and what I'm doing now — the parts of this site that are not work.",
  path: "/garden",
});

const PLOTS = [
  {
    href: "/now",
    title: "Now",
    blurb: "What I'm doing at the moment, honestly dated.",
  },
  {
    href: "/books",
    title: "Books",
    blurb: "Everything I've read, pulled from Goodreads.",
  },
  {
    href: "/movies",
    title: "Movies",
    blurb: "A diary of what I've watched, pulled from Letterboxd.",
  },
  {
    href: "/music",
    title: "Music",
    blurb: "Indie folk with industrial textures, made at home.",
  },
  {
    href: "/photos",
    title: "Photography",
    blurb: "Travel and landscape work, shot on a Fuji X-T30 II.",
  },
  {
    href: "/lab",
    title: "Lab",
    blurb: "Search and retrieval demos running on this site, plus rough edges.",
  },
  {
    href: "/links",
    title: "Links",
    blurb: "Things worth other people's attention.",
  },
  {
    href: "/guestbook",
    title: "Guestbook",
    blurb: "Say something.",
  },
];

// Every other doorway on the site, so the garden is the whole map rather than
// a curated subset. Drawn from the footer columns plus the pages that have no
// other entrance anywhere.
const BARE_SOIL: Array<{ href: string; name: string }> = [
  { href: "/colophon", name: "Colophon" },
  { href: "/roadmap", name: "Roadmap" },
  { href: "/stats", name: "Stats" },
  { href: "/bookmarks", name: "Bookmarks" },
  { href: "/map", name: "Map" },
  { href: "/tags", name: "Tags" },
  { href: "/api-docs", name: "API" },
];

// Anything already in the header or tended above does not need a second door.
const SHOWN = new Set<string>([
  "/garden",
  ...PLOTS.map((plot) => plot.href),
  ...primaryNavigation.map((item) => item.href),
]);

const MORE: Array<{ href: string; name: string }> = [
  ...footerColumns.flatMap((column) => column.items),
  ...BARE_SOIL,
]
  .map((item) => ({ href: item.href, name: item.name }))
  .filter(
    (item, index, all) =>
      !SHOWN.has(item.href) && all.findIndex((other) => other.href === item.href) === index
  );

export default function GardenPage() {
  return (
    <Container size="wide">
      <div className="py-10">
        <PageHead
          ruleWidth="measure"
          kicker="Garden"
          title="A garden, not a homepage."
          blurb={
            <>
              The parts of this site that aren&apos;t work. Some of these are tended
              weekly, some are overgrown, and one or two are still bare soil. That&apos;s
              the point of a garden.
            </>
          }
        />

        {/* Hairline rows, not a 2x4 grid of equal tiles.
            DESIGN.md assigns index pages "stacked rows separated by hairlines
            ... not tiled cards", and says two-column compositions are
            "asymmetric editorial splits, never equal halves". This was the one
            index on the site doing both of the things it rules out — and it is
            the entry point to the section PRODUCT.md calls the garden, so the
            reader met the exception before any of the rule.

            `max-w-2xl` on the list, like `/blog` and the topic hubs: the page
            header keeps the wide column, the list caps at the documented
            reading measure. The blurbs are sentences, and a sentence set
            across 72rem is not a row, it is a paragraph pretending to be one. */}
        <ul className="mt-10 max-w-2xl divide-y divide-border border-y border-border">
          {PLOTS.map((plot) => (
            <li key={plot.href}>
              <Link
                href={plot.href}
                prefetch={false}
                className="group flex items-start justify-between gap-4 py-4 transition-colors"
              >
                <span className="min-w-0">
                  {/* An `h2` on the ramp, not a `<span>` at body size.
                      Converting this page's tiles to rows left the titles as
                      spans, so `/garden` rendered exactly ONE heading element
                      for its eight destinations — measured `headingOrder: [1]`.
                      The heading rotor, which is how a screen-reader user
                      skims, reached every essay on `/blog` and nothing at all
                      here. `h2` because there is no grouping level above these
                      on this page, and `text-card-title` because that is the
                      step the identical row uses on `/blog`, `/topics` and
                      `/tag`. */}
                  <h2 className="text-card-title text-foreground group-hover:text-primary">
                    {plot.title}
                  </h2>
                  <span className="mt-1 block max-w-prose text-sm text-muted-foreground">
                    {plot.blurb}
                  </span>
                </span>
                <LinkArrow
                  href={plot.href}
                  className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-14" aria-labelledby="garden-more">
          <span id="garden-more" className="label-mono block">
            Also growing · {MORE.length} more pages
          </span>
          {/* `min-h-11` on phones: these fourteen links measured 15px tall,
              well under WCAG 2.5.8's 24px floor and the smallest tap targets
              on the page. The compact wall-label row returns from `sm:` up. */}
          <ul className="mt-4 flex flex-wrap gap-x-5 border-t border-border pt-4 sm:gap-y-2">
            {MORE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className="label-mono label-link inline-flex items-center normal-case tracking-normal text-foreground ink-underline transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  );
}
