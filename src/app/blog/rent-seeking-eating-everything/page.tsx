import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Rent-Seeking Is Eating Everything",
  description: "Most wealth in America is not created but extracted, and the economy is increasingly about controlling gates rather than building roads.",
  date: "2026-03-26",
  image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80",
  tags: ["economics", "policy", "capitalism", "inequality"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
