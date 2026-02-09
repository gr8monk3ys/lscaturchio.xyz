import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Self-Hosting Is Political",
  description: "Running your own infrastructure isn't just for nerds. It's a form of resistance against platform dependence. Digital autonomy requires material control.",
  date: "2025-10-06",
  image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
  tags: ["technology", "self-hosting", "autonomy", "politics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
