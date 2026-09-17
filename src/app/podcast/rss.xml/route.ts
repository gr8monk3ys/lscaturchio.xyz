import { Feed } from "feed";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getAudioByteLength } from "@/lib/audio";
import { getAudioUrl } from "@/lib/audio-url";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const blogs = await getAllBlogs();

  // An enclosure URL is what makes a feed item an episode, so a post whose
  // audio this deployment cannot serve is left out entirely rather than
  // published with a URL that 404s in a podcast client.
  const audioPosts = blogs
    .map((post) => ({
      ...post,
      audioUrl: getAudioUrl(post.slug),
    }))
    .filter((post): post is typeof post & { audioUrl: string } => post.audioUrl !== null);

  const feed = new Feed({
    title: "Lorenzo Scaturchio Podcast",
    description: "Audio versions of my writing: AI, technology, and building reliable systems.",
    id: `${siteUrl}/podcast`,
    link: `${siteUrl}/podcast`,
    language: "en",
    image: `${siteUrl}/og-image.webp`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${now.getFullYear()}, Lorenzo Scaturchio`,
    updated: now,
    feedLinks: {
      rss: `${siteUrl}/podcast/rss.xml`,
    },
    author: {
      name: "Lorenzo Scaturchio",
      email: "lorenzosca7@protonmail.ch",
      link: siteUrl,
    },
    // Enables iTunes + Google Play podcast extensions in `feed`.
    podcast: true,
    category: "Technology",
  });

  for (const post of audioPosts) {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const length = getAudioByteLength(post.slug) ?? 0;

    feed.addItem({
      title: post.title,
      id: postUrl,
      link: postUrl,
      description: post.description,
      content: `<p>${post.description}</p><p><a href="${postUrl}">Read the post</a></p>`,
      author: [
        {
          name: "Lorenzo Scaturchio",
          email: "lorenzosca7@protonmail.ch",
          link: siteUrl,
        },
      ],
      date: new Date(post.updated || post.date),
      published: new Date(post.date),
      audio: {
        url: post.audioUrl,
        type: "audio/mpeg",
        length,
      },
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml;charset=utf-8",
    },
  });
}
