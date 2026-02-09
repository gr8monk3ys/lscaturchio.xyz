import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Expertise Is a Social Relation",
  description: "Who gets to know things? Expertise isn't just competence, it's recognition. The politics of legitimate knowledge shapes what counts as truth.",
  date: "2025-11-03",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
  tags: ["epistemology", "knowledge", "power", "institutions"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
