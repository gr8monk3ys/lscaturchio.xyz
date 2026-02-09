import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Bureaucratic Violence",
  description: "When 'just following protocol' produces atrocities. The banality of cruelty in American institutions.",
  date: "2025-12-15",
  image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
  tags: ["politics", "bureaucracy", "institutions", "violence"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
