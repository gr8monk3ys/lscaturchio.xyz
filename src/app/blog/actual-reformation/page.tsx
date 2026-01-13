import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Actual Reformation",
  description:
    "A look at what we as individuals must do to reform instead of more grandiose gestures that would only cause short-term fixes like electing a new president for example.",
  date: "2025-06-21",
  image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
  tags: ["politics", "philosophy", "sociology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
