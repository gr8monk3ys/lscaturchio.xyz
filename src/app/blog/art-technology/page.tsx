import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "When Machines Learned to See: A Century of Art and Technology in Conflict",
  description:
    "From the camera obscura controversy to AI lawsuits in 2025, each wave of technological disruption has forced artists to confront what is irreplaceably human about creative expression.",
  date: "2025-01-10",
  image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80",
  tags: ["art", "technology", "AI", "history"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
