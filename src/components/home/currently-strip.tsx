import Link from "next/link";
import { BookOpen, Clapperboard, PenLine, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCurrentlyReading } from "@/lib/goodreads";
import { getRecentWatches } from "@/lib/letterboxd";

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
 * A thin, live "what I'm up to" row sourced from the same data that powers the
 * garden pages (Goodreads CSV, Letterboxd CSV, blog, GitHub). Every item is
 * optional — missing data just drops the cell — so the strip degrades to
 * nothing rather than showing placeholders.
 */
export function CurrentlyStrip({ latestPost, latestRepo }: CurrentlyStripProps) {
  const reading = getCurrentlyReading()[0];
  const lastWatch = getRecentWatches(1)[0];

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
    <section aria-label="What I'm up to right now" className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl border-y border-border/60 py-4">
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.key} className="min-w-0">
              <Link
                href={item.href}
                prefetch={false}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="group flex items-center gap-3"
              >
                <item.icon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                />
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="block truncate text-sm text-foreground transition-colors group-hover:text-primary">
                    {item.text}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
