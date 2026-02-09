import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Right to Repair Is a Civil Right",
  description: "You bought it but you don't own it. Repair restrictions aren't a consumer inconvenience, they're a property rights crisis.",
  date: "2026-03-12",
  image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80",
  tags: ["technology", "ownership", "policy", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
