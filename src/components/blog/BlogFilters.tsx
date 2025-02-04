"use client";

import { motion } from "framer-motion";
import { Search, Tag as TagIcon, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface BlogFiltersProps {
  allTags: string[];
  onSearch: (query: string) => void;
  onTagsChange: (tags: string[]) => void;
}

export function BlogFilters({ allTags, onSearch, onTagsChange }: BlogFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch(query);
  }, [onSearch]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      return newTags;
    });
  }, []);

  useEffect(() => {
    onTagsChange(selectedTags);
  }, [selectedTags, onTagsChange]);

  return (
    <div className="mb-8 space-y-6">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-base text-zinc-900 placeholder:text-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700/40 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:focus:border-teal-400 dark:focus:ring-teal-400/20"
        />
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2 text-base text-zinc-600 dark:text-zinc-400">
          <TagIcon className="h-4 w-4" />
          <span>Filter by tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  isSelected
                    ? "bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400"
                    : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {tag}
                {isSelected && (
                  <X className="h-3 w-3" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
