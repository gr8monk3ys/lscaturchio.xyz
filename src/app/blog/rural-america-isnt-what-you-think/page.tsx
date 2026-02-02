import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Rural America Isn't What You Think",
  description: "The countryside isn't monolithically conservative. It's complicated, abandoned, and organizing in ways that defy stereotypes.",
  date: "2025-07-21",
  image: "/images/blog/default.webp",
  tags: ["rural", "politics", "america", "geography"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
