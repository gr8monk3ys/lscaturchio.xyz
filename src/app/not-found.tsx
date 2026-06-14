import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[72vh] items-center">
      <div className="w-full max-w-2xl">
        <span className="label-mono block">Gallery · Error 404</span>

        <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
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
            className="label-mono text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            ← Back to the entrance
          </Link>
          <Link
            href="/blog"
            className="label-mono text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Browse the writing
          </Link>
          <Link
            href="/chat"
            className="label-mono text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Ask the site where it went
          </Link>
        </nav>
      </div>
    </Container>
  );
}
