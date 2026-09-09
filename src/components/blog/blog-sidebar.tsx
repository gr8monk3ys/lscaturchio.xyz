"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Reads the essay's own headings, and only those. Scoping to the prose
 * container keeps the end matter ("Webmentions", "Enjoyed this?") out of the
 * contents, and the seen-set keeps two identically named headings from
 * collapsing onto one anchor.
 */
function useEssayHeadings(slug?: string) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const root =
      document.querySelector<HTMLElement>(".prose-gallery") ??
      document.querySelector<HTMLElement>("article");
    if (!root) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>("h2, h3"));

    const seen = new Set<string>();
    const headingElements: Heading[] = [];
    for (const element of elements) {
      const level = parseInt(element.tagName[1]);
      const text = element.textContent?.trim() || "";
      let id = element.id || slugify(text);
      if (!id) continue;
      if (seen.has(id)) {
        let n = 2;
        while (seen.has(`${id}-${n}`)) n += 1;
        id = `${id}-${n}`;
      }
      seen.add(id);
      element.id = id;
      headingElements.push({ id, text, level });
    }

    setHeadings(headingElements);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -66% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
    };
  }, [slug]);

  return { headings, activeId };
}

function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

/** Ask about this essay. Shared by the desktop rail and the mobile end matter. */
function ContentsList({
  headings,
  activeId,
}: {
  headings: Heading[];
  activeId: string;
}) {
  return (
    <ul className="space-y-2 text-sm">
      {headings.map((heading) => (
        <li key={heading.id} className={cn(heading.level === 3 ? "pl-4" : "", "transition-colors")}>
          <button
            type="button"
            onClick={() => scrollToHeading(heading.id)}
            className={cn(
              "block w-full py-1 text-left transition-colors hover:text-primary",
              activeId === heading.id
                ? "text-primary font-medium border-l border-primary pl-3 -ml-3"
                : "text-muted-foreground hover:border-l hover:border-border pl-3 -ml-3"
            )}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Desktop rail. Hidden below xl, where the inline disclosure takes over. */
export function BlogSidebar({ slug }: { slug: string }) {
  const { headings, activeId } = useEssayHeadings(slug);

  // Contents only. The Ask panel that used to sit above this moved into the
  // site-wide drawer: it was a form whose submit navigated the reader away from
  // the essay to /chat, and below xl it did not exist at all.
  if (headings.length === 0) return null;

  return (
    <aside
      className="hidden xl:block xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:py-8"
      aria-label="Article sidebar"
    >
      <nav className="border border-border p-5" aria-label="Table of contents">
        <span className="label-mono mb-4 block">On this page</span>
        <ContentsList headings={headings} activeId={activeId} />
      </nav>
    </aside>
  );
}

/**
 * Contents for narrow windows: a collapsed disclosure under the essay header.
 * The rail is xl-only, and below that the reader had no map at all.
 */
export function EssayContentsInline({ slug }: { slug: string }) {
  const { headings, activeId } = useEssayHeadings(slug);

  if (headings.length === 0) return null;

  return (
    <details className="mt-8 border-y border-border py-3 xl:hidden">
      <summary className="label-mono label-link cursor-pointer list-none text-foreground marker:content-['']">
        On this page · {headings.length} sections
      </summary>
      <nav className="mt-3" aria-label="Table of contents">
        <ContentsList headings={headings} activeId={activeId} />
      </nav>
    </details>
  );
}

