// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Twitter, Facebook, Linkedin, Heart, MessageCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface PlatformData {
  platform: "twitter" | "facebook" | "linkedin";
  shares: number;
  comments: number;
  likes: number;
}

interface SocialInsightsProps {
  slug: string;
  title: string;
  className?: string;
  initialStats?: Partial<SocialStats>;
  showDetailedBreakdown?: boolean;
}

export function SocialInsights({
  slug,
  title,
  className,
  initialStats = {},
  showDetailedBreakdown = false,
}: SocialInsightsProps): JSX.Element {
  const [stats, setStats] = useState<SocialStats>({
    likes: initialStats.likes || 0,
    comments: initialStats.comments || 0,
    shares: initialStats.shares || 0,
    views: initialStats.views || 0,
  });
  
  const [platformData, setPlatformData] = useState<PlatformData[]>([
    { platform: "twitter", shares: 0, comments: 0, likes: 0 },
    { platform: "facebook", shares: 0, comments: 0, likes: 0 },
    { platform: "linkedin", shares: 0, comments: 0, likes: 0 },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching social stats
  useEffect(() => {
    const fetchSocialStats = async (): Promise<void> => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would be an API call
        // to fetch actual social media engagement data
        // const response = await fetch(`/api/social-stats/${slug}`);
        // const data = await response.json();
        
        // For demo purposes, generate random stats
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Generate realistic-looking random data
        const views = Math.floor(Math.random() * 2000) + 100;
        const likes = Math.floor(views * (Math.random() * 0.2 + 0.05));
        const comments = Math.floor(likes * (Math.random() * 0.3 + 0.1));
        const shares = Math.floor(likes * (Math.random() * 0.15 + 0.05));
        
        // Update overall stats
        setStats({
          likes: initialStats.likes ?? likes,
          comments: initialStats.comments ?? comments,
          shares: initialStats.shares ?? shares,
          views: initialStats.views ?? views,
        });
        
        // Update platform breakdown
        const twitterShares = Math.floor(shares * (Math.random() * 0.5 + 0.2));
        const facebookShares = Math.floor(shares * (Math.random() * 0.3 + 0.1));
        const linkedinShares = shares - twitterShares - facebookShares;
        
        setPlatformData([
          { 
            platform: "twitter", 
            shares: twitterShares,
            comments: Math.floor(comments * (Math.random() * 0.6 + 0.2)),
            likes: Math.floor(likes * (Math.random() * 0.5 + 0.3)),
          },
          { 
            platform: "facebook", 
            shares: facebookShares,
            comments: Math.floor(comments * (Math.random() * 0.3 + 0.1)),
            likes: Math.floor(likes * (Math.random() * 0.4 + 0.2)),
          },
          { 
            platform: "linkedin", 
            shares: linkedinShares,
            comments: Math.floor(comments * (Math.random() * 0.2 + 0.05)),
            likes: Math.floor(likes * (Math.random() * 0.2 + 0.1)),
          },
        ]);
        
      } catch (error) {
        console.error("Failed to fetch social stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSocialStats();
  }, [slug, initialStats]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Get platform icon
  const getPlatformIcon = (platform: string): JSX.Element => {
    switch (platform) {
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      default:
        return <></>;
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950",
        className
      )}
    >
      <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
        Social Engagement
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-full rounded-md bg-stone-200 dark:bg-stone-800"></div>
              <div className="mt-2 h-4 w-16 rounded-md bg-stone-200 dark:bg-stone-800"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col items-center rounded-md bg-stone-50 p-3 dark:bg-stone-900"
            >
              <div className="flex items-center gap-1.5 text-lg font-medium text-stone-800 dark:text-stone-200">
                <Eye className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                {formatNumber(stats.views)}
              </div>
              <span className="mt-1 text-xs text-stone-500 dark:text-stone-400">Views</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-col items-center rounded-md bg-stone-50 p-3 dark:bg-stone-900"
            >
              <div className="flex items-center gap-1.5 text-lg font-medium text-stone-800 dark:text-stone-200">
                <Heart className="h-4 w-4 text-red-500" />
                {formatNumber(stats.likes)}
              </div>
              <span className="mt-1 text-xs text-stone-500 dark:text-stone-400">Likes</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col items-center rounded-md bg-stone-50 p-3 dark:bg-stone-900"
            >
              <div className="flex items-center gap-1.5 text-lg font-medium text-stone-800 dark:text-stone-200">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                {formatNumber(stats.comments)}
              </div>
              <span className="mt-1 text-xs text-stone-500 dark:text-stone-400">Comments</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex flex-col items-center rounded-md bg-stone-50 p-3 dark:bg-stone-900"
            >
              <div className="flex items-center gap-1.5 text-lg font-medium text-stone-800 dark:text-stone-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-500"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {formatNumber(stats.shares)}
              </div>
              <span className="mt-1 text-xs text-stone-500 dark:text-stone-400">Shares</span>
            </motion.div>
          </div>

          {showDetailedBreakdown && (
            <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-800">
              <h4 className="mb-3 text-xs font-medium text-stone-500 dark:text-stone-400">
                Platform Breakdown
              </h4>
              <div className="space-y-3">
                {platformData.map(platform => (
                  <div
                    key={platform.platform}
                    className="flex items-center justify-between rounded-md bg-stone-50 p-2 text-sm dark:bg-stone-900"
                  >
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
                        {getPlatformIcon(platform.platform)}
                      </div>
                      <span className="ml-2 font-medium capitalize text-stone-700 dark:text-stone-300">
                        {platform.platform}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs text-stone-600 dark:text-stone-400">{platform.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs text-stone-600 dark:text-stone-400">{platform.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        <span className="text-xs text-stone-600 dark:text-stone-400">{platform.shares}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
