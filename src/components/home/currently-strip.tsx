import Link from "next/link";
import { BookOpen, Clapperboard, PenLine, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getGoodreadsLibrary } from "@/lib/goodreads";
import { getLetterboxdLibrary, getLiveLastWatch } from "@/lib/letterboxd";

interface CurrentlyStripProps {
  latestPost?: { slug: string; title: string } | null;
  latestRepo?: { title: string; href: string } | null;
}

interface StripItem {
  key: string;
  label: string;
  icon: LucideIcon;
  text: string;
  href: string;
  external?: boolean;
}

/**
 * A thin, live "what I'm up to" row. The last film is fetched live from
 * Letterboxd's RSS (hourly), falling back to the committed CSV; reading,
 * latest essay, and latest repo come from the same sources as the garden
 * pages. Every item is optional — missing data drops the cell — so the strip
 * degrades to nothing rather than showing placeholders.
 */
export async function CurrentlyStrip({ latestPost, latestRepo }: CurrentlyStripProps) {
  const reading = getGoodreadsLibrary().currentlyReading()[0];
  const lastWatch = (await getLiveLastWatch()) ?? getLetterboxdLibrary().recentWatches(1)[0];

  const items: StripItem[] = [];

  if (reading) {
    items.push({
      key: "reading",
      label: "Reading",
      icon: BookOpen,
      text: `${reading.title} — ${reading.author}`,
      href: "/books",
    });
  }

  if (lastWatch) {
    const rating = lastWatch.rating ? ` · ${lastWatch.rating}★` : "";
    items.push({
      key: "watched",
      label: "Last watched",
      icon: Clapperboard,
      text: `${lastWatch.title}${lastWatch.year ? ` (${lastWatch.year})` : ""}${rating}`,
      href: "/movies",
    });
  }

  if (latestPost) {
    items.push({
      key: "wrote",
      label: "Latest essay",
      icon: PenLine,
      text: latestPost.title,
      href: `/blog/${latestPost.slug}`,
    });
  }

  if (latestRepo) {
    items.push({
      key: "building",
      label: "Building",
      icon: Wrench,
      text: latestRepo.title,
      href: latestRepo.href,
      external: true,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-label="What I'm up to right now" className="w-full border-b border-rule">
      {/* Four ruled cells: two-up on a phone, one row from `lg`. The columns
          are auto-sized to the items, so a missing source drops its cell and
          the rest still fill the row; an odd last cell on a phone spans both
          columns rather than leaving a hole in the plate. */}
      <ul className="plate-grid grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
        {items.map((item) => (
          <li key={item.key} className="last:odd:col-span-2 lg:last:odd:col-span-1">
            <Link
              href={item.href}
              prefetch={false}
              {...(item.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="plate-cell group flex h-full flex-col gap-3 lg:min-h-40"
            >
              <span className="label-mono flex items-center gap-2">
                <item.icon
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-primary"
                />
                {item.label}
              </span>
              {/* Set whole, not truncated: the cell has the room, and an
                  ellipsis says text is missing without saying what. */}
              <span className="text-lede text-foreground transition-colors group-hover:text-primary">
                {item.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
