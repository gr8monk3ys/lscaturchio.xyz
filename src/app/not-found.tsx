import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";

/**
 * Without this, a 404 inherited the root layout's title, so a dead link's tab
 * and history entry were indistinguishable from the front door — the reader
 * could not tell from the tab strip which of their pages had failed.
 *
 * `robots: noindex` because a soft 404 in an index is worse than no entry.
 */
export const metadata: Metadata = {
  title: "This room is empty",
  description:
    "The page you came for was moved, renamed, or never hung here in the first place.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Container className="flex min-h-[72vh] items-center">
      <div className="w-full max-w-2xl">
        <span className="label-mono block">Gallery · Error 404</span>

        <h1 className="mt-5 text-display">
          This room is empty.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          The piece you came for was moved, renamed, or never hung here in the
          first place. It happens in a garden — things get pruned, paths get
          re-laid. Nothing&apos;s broken; you&apos;ve just wandered into a wall.
        </p>

        <hr className="gallery-rule my-8" />

        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3" aria-label="Recover from 404">
          <Link
            href="/"
            className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            ← Back to the entrance
          </Link>
          <Link
            href="/blog"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Browse the writing
          </Link>
          <Link
            href="/chat"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Ask the site where it went
          </Link>
        </nav>
      </div>
    </Container>
  );
}
