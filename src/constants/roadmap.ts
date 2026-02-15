export type RoadmapStatus = "now" | "next" | "later";

export interface RoadmapItem {
  id: string;
  status: RoadmapStatus;
  title: string;
  description: string;
  tags?: string[];
}

export const ROADMAP: RoadmapItem[] = [
  {
    id: "podcast-distribution",
    status: "now",
    title: "Podcast distribution",
    description: "Publish RSS with MP3 enclosures so Apple/Spotify can subscribe to audio posts.",
    tags: ["audio", "rss"],
  },
  {
    id: "webmentions",
    status: "now",
    title: "Webmentions",
    description: "Show likes, reposts, and replies from across the open web per post.",
    tags: ["indieweb"],
  },
  {
    id: "lab",
    status: "next",
    title: "Lab experiments",
    description: "Interactive demos for RAG/search and small UI experiments.",
    tags: ["rag", "search"],
  },
  {
    id: "internal-linking",
    status: "next",
    title: "Smarter internal linking",
    description: "Improve related content discovery and add authoring tooling to suggest internal links.",
    tags: ["seo"],
  },
  {
    id: "typography-refresh",
    status: "later",
    title: "Typography refresh",
    description: "More distinctive typography system and tighter type scale across pages.",
    tags: ["design"],
  },
];

