import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Secular Society Isn't",
  description: "We replaced church with other rituals. They're just less honest about what they are.",
  date: "2025-07-07",
  image: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80",
  tags: ["religion", "secularism", "culture", "philosophy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
