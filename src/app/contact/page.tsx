import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

export default function Contact() {
  return (
    <Container>
      <Heading className="font-black mb-2">Let&apos;s Connect</Heading>
      <Paragraph className="mb-10 max-w-xl">
        I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
      </Paragraph>
    </Container>
  );
}