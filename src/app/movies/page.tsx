import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { MoviesGrid } from "@/components/movies/MoviesGrid";

import {
  getLetterboxdStats,
  getTopRatedMovies,
  getRecentWatches,
  getLetterboxdWatchlist,
} from "@/lib/letterboxd";

export const metadata = buildPageMetadata({
  title: "Movies",
  description: "Films I've watched and loved. Synced from my Letterboxd profile.",
  path: "/movies",
});

export default function MoviesPage() {
  // Fetch data server-side
  const stats = getLetterboxdStats();
  const topRated = getTopRatedMovies(24);
  const recentWatches = getRecentWatches(24);
  const watchlist = getLetterboxdWatchlist().slice(0, 12);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-5xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Watching</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Movies</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A collection of films that have inspired me, made me think, or just thoroughly entertained.
            Heavy on sci-fi and thought-provoking cinema. Synced from my{" "}
            <a
              href="https://letterboxd.com/gr8monk3ys/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Letterboxd profile
            </a>
            .
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <MoviesGrid
          stats={stats}
          topRated={topRated}
          recentWatches={recentWatches}
          watchlist={watchlist}
        />
      </div>
    </Container>
  );
}
