import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Rational Actor Is Dead",
  description: "Homo economicus never existed but we still build policy like it does, and people keep getting hurt.",
  date: "2026-02-14",
  image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
  tags: ["economics", "psychology", "philosophy", "institutions"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
