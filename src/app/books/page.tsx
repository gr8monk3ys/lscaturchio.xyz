import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { BooksGrid } from "@/components/books/BooksGrid";
import {
  getGoodreadsStats,
  getCurrentlyReading,
  getReadBooks,
  getToReadBooks,
  getTopRatedBooks,
} from "@/lib/goodreads";

export const metadata = buildPageMetadata({
  title: "Books",
  description: "Books I'm reading, have read, and want to read. Synced from my Goodreads profile.",
  path: "/books",
});

export default function BooksPage() {
  // Fetch data server-side
  const stats = getGoodreadsStats();
  const currentlyReading = getCurrentlyReading();
  const recentlyRead = getReadBooks(24);
  const toRead = getToReadBooks(12);
  const topRated = getTopRatedBooks(24);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-5xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Reading</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Books</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A curated collection of books that have shaped my thinking. From technical deep dives
            to philosophy and science fiction. Synced from my{" "}
            <a
              href="https://www.goodreads.com/gr8monk3ys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Goodreads profile
            </a>
            .
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <BooksGrid
          stats={stats}
          currentlyReading={currentlyReading}
          recentlyRead={recentlyRead}
          toRead={toRead}
          topRated={topRated}
        />
      </div>
    </Container>
  );
}
