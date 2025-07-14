"use client";

// Rule: TypeScript Usage - Use TypeScript for all code with explicit return types
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, Bookmark, Eye, MessageSquare, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Rule: TypeScript Usage - Prefer interfaces over types
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  coverImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  viewCount?: number;
  commentCount?: number;
}

interface EnhancedBlogCardProps {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
  className?: string;
  priority?: boolean;
}

// Rule: UI and Styling - Use shadcn UI and Tailwind CSS
export function EnhancedBlogCard({
  post,
  variant = "default",
  className,
  priority = false
}: EnhancedBlogCardProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Rule: Function Patterns - Use pure functions for handling actions
  function handleBookmarkToggle(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // This could also connect to a real bookmarking system
  }

  function handleShareClick(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if navigator.share is available (modern browsers)
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: `/blog/${post.slug}`,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`)
        .then(() => {
          // This would be better with a toast notification
          console.log('Link copied to clipboard');
        })
        .catch((error) => console.log('Error copying link', error));
    }
  }

  // Animation variants for smooth interactions
  const imageVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    initial: { scale: 1, transition: { duration: 0.3 } }
  };

  const arrowVariants = {
    hover: { x: 5, transition: { duration: 0.2 } },
    initial: { x: 0, transition: { duration: 0.2 } }
  };

  // Dynamic classes based on variant
  const cardClasses = cn(
    "group relative overflow-hidden rounded-lg transition-all duration-300",
    variant === "featured" ? "md:grid md:grid-cols-2 md:gap-6" : "",
    variant === "compact" ? "max-w-sm" : "w-full",
    "bg-card text-card-foreground hover:shadow-md dark:hover:shadow-stone-900/30",
    "border border-border hover:border-primary/20",
    className
  );

  const imageContainerClasses = cn(
    "relative overflow-hidden rounded-t-lg",
    variant === "featured" ? "md:rounded-l-lg md:rounded-tr-none h-full" : "aspect-video",
    variant === "compact" ? "h-48" : ""
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title}>
        <span className="sr-only">Read article: {post.title}</span>
      </Link>
      
      {/* Image Container */}
      <div className={imageContainerClasses}>
        <motion.div
          className="h-full w-full"
          variants={imageVariants}
          animate={isHovered ? "hover" : "initial"}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={priority || variant === "featured"}
          />
        </motion.div>
        
        {/* Tag Overlay */}
        {post.tags && post.tags.length > 0 && (
          <div className="absolute left-3 top-3 z-20">
            <span className="inline-block rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              {post.tags[0]}
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex flex-col p-5">
        {/* Meta info */}
        <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={new Date(post.date).toISOString()}>{post.date}</time>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readingTime}</span>
          </div>
          
          {post.viewCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>{post.viewCount.toLocaleString()}</span>
            </div>
          )}
          
          {post.commentCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{post.commentCount}</span>
            </div>
          )}
        </div>
        
        <h3 className="mb-2 text-xl font-bold tracking-tight">{post.title}</h3>
        
        <p className="mb-4 line-clamp-2 text-muted-foreground">
          {post.excerpt}
        </p>
        
        {/* Author */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <Image 
                src={post.author.avatar} 
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                {post.author.name.charAt(0)}
              </div>
            )}
            <span className="text-sm font-medium">{post.author.name}</span>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 z-20">
            <button 
              onClick={handleBookmarkToggle}
              className={cn(
                "rounded-full p-1.5 transition-colors", 
                isBookmarked 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
            >
              <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            
            <button 
              onClick={handleShareClick}
              className="rounded-full bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-muted/80"
              aria-label="Share article"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Read more indicator */}
        <div className="absolute bottom-4 right-5 z-20">
          <motion.div
            className="flex items-center gap-1 text-sm font-medium text-primary"
            variants={arrowVariants}
            animate={isHovered ? "hover" : "initial"}
          >
            <span>Read more</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
