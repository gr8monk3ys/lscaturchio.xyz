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
    <div className="space-y-4">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-lg bg-secondary/50 py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
              }`}
            >
              <TagIcon className="size-3" />
              {tag}
              {isSelected && (
                <X className="size-3 hover:text-primary-foreground/80" />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
