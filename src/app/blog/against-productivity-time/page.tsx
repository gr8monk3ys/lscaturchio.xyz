import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Against Productivity Time",
  description: "Clock-discipline is a historical invention, not a natural law. The tyranny of the schedule costs us more than we realize.",
  date: "2025-05-26",
  image: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1200&q=80",
  tags: ["time", "productivity", "philosophy", "work"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
