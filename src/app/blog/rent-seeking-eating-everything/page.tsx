import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Rent-Seeking Is Eating Everything",
  description: "Most wealth in America is not created but extracted, and the economy is increasingly about controlling gates rather than building roads.",
  date: "2026-03-26",
  image: "/images/blog/default.webp",
  tags: ["economics", "policy", "capitalism", "inequality"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
