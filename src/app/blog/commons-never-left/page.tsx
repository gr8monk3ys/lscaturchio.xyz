import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Commons Never Left",
  description: "Common-pool resources exist everywhere. We just stopped seeing them. The tragedy of the commons is a myth that served enclosure.",
  date: "2025-09-15",
  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
  tags: ["commons", "economics", "property", "alternatives"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
