// Rule: TypeScript Usage - Use TypeScript for all code
// Rule: UI and Styling - Use Shadcn UI and Radix for components
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function BlogCardSkeleton(): JSX.Element {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-stone-50 dark:bg-stone-800 transition-all shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_3px_rgba(0,0,0,0.05),-1px_-1px_3px_rgba(255,255,255,0.8)] dark:hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-0.5px_-0.5px_2px_rgba(255,255,255,0.08)] hover:translate-y-[-2px] border-0"
    >
      {/* Image skeleton */}
      <Skeleton className="aspect-[16/9] w-full" />
      
      <div className="flex flex-1 flex-col justify-between p-6">
        {/* Date skeleton */}
        <Skeleton className="h-4 w-24 mb-2 rounded" />
        
        {/* Title skeleton - using font-space-mono class for consistent styling */}
        <div className="space-y-2 mb-4 font-space-mono">
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-3/4 rounded" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 font-space-mono">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        
        {/* Tags skeleton */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]" />
          <Skeleton className="h-6 w-20 rounded-full shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]" />
          <Skeleton className="h-6 w-14 rounded-full shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]" />
        </div>
      </div>
    </motion.div>
  );
}
