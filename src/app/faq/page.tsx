import { FaqSection } from "@/components/ui/faq-section";
import { Container } from "@/components/Container";
import { Metadata } from "next";
import { questions } from "@/constants/questions";

export const metadata: Metadata = {
  title: "FAQ | Lorenzo Scaturchio",
  description: "Frequently asked questions about my services and work.",
};

export default function FaqPage() {
  return (
    <Container>
      <FaqSection
        title="Frequently Asked Questions"
        description="Find answers to common questions about my services and work process"
        items={questions}
        contactInfo={{
          title: "Still have questions?",
          description: "I'm here to help! Let's schedule a call to discuss your needs.",
          buttonText: "Schedule a Call",
          contactUrl: "https://calendly.com/gr8monk3ys/30min"
        }}
      />
    </Container>
  );
}