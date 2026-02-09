import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Due Process Is Already Dead",
  description: "Immigration enforcement operates outside constitutional norms. These exceptions are spreading to other domains. The erosion is already here.",
  date: "2025-12-08",
  image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
  tags: ["politics", "civil-liberties", "constitution", "law"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
