import { Episode, PodcastPlatform } from "@/types/podcast";

// Podcast metadata
export const podcastInfo = {
  name: "The AI Engineering Podcast",
  tagline: "Conversations about AI, technology, and building the future",
  description:
    "Join Lorenzo Scaturchio for deep conversations with engineers, researchers, and builders working on the cutting edge of AI. Practical insights, lessons learned, and honest discussions about what works.",
  host: "Lorenzo Scaturchio",
  coverArt: "/images/podcast/cover.webp",
};

// Podcast platform links
export const podcastPlatforms: PodcastPlatform[] = [
  {
    name: "Spotify",
    icon: "🎵",
    url: "#", // Replace with actual URL when available
    color: "hover:text-green-500",
  },
  {
    name: "Apple Podcasts",
    icon: "🎙️",
    url: "#", // Replace with actual URL when available
    color: "hover:text-purple-500",
  },
  {
    name: "YouTube",
    icon: "▶️",
    url: "#", // Replace with actual URL when available
    color: "hover:text-red-500",
  },
  {
    name: "RSS Feed",
    icon: "📡",
    url: "#", // Replace with actual URL when available
    color: "hover:text-orange-500",
  },
];

// Episodes - replace with actual episodes when ready
export const episodes: Episode[] = [
  {
    id: "ep-001",
    number: 1,
    title: "Coming Soon: The AI Engineering Podcast",
    description:
      "Join me for conversations with engineers, researchers, and builders working on the cutting edge of AI. We'll explore practical insights, lessons learned, and the future of AI development.",
    duration: "~60 min",
    date: "2025-02",
    status: "upcoming",
    topics: ["AI", "Engineering", "Introduction"],
  },
  {
    id: "ep-002",
    number: 2,
    title: "Building Production RAG Systems",
    description:
      "A deep dive into the challenges and solutions for building retrieval-augmented generation systems that actually work in production. From chunking strategies to evaluation frameworks.",
    guest: "TBA",
    duration: "~45 min",
    date: "2025-02",
    status: "upcoming",
    topics: ["RAG", "LLMs", "Production Systems"],
  },
  {
    id: "ep-003",
    number: 3,
    title: "The Future of AI Agents",
    description:
      "Exploring autonomous AI agents: what works today, what doesn't, and where the technology is heading. Practical advice for building agent systems.",
    guest: "TBA",
    duration: "~50 min",
    date: "2025-03",
    status: "upcoming",
    topics: ["AI Agents", "Automation", "Future Tech"],
  },
];

// Helper functions
export function getPublishedEpisodes(): Episode[] {
  return episodes.filter((ep) => ep.status === "published");
}

export function getUpcomingEpisodes(): Episode[] {
  return episodes.filter((ep) => ep.status === "upcoming" || ep.status === "recording");
}

export function getLatestEpisode(): Episode | undefined {
  return getPublishedEpisodes()[0];
}

export function getEpisodeById(id: string): Episode | undefined {
  return episodes.find((ep) => ep.id === id);
}
