"use client";

import Link from "next/link";

import { Container } from "@/components/Container";
import { PageHead } from "@/components/ui/page-head";

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
  "Try the Konami code anywhere on the site.",
  "Check the browser console for a message.",
  "Some things are only visible in dark mode.",
];

/**
 * Deliberately static. Every block on this page was an `initial={{ opacity: 0 }}`
 * framer-motion mount, and under `LazyMotion strict` that animation can be
 * missed entirely — leaving the whole page blank. Page content never mounts
 * hidden (DESIGN.md: the page is paper and does not move).
 *
 * It is also a room in the same gallery. It used to be the last page still
 * wearing the pre-redesign template — centred emoji headings, Title Case, a
 * hand-rolled `text-4xl md:text-5xl` — which is a strange thing to hide behind
 * an easter egg: the reward for finding it was the old site.
 */
export function SecretPageContent() {
  return (
    <Container className="mt-16 lg:mt-32">
      <PageHead
        className="mb-14"
        kicker="Gallery · Back room"
        title="You found the back room"
        blurb="Nothing here made it to the main pages, which is the whole reason it is here."
      />

      <section className="mb-14">
        <h2 className="text-section-title">Hidden experiments</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {HIDDEN_PROJECTS.map((project) => (
            <li key={project.name} className="py-5">
              <div className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span>{project.status}</span>
                <span aria-hidden className="text-foreground/25">·</span>
                <span>{project.tech.join(" · ")}</span>
              </div>
              <h3 className="mt-2 text-card-title">{project.name}</h3>
              <p className="mt-1 text-muted-foreground">{project.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-14">
        <h2 className="text-section-title">More secrets</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          This isn&apos;t the only hidden feature on the site. Three hints:
        </p>
        <ul className="mt-6 max-w-2xl space-y-3">
          {EASTER_EGG_HINTS.map((hint) => (
            <li key={hint} className="flex gap-3">
              <span aria-hidden className="text-primary">→</span>
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      </section>

      <hr className="gallery-rule" />

      <nav className="mt-8" aria-label="Leave the back room">
        <Link
          href="/"
          className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          ← Back to the regular website
        </Link>
      </nav>
    </Container>
  );
}
