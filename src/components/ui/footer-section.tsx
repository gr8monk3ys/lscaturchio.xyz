import Link from "next/link";
import { Rss, Send, Pizza } from "lucide-react";

import { footerColumns } from "@/constants/navlinks";
import { socials } from "@/constants/socials";

const iconLinkClass =
  "inline-flex h-10 w-10 items-center justify-center border border-rule text-foreground transition-colors duration-200 hover:border-primary hover:text-primary";
/** `min-h-11` on phones: this row measured 20px tall against WCAG 2.5.8's
 *  24px floor. The site map links below already carry `min-h-6`. */
const utilityLinkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary";

/**
 * The footer is the site map: the header stays slim, so every page in the
 * garden gets its doorway here instead.
 */
function Footer() {
  const substackUrl =
    socials.find((social) => social.label === "Substack")?.href ||
    "https://substack.com/@gr8monk3ys";
  const currentYear = new Date().getFullYear();

  return (
    /* `-mt-px`: where the page above ends on its own ink rule (the home
       plates do), this one lands on it instead of beside it. */
    <footer className="relative -mt-px border-t border-rule bg-background text-foreground transition-colors duration-300">
      {/* One ruled row the width of the viewport: the colophon, then a cell
          per site-map column. Two-up on a phone, with the colophon across. */}
      <div className="plate-grid grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
        {/* Colophon */}
        <div className="plate-cell col-span-2 space-y-5 py-8 lg:col-span-1">
          {/* `text-card-title`, not `text-section-title`. The site name in
              the footer rendered at 34.56px, larger than the content `h2`s
              inside an essay at 30px — so the loudest heading on a page
              about an idea was the author's name at the bottom of it. Same
              rank, quieter type: chrome should not outweigh the thing it
              frames. */}
          <h2 className="text-card-title">Lorenzo Scaturchio</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            AI systems by day, essays about the world they land in the rest of
            the time. Built with Next.js and Neon — and rebuilt often.
          </p>
          <p className="text-sm">
            <a
              href="mailto:lorenzosca7@protonmail.ch"
              className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-primary"
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
                <social.icon className="h-4 w-4" aria-hidden="true" />
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
        {footerColumns.map((column) => (
          <nav key={column.name} aria-label={column.name} className="plate-cell py-8">
            <h3 className="label-mono mb-3 block">
              {column.name}
            </h3>
            <ul className="space-y-0.5 text-sm">
              {column.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="ink-underline label-link inline-flex min-h-11 items-center py-1 transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="plate-cell flex flex-col items-center justify-between gap-4 border-t border-rule text-center md:flex-row">
        <p className="label-mono">
          © {currentYear} · Los Angeles · A garden, not a homepage
        </p>
        {/* Named, like the other eight landmarks on the page. A landmark
            list that reads Primary, Writing, Work, Garden, About,
            Breadcrumb, Table of contents, Filter by stage — and then
            `(unnamed)` — makes the reader guess at the one thing it did not
            bother to label. */}
        <nav aria-label="Site and legal" className="flex gap-4">
          <Link
            href="/stats"
            prefetch={false}
            className="label-mono label-link ink-underline inline-flex items-center px-1 transition-colors hover:text-primary"
          >
            Stats
          </Link>
          <Link
            href="/privacy-policy"
            prefetch={false}
            className="label-mono label-link ink-underline inline-flex items-center px-1 transition-colors hover:text-primary"
          >
            Privacy policy
          </Link>
          <Link
            href="/terms-of-service"
            prefetch={false}
            className="label-mono label-link ink-underline inline-flex items-center px-1 transition-colors hover:text-primary"
          >
            Terms of service
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export { Footer };
