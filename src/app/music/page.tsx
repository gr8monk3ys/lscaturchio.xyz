import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { Music as MusicIcon } from "lucide-react";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Music",
  description:
    "Indie folk with industrial textures, made at home. Recordings arrive when they are worth hearing.",
  path: "/music",
});

/**
 * Deliberately empty until there are real recordings. The photography page set
 * the precedent: an honest bare wall beats a borrowed one, and a fabricated
 * track list would be worse than silence.
 */
export default function MusicPage() {
  return (
    <Container size="wide">
      <div className="py-10">
        <PageHead
          kicker="Garden · Music"
          title="Music"
          blurb={
            <>
              Indie folk with industrial textures — acoustic instruments run through
              things that were not built for them. Made at home, mostly late, mostly
              for me.
            </>
          }
        />

        <div className="mt-10 border-y border-border py-20 text-center">
          <MusicIcon
            className="mx-auto mb-6 h-10 w-10 text-muted-foreground/40"
            aria-hidden="true"
          />
          <p className="label-mono">Nothing released yet</p>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            There are demos. There is not yet anything I would ask someone to sit
            through. When that changes it will be here — an empty page beats a
            padded one.
          </p>
        </div>

        {/* A browser pass counted zero interactive controls inside <main> on
            this page and on /photos: the empty wall is deliberate, the dead end
            was not. The 404 and /offline pages both close the same way — a
            gallery rule, then a mono row of doorways — and the garden is the
            room these two hang in. */}
        <hr className="gallery-rule my-10" />

        <nav
          className="flex flex-wrap items-center gap-x-8 gap-y-3"
          aria-label="Elsewhere in the garden"
        >
          <Link
            href="/garden"
            className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            ← Back to the garden
          </Link>
          <Link
            href="/now"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            What I am making instead
          </Link>
          <Link
            href="/about"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Albums I keep going back to
          </Link>
        </nav>
      </div>
    </Container>
  );
}
