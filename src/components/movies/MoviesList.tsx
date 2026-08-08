"use client";

import { useState } from "react";
import { m, AnimatePresence } from "@/lib/motion";
import Link from "next/link";
import { Clock, ListVideo, PenLine, Trophy } from "lucide-react";
import type { LetterboxdMovie, LetterboxdStats } from "@/lib/letterboxd";

interface MoviesListProps {
  stats: LetterboxdStats;
  favorites: LetterboxdMovie[];
  fiveStar: LetterboxdMovie[];
  reviewed: LetterboxdMovie[];
  recentWatches: LetterboxdMovie[];
  watchlist: LetterboxdMovie[];
}

const tabs = [
  { id: "five-star", label: "Five Stars", icon: Trophy },
  { id: "reviewed", label: "Written About", icon: PenLine },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "watchlist", label: "Watchlist", icon: ListVideo },
];

/** Letterboxd's own notation — whole stars plus a half, rendered as text. */
function formatStars(rating: number): string {
  return "★".repeat(Math.floor(rating)) + (rating % 1 !== 0 ? "½" : "");
}

function formatMonth(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** The four films pinned to the Letterboxd profile, as a numbered plate. */
function FavoriteFilm({ movie, index }: { movie: LetterboxdMovie; index: number }) {
  return (
    <li className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <div className="flex gap-5 sm:gap-8">
        <span className="label-mono shrink-0 pt-2 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={movie.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-wrap items-baseline gap-x-3"
          >
            <h3 className="font-display text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary md:text-3xl">
              {movie.title}
            </h3>
            <span className="label-mono">{movie.year}</span>
          </Link>
          {/* Every plate gets a meta line: one of the four has no written note,
              and an empty entry reads as a rendering bug rather than a choice. */}
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
            {movie.rating ? (
              <span className="text-primary" aria-label={`${movie.rating} out of 5 stars`}>
                {formatStars(movie.rating)}
              </span>
            ) : null}
            {movie.dateWatched ? (
              <span className="label-mono">Logged {formatMonth(movie.dateWatched)}</span>
            ) : null}
          </p>
          {movie.review ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              &ldquo;{movie.review}&rdquo;
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function FilmRow({ movie, index }: { movie: LetterboxdMovie; index: number }) {
  return (
    <m.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.3) }}
      className="border-t border-border py-5"
    >
      <div className="flex flex-col gap-x-6 gap-y-2 sm:flex-row sm:items-baseline sm:justify-between">
        <Link
          href={movie.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-w-0 flex-wrap items-baseline gap-x-3"
        >
          <h3 className="text-base font-medium transition-colors group-hover:text-primary">
            {movie.title}
          </h3>
          <span className="label-mono">{movie.year}</span>
          {movie.isRewatch ? <span className="label-mono text-primary">Rewatch</span> : null}
        </Link>

        <div className="flex shrink-0 items-baseline gap-4">
          {movie.rating ? (
            <span
              className="text-sm text-primary"
              aria-label={`${movie.rating} out of 5 stars`}
            >
              {formatStars(movie.rating)}
            </span>
          ) : null}
          {movie.dateWatched ? (
            <span className="label-mono">{formatMonth(movie.dateWatched)}</span>
          ) : null}
        </div>
      </div>

      {movie.review ? (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          &ldquo;{movie.review}&rdquo;
        </p>
      ) : null}
    </m.li>
  );
}

export function MoviesList({
  stats,
  favorites,
  fiveStar,
  reviewed,
  recentWatches,
  watchlist,
}: MoviesListProps) {
  const [activeTab, setActiveTab] = useState("five-star");

  const listsById: Record<string, LetterboxdMovie[]> = {
    "five-star": fiveStar,
    reviewed,
    recent: recentWatches,
    watchlist,
  };
  const activeMovies = listsById[activeTab] ?? fiveStar;

  return (
    <div className="space-y-16">
      {favorites.length > 0 ? (
        <section aria-labelledby="favorites-heading">
          <div className="mb-8">
            <h2 id="favorites-heading" className="label-mono">
              The Four
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              The films pinned to my profile. Not the best films ever made — the four I would
              defend hardest at two in the morning.
            </p>
          </div>
          <ol>
            {favorites.map((movie, index) => (
              <FavoriteFilm key={movie.link} movie={movie} index={index} />
            ))}
          </ol>
        </section>
      ) : null}

      {/* Stats — hairline-divided wall-label panel */}
      <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
        {[
          { value: stats.totalRated.toLocaleString(), label: "Films Rated" },
          { value: stats.fiveStarFilms, label: "5-Star Films" },
          { value: stats.averageRating, label: "Avg Rating" },
          { value: reviewed.length, label: "Written About" },
        ].map((stat) => (
          <div key={stat.label} className="px-5 py-6">
            <p className="font-display text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="label-mono mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <section aria-labelledby="catalogue-heading">
        <h2 id="catalogue-heading" className="sr-only">
          Film catalogue
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
            {activeMovies.map((movie, index) => (
              <FilmRow key={`${movie.title}-${movie.year}`} movie={movie} index={index} />
            ))}
          </m.ul>
        </AnimatePresence>

        {activeMovies.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            Nothing in this list yet.
          </p>
        ) : null}
      </section>
    </div>
  );
}
