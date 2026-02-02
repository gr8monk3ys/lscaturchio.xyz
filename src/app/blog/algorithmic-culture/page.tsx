import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Algorithmic Culture",
  description: "You don't choose what you see. Systems choose for you, optimizing for engagement, not understanding. Culture is increasingly machine-curated.",
  date: "2025-08-11",
  image: "/images/blog/default.webp",
  tags: ["algorithms", "culture", "media", "technology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
