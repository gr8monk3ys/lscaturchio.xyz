import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "ICE Kills Americans",
  description: "US citizens have been killed and deported by immigration enforcement. The machine doesn't care about papers.",
  date: "2025-12-22",
  image: "/images/blog/default.webp",
  tags: ["politics", "immigration", "civil-rights", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
