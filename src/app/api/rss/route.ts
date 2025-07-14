// Rule: TypeScript Usage - Use TypeScript for all code
import { getRssBlogs, RssBlog } from '@/lib/getRssBlogs';
import { Feed } from 'feed';

export async function GET() {
  const blogs = await getRssBlogs();
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz';
  const date = new Date();

  const feed = new Feed({
    title: "Lorenzo Scaturchio's Blog",
    description: "Articles about AI, technology, and software development",
    id: siteURL,
    link: siteURL,
    language: "en",
    image: `${siteURL}/og-image.png`,
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

  blogs.forEach((post: RssBlog) => {
    const url = `${siteURL}/blog/${post.slug}`;
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.description,
      content: post.content || post.description, // Use extracted content or fallback to description
      author: [
        {
          name: "Lorenzo Scaturchio",
          email: "lorenzosca7@gmail.com",
          link: siteURL,
        },
      ],
      date: new Date(post.date),
      image: post.image && {
        url: `${siteURL}${post.image}`,
        type: post.image.endsWith('.webp') ? 'image/webp' : 
              post.image.endsWith('.png') ? 'image/png' : 
              post.image.endsWith('.jpg') ? 'image/jpg' : 'image/jpeg'
      }
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml;charset=utf-8',
    },
  });
}
