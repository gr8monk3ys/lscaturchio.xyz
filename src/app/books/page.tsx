import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { BooksList } from "@/components/books/BooksList";
import {
  getGoodreadsStats,
  getCurrentlyReading,
  getReadBooks,
  getToReadBooks,
  getTopRatedBooks,
  getCustomShelves,
} from "@/lib/goodreads";

export const metadata = buildPageMetadata({
  title: "Books",
  description:
    "What I'm reading, what I finished, and the three books I gave full marks. Synced from Goodreads.",
  path: "/books",
});

export default function BooksPage() {
  const stats = getGoodreadsStats();
  const perfectScores = getTopRatedBooks();
  const currentlyReading = getCurrentlyReading();
  const recentlyRead = getReadBooks(40);
  const toRead = getToReadBooks(40);
  const shelves = getCustomShelves();

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-14">
          <span className="label-mono block">Garden · Reading</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Books</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Synced from{" "}
            <a
              href="https://www.goodreads.com/gr8monk3ys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Goodreads
            </a>
            . The queue is roughly five times the size of the finished pile, which is the
            honest state of most people&rsquo;s reading and worth showing rather than hiding.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

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
