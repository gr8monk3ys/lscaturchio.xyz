import { Feed } from "feed";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getAudioByteLength, hasAudioForSlug } from "@/lib/audio";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const blogs = await getAllBlogs();

  const audioPosts = blogs
    .map((post) => ({
      ...post,
      hasAudio: hasAudioForSlug(post.slug),
    }))
    .filter((post) => post.hasAudio);

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
      email: "lorenzo@lscaturchio.xyz",
      link: siteUrl,
    },
    // Enables iTunes + Google Play podcast extensions in `feed`.
    podcast: true,
    category: "Technology",
  });

  for (const post of audioPosts) {
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    const audioUrl = `${siteUrl}/audio/${post.slug}.mp3`;
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
          email: "lorenzo@lscaturchio.xyz",
          link: siteUrl,
        },
      ],
      date: new Date(post.updated || post.date),
      published: new Date(post.date),
      audio: {
        url: audioUrl,
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
