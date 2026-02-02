export type EpisodeStatus = "published" | "upcoming" | "recording";

export interface EpisodeGuest {
  name: string;
  bio?: string;
  image?: string;
  links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface Episode {
  id: string;
  number?: number;
  title: string;
  description: string;
  guest?: EpisodeGuest | string; // Can be a full guest object or just a name
  duration: string; // e.g., "45:30" or "~60 min"
  date: string; // e.g., "2025-02" or "2025-02-15"
  audioUrl?: string; // Self-hosted or external
  transcript?: string;
  // Platform links
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  overcastUrl?: string;
  pocketCastsUrl?: string;
  status: EpisodeStatus;
  // Optional metadata
  topics?: string[];
  showNotes?: string;
}

export interface PodcastPlatform {
  name: string;
  icon: string;
  url: string;
  color: string;
}
