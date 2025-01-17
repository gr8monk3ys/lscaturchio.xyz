"use client";

import { FaqSection } from "@/components/ui/faq-section";
import { Container } from "@/components/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Lorenzo Scaturchio",
  description: "Frequently asked questions about my services and work.",
};

const FAQS = [
  {
    question: "What services do you offer?",
    answer: "I specialize in data science, machine learning, and full-stack development. This includes data analysis, model development, API design, and web application development.",
  },
  {
    question: "How do you handle project collaboration?",
    answer: "I use modern collaboration tools and maintain clear communication throughout the project. We'll have regular check-ins, and I provide detailed documentation of all work completed.",
  },
  {
    question: "What is your typical project timeline?",
    answer: "Project timelines vary based on scope and complexity. I'll provide a detailed timeline estimate after our initial consultation and breakdown of requirements.",
  },
  {
    question: "Do you offer ongoing support?",
    answer: "Yes, I offer ongoing support and maintenance for all projects. We can discuss specific support requirements and set up a maintenance plan that works for your needs.",
  },
  {
    question: "What technologies do you work with?",
    answer: "I work with a wide range of technologies including Python, TypeScript, React, Next.js, and various ML frameworks. I'm always learning and adapting to new technologies as needed.",
  },
];

export default function FaqPage() {
  const handleContactClick = () => {
    window.location.href = "https://calendly.com/gr8monk3ys/30min";
  };

  return (
    <Container>
      <FaqSection
        title="Frequently Asked Questions"
        description="Find answers to common questions about my services and work process"
        items={FAQS}
        contactInfo={{
          title: "Still have questions?",
          description: "I'm here to help! Let's schedule a call to discuss your needs.",
          buttonText: "Schedule a Call",
          onContact: handleContactClick,
        }}
      />
    </Container>
  );
}