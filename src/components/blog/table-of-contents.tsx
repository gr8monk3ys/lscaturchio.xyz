"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from the page
    const elements = Array.from(
      document.querySelectorAll("article h2, article h3")
    );

    const headingElements: Heading[] = elements.map((element) => {
      const level = parseInt(element.tagName[1]);
      const text = element.textContent || "";

      // Create ID from heading text if it doesn't have one
      let id = element.id;
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        element.id = id;
      }

      return { id, text, level };
    });

    setHeadings(headingElements);

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

  if (headings.length === 0) {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="hidden xl:block xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:py-8"
      aria-label="Table of contents"
    >
      <div className="rounded-2xl neu-flat p-6">
        <div className="flex items-center gap-2 mb-4">
          <List className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">On this page</h2>
        </div>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`
                ${heading.level === 3 ? "pl-4" : ""}
                transition-colors
              `}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className={`
                  block py-1 text-left transition-colors hover:text-primary
                  ${
                    activeId === heading.id
                      ? "text-primary font-medium border-l-2 border-primary pl-3 -ml-3"
                      : "text-muted-foreground hover:border-l-2 hover:border-gray-300 dark:hover:border-gray-700 pl-3 -ml-3"
                  }
                `}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}
