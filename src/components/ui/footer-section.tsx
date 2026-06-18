import Link from "next/link";
import { Rss, Send, Pizza } from "lucide-react";

import { footerColumns } from "@/constants/navlinks";
import { socials } from "@/constants/socials";

const iconLinkClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl neu-button text-foreground transition-all duration-200 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const utilityLinkClass =
  "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary";

/**
 * The footer is the site map: the header stays slim, so every page in the
 * garden gets its doorway here instead (see
 * docs/superpowers/specs/2026-06-11-nav-footer-redesign-design.md).
 */
function Footer() {
  const substackUrl =
    socials.find((social) => social.label === "Substack")?.href ||
    "https://substack.com/@gr8monk3ys";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/60 bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          {/* Colophon */}
          <div className="max-w-sm space-y-5">
            <h2 className="text-2xl font-bold tracking-tight">Lorenzo Scaturchio</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI systems by day, essays about the world they land in the rest of
              the time. Built with Next.js and Neon — a garden that keeps
              growing.
            </p>
            <p className="text-sm">
              <a
                href="mailto:lorenzosca7@protonmail.ch"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                lorenzosca7@protonmail.ch
              </a>
            </p>
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel={"relMe" in social && social.relMe ? "me noopener noreferrer" : "noopener noreferrer"}
                  className={iconLinkClass}
                  title={social.label}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/api/rss" target="_blank" rel="noopener noreferrer" className={utilityLinkClass}>
                <Rss className="h-4 w-4" />
                RSS
              </Link>
              <a href={substackUrl} target="_blank" rel="noopener noreferrer" className={utilityLinkClass}>
                <Send className="h-4 w-4" />
                Newsletter
              </a>
              <a
                href="https://www.buymeacoffee.com/lorenzoscak"
                target="_blank"
                rel="noopener noreferrer"
                className={utilityLinkClass}
              >
                <Pizza className="h-4 w-4" />
                Buy me a pizza
              </a>
            </div>
          </div>

          {/* Site map */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <nav key={column.name} aria-label={column.name}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {column.name}
                </h3>
                <ul className="space-y-2 text-sm">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={false}
                        className="transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-center md:flex-row">
          <p className="label-mono">
            © {currentYear} · Los Angeles · A garden, not a homepage
          </p>
          <nav className="flex gap-5">
            <Link href="/stats" prefetch={false} className="label-mono transition-colors hover:text-primary">
              Stats
            </Link>
            <Link href="/privacy-policy" prefetch={false} className="label-mono transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms-of-service" prefetch={false} className="label-mono transition-colors hover:text-primary">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
