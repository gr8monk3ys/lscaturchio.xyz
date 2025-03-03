import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Future of Work in the Age of Automation",
  description: "Exploring how automation and artificial intelligence are transforming the job market and the skills needed for the future.",
  date: "2025-02-24",
  image: "/images/blog/future-of-work.webp",
  tags: ["technology", "automation", "work", "future"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
