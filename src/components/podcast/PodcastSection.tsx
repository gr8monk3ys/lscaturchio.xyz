"use client";

import { motion } from "framer-motion";
import { Play, Clock, Calendar, ExternalLink, Bell, Headphones, Radio } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Episode {
  id: string;
  title: string;
  description: string;
  guest?: string;
  duration: string;
  date: string;
  audioUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  status: "published" | "upcoming" | "recording";
}

// Placeholder episodes - replace with your actual episodes
const episodes: Episode[] = [
  {
    id: "ep-001",
    title: "Coming Soon: The AI Engineering Podcast",
    description: "Join me for conversations with engineers, researchers, and builders working on the cutting edge of AI. We'll explore practical insights, lessons learned, and the future of AI development.",
    duration: "~60 min",
    date: "2025-02",
    status: "upcoming"
  },
  {
    id: "ep-002",
    title: "Building Production RAG Systems",
    description: "A deep dive into the challenges and solutions for building retrieval-augmented generation systems that actually work in production. From chunking strategies to evaluation frameworks.",
    guest: "TBA",
    duration: "~45 min",
    date: "2025-02",
    status: "upcoming"
  },
  {
    id: "ep-003",
    title: "The Future of AI Agents",
    description: "Exploring autonomous AI agents: what works today, what doesn't, and where the technology is heading. Practical advice for building agent systems.",
    guest: "TBA",
    duration: "~50 min",
    date: "2025-03",
    status: "upcoming"
  },
];

const platforms = [
  { name: "Spotify", icon: "🎵", url: "#", color: "hover:text-green-500" },
  { name: "Apple Podcasts", icon: "🎙️", url: "#", color: "hover:text-purple-500" },
  { name: "YouTube", icon: "▶️", url: "#", color: "hover:text-red-500" },
  { name: "RSS Feed", icon: "📡", url: "#", color: "hover:text-orange-500" },
];

function StatusBadge({ status }: { status: Episode["status"] }) {
  const styles = {
    published: "bg-green-500/10 text-green-600",
    upcoming: "bg-yellow-500/10 text-yellow-600",
    recording: "bg-blue-500/10 text-blue-600",
  };

  const labels = {
    published: "Live",
    upcoming: "Coming Soon",
    recording: "Recording",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function PodcastSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to your newsletter API
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="space-y-12">
      {/* Subscribe Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-card p-8 text-center"
      >
        <div className="neu-flat-sm rounded-full p-4 w-fit mx-auto mb-4">
          <Radio className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Launching Soon</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Get notified when the first episode drops. No spam, just podcast updates.
        </p>

        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Bell className="h-5 w-5" />
            <span>You&apos;re on the list!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="neu-input flex-1 px-4 py-3 rounded-xl"
            />
            <button
              type="submit"
              className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
            >
              Notify Me
            </button>
          </form>
        )}
      </motion.div>

      {/* Platforms */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">Subscribe on your favorite platform</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {platforms.map((platform) => (
            <Link
              key={platform.name}
              href={platform.url}
              className={`neu-button px-6 py-3 rounded-xl flex items-center gap-2 ${platform.color} transition-colors`}
            >
              <span>{platform.icon}</span>
              <span className="font-medium">{platform.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Episodes */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Upcoming Episodes</h2>
        <div className="space-y-4">
          {episodes.map((episode, index) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="neu-card p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Play button placeholder */}
                <div className="neu-pressed rounded-xl p-4 flex-shrink-0 self-start">
                  {episode.status === "published" ? (
                    <Play className="h-8 w-8 text-primary" />
                  ) : (
                    <Headphones className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                {/* Episode info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={episode.status} />
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {episode.date}
                    </span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {episode.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{episode.title}</h3>

                  {episode.guest && (
                    <p className="text-sm text-primary mb-2">
                      Guest: {episode.guest}
                    </p>
                  )}

                  <p className="text-muted-foreground">{episode.description}</p>

                  {/* Episode links */}
                  {episode.status === "published" && (
                    <div className="flex gap-3 mt-4">
                      {episode.spotifyUrl && (
                        <Link
                          href={episode.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Spotify
                        </Link>
                      )}
                      {episode.appleUrl && (
                        <Link
                          href={episode.appleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Apple
                        </Link>
                      )}
                      {episode.youtubeUrl && (
                        <Link
                          href={episode.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          YouTube
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What to expect */}
      <div className="neu-pressed rounded-xl p-8">
        <h3 className="text-xl font-semibold mb-4">What to Expect</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-primary">Deep Technical Dives</h4>
            <p className="text-sm text-muted-foreground">
              Practical insights into building AI systems, from architecture decisions to production challenges.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-primary">Interesting Guests</h4>
            <p className="text-sm text-muted-foreground">
              Conversations with engineers, researchers, and founders working on emerging technology.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-primary">Real Talk</h4>
            <p className="text-sm text-muted-foreground">
              No fluff or marketing speak. Honest discussions about what works, what doesn&apos;t, and lessons learned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
