import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Why Reform Fails",
  description: "You can't vote your way out of structural violence. The system is working as designed. A critique of reformism without nihilism.",
  date: "2025-11-17",
  image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80",
  tags: ["politics", "reform", "systems", "organizing"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
