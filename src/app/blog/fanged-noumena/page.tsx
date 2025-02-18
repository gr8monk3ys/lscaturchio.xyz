import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

// Import meta data from MDX file
const meta = {
  title: "Fanged Noumena",
  description: "Exploring Nick Land's philosophical work and its implications for technology and consciousness.",
  date: "2025-01-15",
  image: "/images/blog/fanged-noumena.webp",
  tags: ["philosophy", "technology", "consciousness"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
