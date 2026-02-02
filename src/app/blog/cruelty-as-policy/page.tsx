import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Cruelty As Policy",
  description: "Some policies exist to hurt people. That's the feature, not the bug. Deterrence through suffering laid bare.",
  date: "2025-11-24",
  image: "/images/blog/default.webp",
  tags: ["politics", "policy", "institutions", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
