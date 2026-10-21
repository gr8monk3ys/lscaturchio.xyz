/**
 * Types for OpenAI embeddings and vector search
 */

export interface EmbeddingMetadata {
  title?: string;
  url?: string;
  description?: string;
  date?: string;
  image?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface RelatedPost {
  title: string;
  url: string;
  description: string;
  date: string;
  image: string;
  similarity: number;
}
