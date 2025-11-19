import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "How I Built This Site: A Technical Deep Dive",
  description: "A comprehensive look at the architecture, tech stack, and design decisions behind lscaturchio.xyz - from Next.js 14 to AI-powered search.",
  date: "2025-01-19",
  image: "/images/blog/default.webp",
  tags: ["web development", "nextjs", "tutorial", "ai"],
};

export const metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return (
    <BlogLayout meta={meta} readingTime={15}>
      <Content />
    </BlogLayout>
  );
}
