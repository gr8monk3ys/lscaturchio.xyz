"use client";

import { useState } from "react";
import { m, AnimatePresence } from "@/lib/motion";
import Link from "next/link";
import { BookOpen, Clock, ListVideo } from "lucide-react";
import type { GoodreadsBook, GoodreadsShelf, GoodreadsStats } from "@/lib/goodreads";

interface BooksListProps {
  stats: GoodreadsStats;
  perfectScores: GoodreadsBook[];
  currentlyReading: GoodreadsBook[];
  recentlyRead: GoodreadsBook[];
  toRead: GoodreadsBook[];
  shelves: GoodreadsShelf[];
}

const tabs = [
  { id: "currently-reading", label: "Reading Now", icon: BookOpen },
  { id: "recently-read", label: "Finished", icon: Clock },
  { id: "to-read", label: "Want to Read", icon: ListVideo },
];

function formatStars(rating: number): string {
  return "★".repeat(rating);
}

/** Homer needs this: negative publication years are BCE, not a rendering bug. */
function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : String(year);
}

/** Small counts read better as words: "Four books", not "4 books". */
function spellCount(n: number): string {
  const words = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  return words[n] ?? String(n);
}

/** A book I gave full marks, as a numbered plate. */
function PerfectScore({ book, index }: { book: GoodreadsBook; index: number }) {
  return (
    <li className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <div className="flex gap-5 sm:gap-8">
        <span className="label-mono shrink-0 pt-2 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={book.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-wrap items-baseline gap-x-3"
          >
            <h3 className="font-display text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary md:text-3xl">
              {book.title}
            </h3>
            {book.yearPublished ? (
              <span className="label-mono">{formatYear(book.yearPublished)}</span>
            ) : null}
          </Link>
          <p className="mt-2 text-muted-foreground">{book.author}</p>
          {book.bookshelves.length > 0 ? (
            <p className="label-mono mt-3">{book.bookshelves.join(" · ").replace(/-/g, " ")}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function BookRow({ book, index }: { book: GoodreadsBook; index: number }) {
  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.3) }}
      className="border-t border-border py-5"
    >
      <div className="flex flex-col gap-x-6 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
        <Link
          href={book.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group min-w-0 flex-1"
        >
          <h3 className="text-base font-medium transition-colors group-hover:text-primary">
            {book.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{book.author}</p>
        </Link>

        <div className="flex shrink-0 items-baseline gap-4">
          {book.rating ? (
            <span
              className="text-sm text-primary"
              aria-label={`${book.rating} out of 5 stars`}
            >
              {formatStars(book.rating)}
            </span>
          ) : null}
          {book.pages ? (
            <span className="label-mono tabular-nums">{book.pages} pp</span>
          ) : null}
        </div>
      </div>
    </m.li>
  );
}

export function BooksList({
  stats,
  perfectScores,
  currentlyReading,
  recentlyRead,
  toRead,
  shelves,
}: BooksListProps) {
  const [activeTab, setActiveTab] = useState("currently-reading");

  const listsById: Record<string, GoodreadsBook[]> = {
    "currently-reading": currentlyReading,
    "recently-read": recentlyRead,
    "to-read": toRead,
  };
  const activeBooks = listsById[activeTab] ?? currentlyReading;

  return (
    <div className="space-y-16">
      {perfectScores.length > 0 ? (
        <section aria-labelledby="perfect-heading">
          <div className="mb-8">
            <h2 id="perfect-heading" className="label-mono">
              Full marks
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {/* Derived, not hardcoded: this said "Three books" until a fourth
                  five-star arrived with a data refresh and made it a lie. */}
              {spellCount(perfectScores.length)} book{perfectScores.length === 1 ? "" : "s"} out
              of everything I have finished. I am stingy with the fifth star on purpose; it is
              the only way the rating means anything.
            </p>
          </div>
          <ol>
            {perfectScores.map((book, index) => (
              <PerfectScore key={book.id} book={book} index={index} />
            ))}
          </ol>
        </section>
      ) : null}

      {/* Stats — hairline-divided wall-label panel */}
      <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
        {[
          { value: stats.booksRead, label: "Finished" },
          { value: stats.currentlyReading, label: "In Progress" },
          { value: stats.toRead.toLocaleString(), label: "Queued" },
          { value: stats.totalPages.toLocaleString(), label: "Pages Read" },
        ].map((stat) => (
          <div key={stat.label} className="px-5 py-6">
            <p className="font-display text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="label-mono mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {shelves.length > 0 ? (
        <section aria-labelledby="shelves-heading">
          <div className="mb-8">
            <h2 id="shelves-heading" className="label-mono">
              Shelves
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Goodreads gives you three shelves and calls them read, reading, and want to read.
              These are the ones I made up, which are the only ones that say anything.
            </p>
          </div>
          <dl className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {shelves.map((shelf) => (
              <div key={shelf.name} className="bg-background p-6">
                <dt className="label-mono">{shelf.label}</dt>
                <dd className="mt-3 space-y-1.5">
                  {shelf.books.map((book) => (
                    <Link
                      key={book.id}
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm transition-colors hover:text-primary"
                    >
                      {book.title}
                      <span className="text-muted-foreground"> — {book.author}</span>
                    </Link>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section aria-labelledby="library-heading">
        <h2 id="library-heading" className="sr-only">
          Library
        </h2>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = listsById[tab.id]?.length ?? 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                className={`label-mono flex items-center gap-2 border px-4 py-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                <span className="tabular-nums opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <m.ul
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 border-b border-border"
          >
            {activeBooks.map((book, index) => (
              <BookRow key={book.id} book={book} index={index} />
            ))}
          </m.ul>
        </AnimatePresence>

        {activeBooks.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Nothing in this list yet.</p>
        ) : null}
      </section>
    </div>
  );
}
