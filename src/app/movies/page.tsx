import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { MoviesGrid } from "@/components/movies/MoviesGrid";
import { Metadata } from "next";
import { Film } from "lucide-react";
import {
  getLetterboxdStats,
  getTopRatedMovies,
  getRecentWatches,
  getLetterboxdWatchlist,
} from "@/lib/letterboxd";

export const metadata: Metadata = {
  title: "Movies | Lorenzo Scaturchio",
  description: "Films I've watched and loved. Synced from my Letterboxd profile.",
};

export default function MoviesPage() {
  // Fetch data server-side
  const stats = getLetterboxdStats();
  const topRated = getTopRatedMovies(24);
  const recentWatches = getRecentWatches(24);
  const watchlist = getLetterboxdWatchlist().slice(0, 12);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Movies</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            A collection of films that have inspired me, made me think, or just thoroughly entertained.
            Heavy on sci-fi and thought-provoking cinema. Synced from my{" "}
            <a
              href="https://letterboxd.com/gr8monk3ys/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Letterboxd profile
            </a>
            .
          </Paragraph>
        </div>

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
