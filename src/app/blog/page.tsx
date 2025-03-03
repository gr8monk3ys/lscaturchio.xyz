import React from "react";
import { Container } from "@/components/Container";
import { getAllBlogs } from "../../../lib/getAllBlogs";
import { BlogCard } from "@/components/blog/BlogCard";
import { AdBanner } from "@/components/ads/AdBanner";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

export const metadata = {
  title: "Blog | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

export default async function Blog() {
  const blogs = await getAllBlogs();
  const data = blogs.map((blog) => ({
    slug: blog.slug,
    title: blog.title,
    description: blog.description,
    date: blog.date,
    image: blog.image,
    tags: blog.tags,
  }));

  return (
    <Container size="large">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-stone-600">
            Blog
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Thoughts on software development, technology, and life.
          </p>
        </div>
        
        {/* Top ad banner */}
        <div className="my-6">
          <AdBanner slot="5678901234" format="horizontal" responsive={true} />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((blog, index) => (
            <React.Fragment key={blog.slug}>
              <BlogCard {...blog} />
              {/* Insert ad after every 6th blog post */}
              {index > 0 && (index + 1) % 6 === 0 && (
                <div key={`ad-${index}`} className="col-span-full my-6">
                  <AdBanner slot="6789012345" format="horizontal" responsive={true} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Container>
  );
}
