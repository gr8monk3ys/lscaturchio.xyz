"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
            star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function BookCard({ book, index }: { book: GoodreadsBook; index: number }) {
  return (
    <motion.div
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
        <div className="neu-card p-3 h-full hover:shadow-lg transition-shadow">
          <div className="relative aspect-[2/3] mb-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <Book className="h-12 w-12 text-muted-foreground/30" />
            {book.shelf === "currently-reading" && (
              <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded">
                Reading
              </span>
            )}
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {book.author}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-1">
            {book.rating && <RatingStars rating={book.rating} />}
            {book.yearPublished && (
              <span className="text-xs text-muted-foreground">
                {book.yearPublished}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.booksRead}</p>
          <p className="text-sm text-muted-foreground">Books Read</p>
        </div>
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.currentlyReading}</p>
          <p className="text-sm text-muted-foreground">Currently Reading</p>
        </div>
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.fiveStarBooks}</p>
          <p className="text-sm text-muted-foreground">5-Star Books</p>
        </div>
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalPages.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Pages Read</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`neu-button px-4 py-2 flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "neu-pressed text-primary"
                  : "hover:text-primary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {getActiveBooks().map((book, index) => (
            <BookCard key={`${book.id}-${book.title}`} book={book} index={index} />
          ))}
        </motion.div>
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
