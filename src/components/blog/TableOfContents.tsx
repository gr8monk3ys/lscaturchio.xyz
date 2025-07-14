// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect, useRef } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentSelector: string;
  maxDepth?: number;
  minItems?: number;
  className?: string;
}

export function TableOfContents({
  contentSelector,
  maxDepth = 3,
  minItems = 2,
  className = "",
}: TableOfContentsProps): JSX.Element | null {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Extract headings from content
  useEffect(() => {
    const content = document.querySelector(contentSelector);
    if (!content) return;

    // Find all headings in the content area
    const elements = Array.from(
      content.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).filter((element) => {
      const level = parseInt(element.tagName.substring(1));
      return level <= maxDepth;
    });

    // If not enough headings, don't show TOC
    if (elements.length < minItems) {
      setHeadings([]);
      return;
    }

    // Process headings
    const items = elements.map((element) => {
      // Ensure heading has an ID
      if (!element.id) {
        // Generate an ID based on the text content
        const id = element.textContent
          ?.toLowerCase()
          .replace(/[^\w]+/g, "-")
          .replace(/(^-|-$)/g, "");
        element.id = id || `heading-${Math.random().toString(36).substring(2, 9)}`;
      }

      return {
        id: element.id,
        text: element.textContent || "",
        level: parseInt(element.tagName.substring(1)),
      };
    });

    setHeadings(items);

    // Set up intersection observer to highlight active section
    const handleObserver: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "0px 0px -80% 0px",
      threshold: 0.1,
    });

    // Observe all heading elements
    elements.forEach((element) => {
      observer.current?.observe(element);
    });

    return () => {
      // Clean up observer
      if (observer.current) {
        elements.forEach((element) => {
          observer.current?.unobserve(element);
        });
      }
    };
  }, [contentSelector, maxDepth, minItems]);

  // Scroll to heading when clicked
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  // If no headings found, don't render
  if (headings.length < minItems) {
    return null;
  }

  return (
    <div className={`rounded-lg neu-card bg-stone-50 dark:bg-stone-800 p-0 border-none shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all ${className}`}>
      <div
        className="flex cursor-pointer items-center justify-between p-4 font-medium transition-colors hover:bg-stone-100 dark:hover:bg-stone-700/50 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <List className="mr-2 h-4 w-4" />
          <span>Table of Contents</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>

      {isExpanded && (
        <nav className="max-h-[70vh] overflow-y-auto p-4 pt-0 border-t border-stone-100 dark:border-stone-700">
          <ul className="space-y-1 text-sm">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{
                  paddingLeft: `${(heading.level - 1) * 0.75}rem`,
                }}
              >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(heading.id);
                  }}
                  className={`block rounded-md py-1 px-2 transition-all hover:bg-stone-100 dark:hover:bg-stone-700/50 hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.5)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] ${
                    activeId === heading.id
                      ? "font-medium text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-700/50 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.5)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)]"
                      : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
