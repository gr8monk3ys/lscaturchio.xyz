import { Container } from "@/components/Container";
import About from "@/components/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Lorenzo Scaturchio",
  description:
    "Learn more about Lorenzo Scaturchio, a software engineer and machine learning enthusiast based in California.",
};

export default function AboutPage() {
  return (
    <Container size="large">
      <div className="space-y-8">
        <About />
      </div>
    </Container>
  );
}
