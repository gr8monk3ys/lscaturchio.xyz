"use client";

import Link from "next/link";

// Hidden projects/experiments that aren't on the main portfolio
const HIDDEN_PROJECTS = [
  {
    name: "Vim Config",
    description: "My overly complicated Neovim configuration.",
    tech: ["Lua", "Neovim"],
    status: "Always WIP",
  },
];

// Easter egg hints for other hidden features
const EASTER_EGG_HINTS = [
  "Try the Konami code anywhere on the site...",
  "Check the browser console for a message",
  "There might be more secrets hiding in plain sight",
  "Some things are only visible in dark mode",
];

/**
 * Deliberately static. Every block on this page was an `initial={{ opacity: 0 }}`
 * framer-motion mount, and under `LazyMotion strict` that animation can be
 * missed entirely — leaving the whole page blank. Page content never mounts
 * hidden (DESIGN.md: the page is paper and does not move).
 */
export function SecretPageContent() {
  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            You Found the Secret Page!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to the hidden corner of my website. Here are some things that
            didn&apos;t quite make it to the main pages.
          </p>
        </div>

        {/* Hidden Projects */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🔬</span> Hidden Experiments
          </h2>
          <div className="grid gap-4">
            {HIDDEN_PROJECTS.map((project) => (
              <div
                key={project.name}
                className="bg-muted/30 border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {project.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Easter Egg Hints */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🥚</span> More Secrets?
          </h2>
          <div className="bg-muted/30 border border-border rounded-xl p-6">
            <p className="text-muted-foreground mb-4">
              This isn&apos;t the only hidden feature on the site. Here are some
              hints:
            </p>
            <ul className="space-y-2">
              {EASTER_EGG_HINTS.map((hint) => (
                <li key={hint} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">→</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Back to home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <span>←</span>
            <span>Back to the regular website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
