"use client";

import { useState } from "react";
import { m, AnimatePresence } from '@/lib/motion';
import Link from "next/link";
import { Star, Calendar, Clock, Trophy, Film, ListVideo } from "lucide-react";
import type { LetterboxdMovie, LetterboxdStats } from "@/lib/letterboxd";

interface MoviesGridProps {
  stats: LetterboxdStats;
  topRated: LetterboxdMovie[];
  recentWatches: LetterboxdMovie[];
  watchlist: LetterboxdMovie[];
}

const tabs = [
  { id: "top-rated", label: "Top Rated", icon: Trophy },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "watchlist", label: "Watchlist", icon: ListVideo },
];

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= fullStars
              ? "text-primary fill-primary"
              : star === fullStars + 1 && hasHalfStar
              ? "text-primary fill-primary/50"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function MovieCard({ movie, index }: { movie: LetterboxdMovie; index: number }) {
  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link
        href={movie.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative mb-3 flex aspect-2/3 items-center justify-center overflow-hidden border border-border bg-muted">
          <Film className="h-12 w-12 text-muted-foreground/30" />
          {movie.isRewatch && (
            <span className="label-mono absolute top-2 right-2 text-white/90 [text-shadow:0_1px_3px_rgb(0_0_0/0.6)]">
              Rewatch
            </span>
          )}
        </div>
        <h3 className="mb-1 line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
          {movie.title}
        </h3>
        <p className="mb-2 text-xs text-muted-foreground">{movie.year}</p>
        <div className="flex flex-wrap items-center justify-between gap-1">
          {movie.rating && <RatingStars rating={movie.rating} />}
          {movie.dateWatched && (
            <span className="label-mono flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(movie.dateWatched).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </Link>
    </m.div>
  );
}

export function MoviesGrid({ stats, topRated, recentWatches, watchlist }: MoviesGridProps) {
  const [activeTab, setActiveTab] = useState("top-rated");

  const getActiveMovies = () => {
    switch (activeTab) {
      case "top-rated":
        return topRated;
      case "recent":
        return recentWatches;
      case "watchlist":
        return watchlist;
      default:
        return topRated;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats — hairline-divided wall-label panel */}
      <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
        {[
          { value: stats.totalRated.toLocaleString(), label: "Films Rated" },
          { value: stats.fiveStarFilms, label: "5-Star Films" },
          { value: stats.averageRating, label: "Avg Rating" },
          { value: stats.totalFilms, label: "Diary Entries" },
        ].map((stat) => (
          <div key={stat.label} className="px-5 py-6">
            <p className="font-display text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="label-mono mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Movies Grid */}
      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {getActiveMovies().map((movie, index) => (
            <MovieCard key={`${movie.title}-${movie.year}`} movie={movie} index={index} />
          ))}
        </m.div>
      </AnimatePresence>

      {/* Empty state */}
      {getActiveMovies().length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No movies found in this category.</p>
        </div>
      )}
    </div>
  );
}
