import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Platform Feudalism",
  description: "You don't own your digital life. You rent it from lords who can evict you at will. This isn't metaphor - it's the actual structure of digital property relations.",
  date: "2025-10-20",
  image: "/images/blog/default.webp",
  tags: ["technology", "platforms", "power", "digital-rights"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
