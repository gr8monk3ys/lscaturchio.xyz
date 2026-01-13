import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Nick Land: The Philosopher Who Became Explicitly Racist",
  description:
    "From feminist revolutionary to 'hyper-racism' advocate: Land's trajectory shows how theoretical transgression can slide into genuine political extremism. His innovations don't excuse what he became.",
  date: "2025-01-15",
  image: "/images/blog/fanged-noumena.webp",
  tags: ["philosophy", "technology", "accelerationism", "nick-land", "dark-enlightenment"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
