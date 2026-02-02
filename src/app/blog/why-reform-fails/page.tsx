import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Why Reform Fails",
  description: "You can't vote your way out of structural violence. The system is working as designed. A critique of reformism without nihilism.",
  date: "2025-11-17",
  image: "/images/blog/default.webp",
  tags: ["politics", "reform", "systems", "organizing"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
