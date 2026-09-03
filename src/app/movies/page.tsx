import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { MoviesList } from "@/components/movies/MoviesList";

import {
  getLetterboxdStats,
  getFavoriteFilms,
  getTopRatedMovies,
  getReviewedFilms,
  getRecentWatches,
  getLetterboxdWatchlist,
} from "@/lib/letterboxd";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Movies",
  description:
    "Every film I've rated on Letterboxd, the four pinned to my profile, and the notes I wrote at the time.",
  path: "/movies",
});

export default function MoviesPage() {
  const stats = getLetterboxdStats();
  const favorites = getFavoriteFilms();
  const fiveStar = getTopRatedMovies();
  const reviewed = getReviewedFilms();
  const recentWatches = getRecentWatches(40);
  const watchlist = getLetterboxdWatchlist().slice(0, 40);

  return (
    <Container className="mt-16 lg:mt-32">
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
