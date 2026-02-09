import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "ICE Kills Americans",
  description: "US citizens have been killed and deported by immigration enforcement. The machine doesn't care about papers.",
  date: "2025-12-22",
  image: "https://images.unsplash.com/photo-1453847668862-487637052f8a?w=1200&q=80",
  tags: ["politics", "immigration", "civil-rights", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
