"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from '@/lib/motion';
import { List, Sparkles, MessageSquareText, ArrowRight } from "lucide-react";
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
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="hidden xl:block xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:py-8"
      aria-label="Article sidebar"
    >
      <div className="space-y-4">
        {/* Ask about this post */}
        <div className="rounded-2xl neu-flat p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Ask about this post</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Ask me a question grounded in this article.
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
                className="neu-button rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
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
                "w-full resize-none rounded-xl px-3 py-2 text-sm",
                "neu-input text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToChat(question.trim() || `What is my post \"${title}\" about?`)}
              className="cta-primary rounded-xl px-4 py-2 text-sm gap-2 inline-flex items-center"
            >
              <MessageSquareText className="h-4 w-4" />
              Ask in Chat
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              Uses RAG
            </span>
          </div>
        </div>

        {/* Table of contents */}
        {headings.length > 0 && (
          <nav className="rounded-2xl neu-flat p-6" aria-label="Table of contents">
            <div className="flex items-center gap-2 mb-4">
              <List className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">On this page</h2>
            </div>
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
    </motion.aside>
  );
}
