import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { MoviesList } from "@/components/movies/MoviesList";
import { getLetterboxdLibrary } from "@/lib/letterboxd";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Movies",
  description:
    "Every film I've rated on Letterboxd, the four pinned to my profile, and the notes I wrote at the time.",
  path: "/movies",
});

export default function MoviesPage() {
  const library = getLetterboxdLibrary();
  const stats = library.stats();
  const favorites = library.favorites();
  const fiveStar = library.topRated();
  const reviewed = library.reviewed();
  const recentWatches = library.recentWatches(40);
  const watchlist = library.watchlist(40);

  return (
    <Container className="mt-4">
      <div className="max-w-4xl mx-auto">
        {/* Header — gallery masthead */}
        <PageHead
          className="mb-14"
          kicker="Garden · Watching"
          title="Movies"
          blurb={
            <>
              Synced from my{" "}
              <a
                href="https://letterboxd.com/gr8monk3ys/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Letterboxd
              </a>
              . The five-star list is the short one. The notes attached to some of these were
              written for nobody in particular, usually right after the credits, and they read
              like it.
            </>
          }
        />

        <MoviesList
          stats={stats}
          favorites={favorites}
          fiveStar={fiveStar}
          reviewed={reviewed}
          recentWatches={recentWatches}
          watchlist={watchlist}
        />
      </div>
    </Container>
  );
}
