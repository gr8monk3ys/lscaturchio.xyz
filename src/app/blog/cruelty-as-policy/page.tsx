import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Cruelty As Policy",
  description: "Some policies exist to hurt people. That's the feature, not the bug. Deterrence through suffering laid bare.",
  date: "2025-11-24",
  image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&q=80",
  tags: ["politics", "policy", "institutions", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
