import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Your Smart Home Is a Landlord's Dream",
  description: "Smart apartment tech is marketed as convenience for tenants and works as surveillance for landlords.",
  date: "2026-03-10",
  image: "/images/blog/default.webp",
  tags: ["technology", "housing", "ownership", "privacy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
