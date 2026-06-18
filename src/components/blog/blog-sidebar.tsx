"use client";

import { useEffect, useMemo, useState } from "react";
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

export function BlogSidebar({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();

  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");

  useEffect(() => {
    // Extract headings from the page
    const elements = Array.from(document.querySelectorAll("article h2, article h3"));

    const headingElements: Heading[] = elements.map((element) => {
      const level = parseInt(element.tagName[1]);
      const text = element.textContent || "";

      let id = element.id;
      if (!id) {
        id = slugify(text);
        element.id = id;
      }

      return { id, text, level };
    });

    setHeadings(headingElements);

    if (elements.length === 0) return;

    // Set up intersection observer for active heading
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
  }, []);

  const headingTexts = useMemo(() => headings.map((h) => h.text), [headings]);

  const goToChat = (q: string) => {
    const url = new URL("/chat", window.location.origin);
    url.searchParams.set("contextSlug", slug);
    url.searchParams.set("contextTitle", title);
    url.searchParams.set("q", q);
    router.push(`${url.pathname}${url.search}`);
  };

  return (
    <aside
      className="hidden xl:block xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:py-8"
      aria-label="Article sidebar"
    >
      <div className="space-y-4">
        {/* Ask about this post */}
        <div className="border border-border p-5">
          <span className="label-mono block">Ask · RAG</span>
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
                onClick={() => {
                  const next = p.prompt(title, headingTexts);
                  setQuestion(next);
                }}
                className="label-mono border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="sr-only" htmlFor="ask-question">
              Question
            </label>
            <textarea
              id="ask-question"
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

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToChat(question.trim() || `What is my post \"${title}\" about?`)}
              className="cta-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
            >
              <MessageSquareText className="h-4 w-4" />
              Ask in Chat
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="label-mono">Uses RAG</span>
          </div>
        </div>

        {/* Table of contents */}
        {headings.length > 0 && (
          <nav className="border border-border p-5" aria-label="Table of contents">
            <span className="label-mono mb-4 block">On this page</span>
            <ul className="space-y-2 text-sm">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  className={cn(heading.level === 3 ? "pl-4" : "", "transition-colors")}
                >
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById(heading.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
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
          </nav>
        )}
      </div>
    </aside>
  );
}
