import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { getAllBlogs } from "../../../lib/getAllBlogs";
import { Blogs } from "@/components/blog/Blogs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

export default async function Blog() {
  const blogs = await getAllBlogs();
  const data = blogs.map(({ component, ...meta }) => meta);

  return (
    <Container size="large">
      <Heading className="font-black pb-4">Blogs</Heading>
      <Blogs blogs={data} />
    </Container>
  );
}
