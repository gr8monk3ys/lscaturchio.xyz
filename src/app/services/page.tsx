import { PricingSection } from "@/components/services/pricing-section";
import { Container } from "@/components/Container";
import ServicesSection from "@/components/services/service-section";
import { FaqSection } from "@/components/services/faq-section";
import { questions } from "@/constants/questions";
import { pricingTiers } from "@/constants/pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation | Lorenzo Scaturchio",
  description: "Expert data science and AI consulting services. Choose the right plan for your project needs.",
};

const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

export default function ServicesPage() {
  return (
    <Container>
      <ServicesSection />
      <PricingSection
        title="AI Consulting Services"
        subtitle="Choose the perfect plan for your data science and AI needs"
        frequencies={PAYMENT_FREQUENCIES}
        tiers={pricingTiers}
      />
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