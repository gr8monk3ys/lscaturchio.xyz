import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Expertise Is a Social Relation",
  description: "Who gets to know things? Expertise isn't just competence, it's recognition. The politics of legitimate knowledge shapes what counts as truth.",
  date: "2025-11-03",
  image: "/images/blog/default.webp",
  tags: ["epistemology", "knowledge", "power", "institutions"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
