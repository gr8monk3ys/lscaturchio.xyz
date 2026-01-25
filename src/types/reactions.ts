/**
 * Types for blog post reactions and engagement tracking
 */

/**
 * Valid reaction types for blog posts
 */
export type ReactionType =
  | 'like'
  | 'bookmark'
  | 'fire'
  | 'celebrate'
  | 'insightful'
  | 'thinking';

/**
 * Emoji-specific reaction types (subset of ReactionType)
 */
export type EmojiReactionType = 'fire' | 'celebrate' | 'insightful' | 'thinking';

/**
 * Reaction counts for a blog post
 */
export interface Reactions {
  likes: number;
  bookmarks: number;
  fire: number;
  celebrate: number;
  insightful: number;
  thinking: number;
}

/**
 * API response for reactions endpoint
 */
export interface ReactionsResponse extends Reactions {
  slug: string;
  alreadyVoted?: boolean;
  neverVoted?: boolean;
}

/**
 * Request body for adding a reaction
 */
export interface ReactionRequest {
  slug: string;
  type: ReactionType;
}
