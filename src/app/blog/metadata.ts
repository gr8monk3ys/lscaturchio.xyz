// Rule: TypeScript Usage - Use TypeScript for all code
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

export interface BlogPostMetadata {
  date: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

interface BlogPostsMetadata {
  [slug: string]: BlogPostMetadata;
}

/**
 * Centralized blog post metadata for all posts
 */
export const blogPosts: BlogPostsMetadata = {
  "ai-ethics": {
    date: "2025-02-23",
    title: "The Ethics of Artificial Intelligence",
    description: "Discussing the ethical considerations surrounding the development and deployment of artificial intelligence.",
    image: "/images/blog/ai-ethics.jpg",
    tags: ["ethics", "technology", "artificial intelligence"],
  },
  "ai-puzzle": {
    date: "2025-01-17",
    title: "A Reimaging of Artificial Intelligence",
    description: "A deep dive into the future of AI.",
    image: "/images/blog/ai-puzzle.jpg",
    tags: ["ai", "technology"],
  },
  "art-technology": {
    date: "2024-11-05",
    title: "The Intersection of Art and Technology",
    description: "Exploring how technology is changing the way we create and experience art.",
    image: "/images/blog/art-technology.jpg",
    tags: ["art", "technology", "creativity"],
  },
  "fanged-noumena": {
    date: "2024-10-18",
    title: "Fanged Noumena: Review and Thoughts",
    description: "A review of Nick Land's collection of essays, Fanged Noumena.",
    image: "/images/blog/fanged-noumena.jpg",
    tags: ["philosophy", "literature", "review"],
  },
  "future-of-work": {
    date: "2024-09-30",
    title: "The Future of Work in the Digital Age",
    description: "Examining how technology is reshaping the workplace and what it means for workers and employers.",
    image: "/images/blog/future-of-work.jpg",
    tags: ["work", "technology", "future"],
  },
  "investing-in-monero": {
    date: "2024-08-15",
    title: "Why I'm Investing in Monero",
    description: "A look at the privacy-focused cryptocurrency Monero and why it might be a good investment.",
    image: "/images/blog/investing-in-monero.jpg",
    tags: ["cryptocurrency", "investing", "monero", "privacy"],
  },
  "metaverse": {
    date: "2024-07-22",
    title: "The Metaverse: Promise and Peril",
    description: "Exploring the potential and pitfalls of the metaverse.",
    image: "/images/blog/metaverse.jpg",
    tags: ["metaverse", "technology", "future"],
  },
  "simulation-hypothesis": {
    date: "2024-06-10",
    title: "The Simulation Hypothesis: Are We Living in a Computer Simulation?",
    description: "Exploring the philosophical and scientific arguments for and against the simulation hypothesis.",
    image: "/images/blog/simulation-hypothesis.jpg",
    tags: ["philosophy", "technology", "simulation"],
  },
  "understanding-ego": {
    date: "2024-05-03",
    title: "Understanding the Ego: A Journey into Self-Awareness",
    description: "Exploring the concept of ego in psychology and spirituality.",
    image: "/images/blog/understanding-ego.jpg",
    tags: ["psychology", "spirituality", "self-improvement"],
  },
};

/**
 * Get all blog post metadata
 */
export function getAllPostMetadata(): BlogPostMetadata[] {
  return Object.entries(blogPosts).map(([slug, meta]) => ({
    ...meta,
    slug,
  })) as (BlogPostMetadata & { slug: string })[];
}

/**
 * Get metadata for a specific blog post by slug
 */
export function getPostMetadata(slug: string): BlogPostMetadata | undefined {
  return blogPosts[slug];
}
