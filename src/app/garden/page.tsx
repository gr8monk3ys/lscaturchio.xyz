import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { ArrowUpRight } from "lucide-react";
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
    title: "Photographs",
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
    <Container size="large">
      <div className="py-10">
        <PageHead
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

        <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
          {PLOTS.map((plot) => (
            <li key={plot.href} className="bg-background">
              <Link
                href={plot.href}
                prefetch={false}
                className="group flex h-full items-start justify-between gap-4 p-6 transition-colors hover:bg-primary/5"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground group-hover:text-primary">
                    {plot.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {plot.blurb}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-14" aria-labelledby="garden-more">
          <span id="garden-more" className="label-mono block">
            Also growing · {MORE.length} more pages
          </span>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4">
            {MORE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={false}
                  className="label-mono normal-case tracking-normal text-foreground ink-underline transition-colors hover:text-primary"
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
