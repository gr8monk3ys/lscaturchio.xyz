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
          className="w-full rounded-lg bg-stone-50 dark:bg-stone-700 py-2 pl-10 pr-4 text-sm font-space-mono text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),_-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),_-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:outline-none focus:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05),_inset_-1px_-1px_2px_rgba(255,255,255,0.7)] dark:focus:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),_inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.04)] transition-all border-0"
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
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-space-mono font-medium transition-all transform hover:translate-y-[-1px] ${
                isSelected
                  ? "bg-stone-200 dark:bg-stone-600 text-stone-800 dark:text-stone-100 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)]"
                  : "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)] hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.05),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.25),-0.25px_-0.25px_0.25px_rgba(255,255,255,0.03)]"
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
