import { getAllBlogs } from '@/lib/getAllBlogs';
import { Feed } from 'feed';

export async function GET() {
  const blogs = await getAllBlogs();
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz';
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
      rss2: `${siteURL}/api/rss`,
      json: `${siteURL}/api/rss.json`,
      atom: `${siteURL}/api/rss.atom`,
    },
    author: {
      name: "Lorenzo Scaturchio",
      email: "lorenzosca7@gmail.com",
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
    let enhancedContent = post.content;
    if (post.series && post.seriesOrder) {
      enhancedContent = `<p><strong>📚 This is Part ${post.seriesOrder} of the "${post.series}" series</strong></p>\n\n${post.content}`;
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
          email: "lorenzosca7@gmail.com",
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

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml;charset=utf-8',
    },
  });
}
