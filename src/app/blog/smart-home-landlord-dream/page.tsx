import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Your Smart Home Is a Landlord's Dream",
  description: "Smart apartment tech is marketed as convenience for tenants and works as surveillance for landlords.",
  date: "2026-03-10",
  image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80",
  tags: ["technology", "housing", "ownership", "privacy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
