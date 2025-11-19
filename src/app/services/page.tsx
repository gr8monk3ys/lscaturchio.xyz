import { Container } from "@/components/Container";
import ServicesSection from "@/components/services/service-section";
import { FaqSection } from "@/components/services/faq-section";
import { questions } from "@/constants/questions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation | Lorenzo Scaturchio",
  description: "Data science and AI consulting. Let's talk about your project and see if I can help.",
};

export default function ServicesPage() {
  return (
    <Container>
      <ServicesSection />
      <FaqSection
        title="Frequently Asked Questions"
        description="Answers to questions about how I work and what I care about"
        items={questions}
        contactInfo={{
          title: "Still have questions?",
          description: "Let's grab coffee (virtually or in Pasadena) and talk about your project.",
          buttonText: "Schedule a Call",
          contactUrl: "https://calendly.com/gr8monk3ys/30min"
        }}
      />
    </Container>
  );
}