import { PricingSection } from "@/components/ui/pricing-section";
import { Container } from "@/components/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation | Lorenzo Scaturchio",
  description: "Expert data science and AI consulting services. Choose the right plan for your project needs.",
};

const PAYMENT_FREQUENCIES = ["monthly", "yearly"];

const PRICING_TIERS = [
  {
    id: "starter",
    name: "Starter",
    price: {
      monthly: 2500,
      yearly: 2000,
    },
    description: "Perfect for small data science projects and POCs",
    features: [
      "Data analysis & visualization",
      "Basic ML model development",
      "Weekly progress updates",
      "2 revision rounds",
      "Basic documentation",
    ],
    cta: "Get Started",
  },
  {
    id: "professional",
    name: "Professional",
    price: {
      monthly: 5000,
      yearly: 4000,
    },
    description: "Ideal for production-ready AI solutions",
    features: [
      "Advanced ML/DL models",
      "Model deployment & APIs",
      "Bi-weekly meetings",
      "4 revision rounds",
      "Comprehensive documentation",
    ],
    cta: "Schedule Call",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: {
      monthly: "Custom",
      yearly: "Custom",
    },
    description: "Full-scale AI transformation projects",
    features: [
      "Custom AI/ML solutions",
      "End-to-end implementation",
      "Dedicated support",
      "Unlimited revisions",
      "Training & knowledge transfer",
    ],
    cta: "Contact Us",
    highlighted: true,
  },
];

export default function ConsultationPage() {
  return (
    <Container>
      <PricingSection
        title="AI Consulting Services"
        subtitle="Choose the perfect plan for your data science and AI needs"
        frequencies={PAYMENT_FREQUENCIES}
        tiers={PRICING_TIERS}
      />
    </Container>
  );
}