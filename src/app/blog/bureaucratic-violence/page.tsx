import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Bureaucratic Violence",
  description: "When 'just following protocol' produces atrocities. The banality of cruelty in American institutions.",
  date: "2025-12-15",
  image: "/images/blog/default.webp",
  tags: ["politics", "bureaucracy", "institutions", "violence"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
