import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "You Don't Find Yourself",
  description: "The 'finding yourself' narrative assumes a fixed self waiting to be discovered. Identity is constructed, revised, and performed -- and that's more freeing than any gap year.",
  date: "2026-02-20",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "identity", "psychology", "culture"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
