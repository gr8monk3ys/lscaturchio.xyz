import { NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { Feed } from 'feed';
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit';
import { getSiteUrl } from '@/lib/site-url';
import { essayToFeedHtml } from '@/lib/feed-html';

const handleGet = async () => {
  const blogs = await getAllBlogs();
  const siteURL = getSiteUrl();
  const date = new Date();

  const feed = new Feed({
    title: "Lorenzo Scaturchio's Blog",
    description: "Articles about AI, technology, and software development",
    id: siteURL,
    link: siteURL,
    language: "en",
    image: `${siteURL}/og-image.webp`,
    favicon: `${siteURL}/favicon.ico`,
    copyright: `All rights reserved ${date.getFullYear()}, Lorenzo Scaturchio`,
    updated: date,
    generator: "Feed for Node.js",
    feedLinks: {
      // feed@6 reads `rss` for the RSS 2.0 atom:link self reference; the
      // `rss2` key it used to get was ignored. Only the RSS feed exists.
      rss: `${siteURL}/api/rss`,
    },
    author: {
      name: "Lorenzo Scaturchio",
      email: "lorenzosca7@protonmail.ch",
      link: siteURL,
    },
  });

  blogs.forEach((post) => {
    const url = `${siteURL}/blog/${post.slug}`;

    // Build enhanced description with series info
    let enhancedDescription = post.description;
    if (post.series && post.seriesOrder) {
      enhancedDescription = `📚 Part ${post.seriesOrder} of the "${post.series}" series\n\n${post.description}`;
    }

    // Build enhanced content with series info and metadata
    const html = essayToFeedHtml(post.content, siteURL);
    let enhancedContent = html;
    if (post.series && post.seriesOrder) {
      enhancedContent = `<p><strong>📚 This is Part ${post.seriesOrder} of the "${post.series}" series</strong></p>\n\n${html}`;
    }

    feed.addItem({
      title: post.series && post.seriesOrder
        ? `${post.title} (${post.series} #${post.seriesOrder})`
        : post.title,
      id: url,
      link: url,
      description: enhancedDescription,
      content: enhancedContent,
      author: [
        {
          name: "Lorenzo Scaturchio",
          email: "lorenzosca7@protonmail.ch",
          link: siteURL,
        },
      ],
      date: new Date(post.updated || post.date),
      published: new Date(post.date),
      image: post.image && {
        url: `${siteURL}${post.image}`,
        type: post.image.endsWith('.webp') ? 'image/webp' :
              post.image.endsWith('.png') ? 'image/png' :
              post.image.endsWith('.jpg') ? 'image/jpg' : 'image/jpeg'
      },
      category: post.tags.map(tag => ({ name: tag })),
    });
  });

  return new NextResponse(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml;charset=utf-8',
    },
  });
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
