import { Container } from "@/components/Container";
import { AboutHero } from "@/components/about/Hero";
import { AboutJourney } from "@/components/about/Journey";
import { Interests } from "@/components/about/Interests";
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
        <AboutHero />
        <AboutJourney />
        <Interests />
      </div>
    </Container>
  );
}
