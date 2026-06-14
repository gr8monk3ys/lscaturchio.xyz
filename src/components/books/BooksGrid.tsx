"use client";

import { useState } from "react";
import { m, AnimatePresence } from '@/lib/motion';
import Link from "next/link";
import { Star, BookOpen, Clock, Trophy, Book, ListVideo } from "lucide-react";
import type { GoodreadsBook, GoodreadsStats } from "@/lib/goodreads";

interface BooksGridProps {
  stats: GoodreadsStats;
  currentlyReading: GoodreadsBook[];
  recentlyRead: GoodreadsBook[];
  toRead: GoodreadsBook[];
  topRated: GoodreadsBook[];
}

const tabs = [
  { id: "currently-reading", label: "Reading Now", icon: BookOpen },
  { id: "top-rated", label: "Top Rated", icon: Trophy },
  { id: "recently-read", label: "Recently Read", icon: Clock },
  { id: "to-read", label: "Want to Read", icon: ListVideo },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating ? "text-primary fill-primary" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function BookCover({ book }: { book: GoodreadsBook }) {
  // OpenLibrary serves covers by ISBN; `default=false` makes it 404 when no
  // cover exists, so onError falls back to the placeholder instead of a blank.
  const [failed, setFailed] = useState(false);
  const coverUrl = book.isbn
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg?default=false`
    : null;

  if (!coverUrl || failed) {
    return <Book className="h-12 w-12 text-muted-foreground/30" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external covers, no loader benefit
    <img
      src={coverUrl}
      alt={`Cover of ${book.title}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function BookCard({ book, index }: { book: GoodreadsBook; index: number }) {
  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        href={book.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative mb-3 flex aspect-2/3 items-center justify-center overflow-hidden border border-border bg-muted">
          <BookCover book={book} />
          {book.shelf === "currently-reading" && (
            <span className="label-mono absolute top-2 right-2 text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
              Reading
            </span>
          )}
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
          {book.title}
        </h3>
        <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">
          {book.author}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-1">
          {book.rating && <RatingStars rating={book.rating} />}
          {book.yearPublished && (
            <span className="label-mono">{book.yearPublished}</span>
          )}
        </div>
      </Link>
    </m.div>
  );
}

export function BooksGrid({ stats, currentlyReading, recentlyRead, toRead, topRated }: BooksGridProps) {
  const [activeTab, setActiveTab] = useState("currently-reading");

  const getActiveBooks = () => {
    switch (activeTab) {
      case "currently-reading":
        return currentlyReading;
      case "top-rated":
        return topRated;
      case "recently-read":
        return recentlyRead;
      case "to-read":
        return toRead;
      default:
        return currentlyReading;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats — hairline-divided wall-label panel */}
      <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
        {[
          { value: stats.booksRead, label: "Books Read" },
          { value: stats.currentlyReading, label: "Currently Reading" },
          { value: stats.fiveStarBooks, label: "5-Star Books" },
          { value: stats.totalPages.toLocaleString(), label: "Pages Read" },
        ].map((stat) => (
          <div key={stat.label} className="px-5 py-6">
            <p className="font-display text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="label-mono mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`label-mono flex items-center gap-2 border px-4 py-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {getActiveBooks().map((book, index) => (
            <BookCard key={`${book.id}-${book.title}`} book={book} index={index} />
          ))}
        </m.div>
      </AnimatePresence>

      {/* Empty state */}
      {getActiveBooks().length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No books found in this category.</p>
        </div>
      )}
    </div>
  );
}
