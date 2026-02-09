import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Public Libraries Are Radical",
  description: "Free access to information, open to everyone, no purchase required. If someone proposed public libraries today, they would be called a socialist.",
  date: "2026-02-28",
  image: "/images/blog/default.webp",
  tags: ["institutions", "commons", "politics", "culture"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
