import Link from "next/link";

import { Container } from "@/components/Container";

export const metadata = {
  title: "Offline",
  description: "You are currently offline",
};

/**
 * Composed like `not-found.tsx`: wall label, one Fraunces line, a hairline,
 * and a mono row of doorways. It used to be a centred stack with a 96px round
 * icon well and Title Case buttons — the shape of every 404 template, on the
 * one page a reader reaches when the network has already failed them.
 */
export default function OfflinePage() {
  return (
    <Container className="flex min-h-[72vh] items-center">
      <div className="w-full max-w-2xl">
        <span className="label-mono block">Gallery · No connection</span>

        <h1 className="mt-5 text-display">The lights are still on.</h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Your connection dropped, not the site. Pages you have already read are
          cached and will open; anything new has to wait. Nothing needs doing —
          when the network comes back, so does the rest of this.
        </p>

        <hr className="gallery-rule my-8" />

        <nav
          className="flex flex-wrap items-center gap-x-8 gap-y-3"
          aria-label="Pages that may still be cached"
        >
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
        </nav>
      </div>
    </Container>
  );
}
