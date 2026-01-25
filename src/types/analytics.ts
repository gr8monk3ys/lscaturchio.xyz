/**
 * Types for analytics data and dashboard metrics
 */

/**
 * Newsletter subscription statistics
 */
export interface NewsletterStats {
  activeSubscribers: number;
  totalSubscribers: number;
  unsubscribed: number;
  last30Days: number;
}

/**
 * Blog engagement statistics
 */
export interface EngagementStats {
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  uniquePosts: number;
}

/**
 * Blog post with view count
 */
export interface PostWithViews {
  slug: string;
  title: string;
  views: number;
  [key: string]: string | number;
}

/**
 * Blog post with like count
 */
export interface PostWithLikes {
  slug: string;
  title: string;
  likes: number;
  [key: string]: string | number;
}

/**
 * Blog post with bookmark count
 */
export interface PostWithBookmarks {
  slug: string;
  title: string;
  bookmarks: number;
  [key: string]: string | number;
}

/**
 * Top performing posts by engagement type
 */
export interface TopPosts {
  byViews: PostWithViews[];
  byLikes: PostWithLikes[];
  byBookmarks: PostWithBookmarks[];
}

/**
 * Tag usage statistics
 */
export interface TagStats {
  name: string;
  count: number;
}

/**
 * Content statistics
 */
export interface ContentStats {
  totalPosts: number;
  tags: TagStats[];
}

/**
 * Complete analytics data structure returned by /api/analytics
 */
export interface AnalyticsData {
  newsletter: NewsletterStats;
  engagement: EngagementStats;
  topPosts: TopPosts;
  content: ContentStats;
}
