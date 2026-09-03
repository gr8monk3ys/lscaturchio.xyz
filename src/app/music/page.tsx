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
    <Container size="large">
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
      </div>
    </Container>
  );
}
