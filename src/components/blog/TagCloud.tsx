// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAllBlogs } from '@/lib/useBlogData';

interface TagCount {
  name: string;
  count: number;
}

interface TagCloudProps {
  className?: string;
  limit?: number;
  onClick?: (tag: string) => void;
}

export function TagCloud({ className = '', limit, onClick }: TagCloudProps): JSX.Element {
  const { blogs, isLoading } = useAllBlogs();
  const [tags, setTags] = useState<TagCount[]>([]);
  
  useEffect(() => {
    if (blogs && blogs.length > 0) {
      // Count occurrences of each tag
      const tagCounts: Record<string, number> = {};
      
      blogs.forEach(blog => {
        if (blog.tags && Array.isArray(blog.tags)) {
          blog.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // Convert to array and sort by count (descending)
      const sortedTags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      // Apply limit if specified
      const limitedTags = limit ? sortedTags.slice(0, limit) : sortedTags;
      
      // Only update state if the tags have actually changed
      if (JSON.stringify(limitedTags) !== JSON.stringify(tags)) {
        setTags(limitedTags);
      }
    }
  }, [blogs, limit]);
  
  // Calculate font size based on count (min: 0.75rem, max: 1.5rem)
  const getFontSize = (count: number): string => {
    if (!tags || tags.length === 0) return '1rem';
    
    const counts = tags.map(t => t.count);
    if (!counts.length) return '1rem';
    
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const range = maxCount - minCount;
    
    if (range === 0) return '1rem';
    
    const normalized = (count - minCount) / range;
    const fontSize = 0.75 + (normalized * 0.75);
    
    return `${fontSize}rem`;
  };
  
  if (isLoading) {
    return (
      <div className={`animate-pulse rounded-lg bg-stone-100 p-4 dark:bg-stone-800 ${className}`}>
        <div className="h-6 w-24 bg-stone-200 dark:bg-stone-700 rounded mb-4"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="h-6 bg-stone-200 dark:bg-stone-700 rounded-full" 
              style={{ width: `${Math.floor(Math.random() * 40) + 40}px` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (tags.length === 0) {
    return <div className={className}></div>;
  }
  
  return (
    <div className={`rounded-lg bg-stone-50 dark:bg-stone-800 p-4 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] ${className}`}>
      <h2 className="font-medium font-space-mono text-stone-800 dark:text-stone-200 mb-3">Popular Tags</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          onClick ? (
            <button
              key={tag.name}
              onClick={() => onClick(tag.name)}
              className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-700 px-2.5 py-1 text-stone-800 dark:text-stone-200 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)] hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.05),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.25),-0.25px_-0.25px_0.25px_rgba(255,255,255,0.03)] transition-all transform hover:translate-y-[-1px]"
              style={{ fontSize: getFontSize(tag.count) }}
            >
              {tag.name}
              <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">
                ({tag.count})
              </span>
            </button>
          ) : (
            <Link
              key={tag.name}
              href={`/blog/tag/${encodeURIComponent(tag.name.toLowerCase())}`}
              className="inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-700 px-2.5 py-1 text-stone-800 dark:text-stone-200 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)] hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.05),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.25),-0.25px_-0.25px_0.25px_rgba(255,255,255,0.03)] transition-all transform hover:translate-y-[-1px]"
              style={{ fontSize: getFontSize(tag.count) }}
            >
              {tag.name}
              <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">
                ({tag.count})
              </span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
