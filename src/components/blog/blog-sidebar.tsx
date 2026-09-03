"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { MessageSquareText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
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

const QUICK_PROMPTS: Array<{ id: string; label: string; prompt: (title: string, headings: string[]) => string }> = [
  {
    id: "summary",
    label: "Summarize",
    prompt: (title) => `Summarize my post "${title}" in 5 bullets.`,
  },
  {
    id: "takeaways",
    label: "Key Takeaways",
    prompt: (title) => `What are the key takeaways from my post "${title}"?`,
  },
  {
    id: "counter",
    label: "Challenge It",
    prompt: (title, headings) =>
      `Challenge the main argument of my post "${title}". If helpful, structure the critique around these sections: ${headings.slice(0, 6).join(", ")}.`,
  },
];

/**
 * Reads the essay's own headings, and only those. Scoping to the prose
 * container keeps the end matter ("Webmentions", "Enjoyed this?") out of the
 * contents, and the seen-set keeps two identically named headings from
 * collapsing onto one anchor.
 */
function useEssayHeadings(contentRef?: RefObject<HTMLElement | null>, slug?: string) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const root =
      contentRef?.current ??
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
  }, [contentRef, slug]);

  return { headings, activeId };
}

function scrollToHeading(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Ask about this essay. Shared by the desktop rail and the mobile end matter. */
function AskPanel({
  slug,
  title,
  headingTexts,
}: {
  slug: string;
  title: string;
  headingTexts: string[];
}) {
  const router = useRouter();
  const [question, setQuestion] = useState<string>("");

  const goToChat = (q: string) => {
    const url = new URL("/chat", window.location.origin);
    url.searchParams.set("contextSlug", slug);
    url.searchParams.set("contextTitle", title);
    url.searchParams.set("q", q);
    router.push(`${url.pathname}${url.search}`);
  };

  return (
    <div className="border border-border p-5">
      <span className="label-mono block">Ask</span>
      <h2 className="mt-2 font-display text-lg font-semibold tracking-tight">
        Ask about this post
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A question grounded in this article — or argue with it.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setQuestion(p.prompt(title, headingTexts))}
            className="label-mono border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="sr-only" htmlFor={`ask-question-${slug}`}>
          Question
        </label>
        <textarea
          id={`ask-question-${slug}`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What’s the strongest argument against this?"
          rows={3}
          className={cn(
            "w-full resize-none border border-border bg-transparent px-3 py-2 text-sm",
            "text-foreground placeholder:text-muted-foreground",
            "focus:border-primary/50 focus:outline-hidden focus:ring-2 focus:ring-primary"
          )}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goToChat(question.trim() || `What is my post "${title}" about?`)}
          className="cta-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        >
          <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          Ask in Chat
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="label-mono">Answers from this essay</span>
      </div>
    </div>
  );
}

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
                ? "text-primary font-medium border-l-2 border-primary pl-3 -ml-3"
                : "text-muted-foreground hover:border-l-2 hover:border-gray-300 dark:hover:border-gray-700 pl-3 -ml-3"
            )}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Desktop rail. Hidden below xl, where the inline pieces below take over. */
export function BlogSidebar({
  slug,
  title,
  contentRef,
}: {
  slug: string;
  title: string;
  contentRef?: RefObject<HTMLElement | null>;
}) {
  const { headings, activeId } = useEssayHeadings(contentRef, slug);
  const headingTexts = useMemo(() => headings.map((h) => h.text), [headings]);

  return (
    <aside
      className="hidden xl:block xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:py-8"
      aria-label="Article sidebar"
    >
      <div className="space-y-4">
        <AskPanel slug={slug} title={title} headingTexts={headingTexts} />

        {headings.length > 0 && (
          <nav className="border border-border p-5" aria-label="Table of contents">
            <span className="label-mono mb-4 block">On this page</span>
            <ContentsList headings={headings} activeId={activeId} />
          </nav>
        )}
      </div>
    </aside>
  );
}

/**
 * Contents for narrow windows: a collapsed disclosure under the essay header.
 * The rail is xl-only, and below that the reader had no map at all.
 */
export function EssayContentsInline({
  contentRef,
  slug,
}: {
  contentRef?: RefObject<HTMLElement | null>;
  slug: string;
}) {
  const { headings, activeId } = useEssayHeadings(contentRef, slug);

  if (headings.length === 0) return null;

  return (
    <details className="mt-8 border-y border-border py-3 xl:hidden">
      <summary className="label-mono cursor-pointer list-none text-foreground marker:content-['']">
        On this page · {headings.length} sections
      </summary>
      <nav className="mt-3" aria-label="Table of contents">
        <ContentsList headings={headings} activeId={activeId} />
      </nav>
    </details>
  );
}

/** The Ask panel for narrow windows, placed after the essay's next-read links. */
export function EssayAskInline({
  slug,
  title,
  contentRef,
}: {
  slug: string;
  title: string;
  contentRef?: RefObject<HTMLElement | null>;
}) {
  const { headings } = useEssayHeadings(contentRef, slug);
  const headingTexts = useMemo(() => headings.map((h) => h.text), [headings]);

  return (
    <div className="mt-10 xl:hidden">
      <AskPanel slug={slug} title={title} headingTexts={headingTexts} />
    </div>
  );
}
