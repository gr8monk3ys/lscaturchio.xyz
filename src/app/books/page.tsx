import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { BooksGrid } from "@/components/books/BooksGrid";
import { Metadata } from "next";
import { Book } from "lucide-react";
import {
  getGoodreadsStats,
  getCurrentlyReading,
  getReadBooks,
  getToReadBooks,
  getTopRatedBooks,
} from "@/lib/goodreads";

export const metadata: Metadata = {
  title: "Books | Lorenzo Scaturchio",
  description: "Books I'm reading, have read, and want to read. Synced from my Goodreads profile.",
};

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
        {/* Header */}
        <div className="mb-12 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Books</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            A curated collection of books that have shaped my thinking. From technical deep dives
            to philosophy and science fiction. Synced from my{" "}
            <a
              href="https://www.goodreads.com/gr8monk3ys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Goodreads profile
            </a>
            .
          </Paragraph>
        </div>

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
