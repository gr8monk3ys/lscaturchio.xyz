import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Psychology of Self-Deception: What Research Shows About Ego",
  description:
    "Self-enhancement bias averages d=0.86. The Dunning-Kruger effect is misunderstood. Terror Management Theory explains why ego threats feel existential. What psychology actually knows about the stories we tell ourselves.",
  date: "2025-01-10",
  image: "/images/blog/understanding-ego.webp",
  tags: ["psychology", "self-deception", "cognitive-bias", "identity"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
