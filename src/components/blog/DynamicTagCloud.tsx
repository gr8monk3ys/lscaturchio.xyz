// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { TagCloud as OriginalTagCloud } from './TagCloud';

// Define props interface to match the TagCloud component
type TagCloudProps = React.ComponentProps<typeof OriginalTagCloud>;

// Skeleton loader for the TagCloud
export function TagCloudSkeleton(): JSX.Element {
  return (
    <div className="animate-pulse rounded-lg bg-stone-50 dark:bg-stone-800 p-4 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]">
      <div className="h-6 w-24 bg-stone-200 dark:bg-stone-700 rounded mb-4 shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.03),-0.5px_-0.5px_1px_rgba(255,255,255,0.4)] dark:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.1),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.01)]"></div>
      <div className="flex flex-wrap gap-2">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="h-6 bg-stone-200 dark:bg-stone-700 rounded-full shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.03),-0.5px_-0.5px_1px_rgba(255,255,255,0.4)] dark:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.1),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.01)]" 
            style={{ width: `${Math.floor(Math.random() * 40) + 40}px` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

// Dynamically import the TagCloud component
export const DynamicTagCloud = dynamic<TagCloudProps>(
  () => import('./TagCloud').then(mod => mod.TagCloud),
  {
    loading: () => <TagCloudSkeleton />,
    ssr: false, // Disable server-side rendering for this component
  }
);
