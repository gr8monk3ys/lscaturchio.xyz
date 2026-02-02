import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Meaning Isn't Optional",
  description: "Humans require narrative. The question isn't whether you have a mythology, but which one.",
  date: "2025-06-23",
  image: "/images/blog/default.webp",
  tags: ["meaning", "philosophy", "religion", "psychology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
