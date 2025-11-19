import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Digital Minimalism: Beyond the Basics",
  description: "Moving past surface-level decluttering to build a thoughtful relationship with technology that enhances rather than diminishes our lives.",
  date: "2024-01-23",
  image: "/images/blog/default.webp",
  tags: ["minimalism", "technology", "philosophy", "productivity"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
