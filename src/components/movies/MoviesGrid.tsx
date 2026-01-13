"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
              ? "text-orange-500 fill-orange-500"
              : star === fullStars + 1 && hasHalfStar
              ? "text-orange-500 fill-orange-500/50"
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function MovieCard({ movie, index }: { movie: LetterboxdMovie; index: number }) {
  return (
    <motion.div
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
        <div className="neu-card p-3 h-full hover:shadow-lg transition-shadow">
          <div className="relative aspect-[2/3] mb-3 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <Film className="h-12 w-12 text-muted-foreground/30" />
            {movie.isRewatch && (
              <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded">
                Rewatch
              </span>
            )}
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{movie.year}</p>
          <div className="flex items-center justify-between flex-wrap gap-1">
            {movie.rating && <RatingStars rating={movie.rating} />}
            {movie.dateWatched && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(movie.dateWatched).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalRated.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Films Rated</p>
        </div>
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.fiveStarFilms}</p>
          <p className="text-sm text-muted-foreground">5-Star Films</p>
        </div>
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.averageRating}</p>
          <p className="text-sm text-muted-foreground">Avg Rating</p>
        </div>
        <div className="neu-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalFilms}</p>
          <p className="text-sm text-muted-foreground">Diary Entries</p>
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

      {/* Movies Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {getActiveMovies().map((movie, index) => (
            <MovieCard key={`${movie.title}-${movie.year}`} movie={movie} index={index} />
          ))}
        </motion.div>
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
