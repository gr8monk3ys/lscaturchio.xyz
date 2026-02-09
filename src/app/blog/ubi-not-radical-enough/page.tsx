import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "UBI Isn't Radical Enough",
  description: "Universal basic income has gone mainstream, and that should make you suspicious of what it leaves untouched.",
  date: "2026-03-22",
  image: "https://images.unsplash.com/photo-1554672723-d42a16e533db?w=1200&q=80",
  tags: ["economics", "policy", "politics", "alternatives"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
