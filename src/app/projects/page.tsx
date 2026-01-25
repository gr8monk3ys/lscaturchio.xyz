import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Products } from "@/components/projects/Products";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

// Revalidate projects every hour
export const revalidate = 3600;

export default function Projects() {
  return (
    <Container size="large">
      <Heading className="font-black mb-10">
        {" "}
        What I&apos;ve been working on
      </Heading>

      <Products />
    </Container>
  );
}
