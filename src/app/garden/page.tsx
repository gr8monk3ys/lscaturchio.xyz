import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { ArrowUpRight } from "lucide-react";

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
    title: "Films",
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

export default function GardenPage() {
  return (
    <Container size="large">
      <div className="py-10">
        <header>
          <span className="label-mono block">Garden</span>
          <Heading className="mt-4 font-bold text-4xl md:text-5xl tracking-tight">
            A garden, not a homepage.
          </Heading>
          <Paragraph className="mt-4 max-w-2xl text-muted-foreground">
            The parts of this site that aren&apos;t work. Some of these are tended
            weekly, some are overgrown, and one or two are still bare soil. That&apos;s
            the point of a garden.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

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
      </div>
    </Container>
  );
}
