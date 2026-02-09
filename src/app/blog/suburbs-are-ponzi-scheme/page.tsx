import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Suburbs Are a Ponzi Scheme",
  description: "Most American suburbs cannot pay for their own infrastructure. The math has never worked. We just kept building anyway.",
  date: "2026-04-09",
  image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  tags: ["urban", "economics", "housing", "infrastructure"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
