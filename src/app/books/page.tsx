import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { BooksList } from "@/components/books/BooksList";
import {
  getGoodreadsStats,
  getCurrentlyReading,
  getReadBooks,
  getToReadBooks,
  getTopRatedBooks,
  getCustomShelves,
} from "@/lib/goodreads";
import { PageHead } from "@/components/ui/page-head";
import { spellCountLower, pluralize } from "@/lib/spell-count";

/**
 * Derived, not typed. This description said "the three books I gave full marks"
 * while the page body four lines down correctly rendered "Six books" — the same
 * rot `BooksList` had already been fixed for, repeated in the one string no test
 * renders and no drift check read.
 */
export function generateMetadata() {
  const perfectScores = getTopRatedBooks().length;

  return buildPageMetadata({
    title: "Books",
    description: `What I'm reading, what I finished, and the ${spellCountLower(
      perfectScores
    )} ${pluralize(perfectScores, "book")} I gave full marks. Synced from Goodreads.`,
    path: "/books",
  });
}

export default function BooksPage() {
  const stats = getGoodreadsStats();
  const perfectScores = getTopRatedBooks();
  const currentlyReading = getCurrentlyReading();
  const recentlyRead = getReadBooks(40);
  const toRead = getToReadBooks(40);
  const shelves = getCustomShelves();
  // Also derived. "roughly five times" was true when it was typed (4.7x) and
  // would have stayed on the page as the shelves moved underneath it.
  const queueRatio = stats.booksRead > 0 ? Math.round(stats.toRead / stats.booksRead) : 0;

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header — gallery masthead */}
        <PageHead
          className="mb-14"
          kicker="Garden · Reading"
          title="Books"
          blurb={
            <>
              Synced from{" "}
              <a
                href="https://www.goodreads.com/gr8monk3ys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Goodreads
              </a>
              . The queue is roughly {spellCountLower(queueRatio)} times the size of the
              finished pile, which is the honest state of most people&rsquo;s reading and
              worth showing rather than hiding.
            </>
          }
        />

        <BooksList
          stats={stats}
          perfectScores={perfectScores}
          currentlyReading={currentlyReading}
          recentlyRead={recentlyRead}
          toRead={toRead}
          shelves={shelves}
        />
      </div>
    </Container>
  );
}
