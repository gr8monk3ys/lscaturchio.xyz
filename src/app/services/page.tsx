import { Container } from "@/components/Container";
import ServicesSection from "@/components/services/service-section";
import { FaqSection } from "@/components/services/faq-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Lorenzo Scaturchio",
  description: "Explore the services I offer including web development, AI consulting, and more.",
};

const faqItems = [
  {
    question: "What services do you offer?",
    answer: "I offer web development, AI consulting, technical writing, and custom software development services tailored to meet your specific needs."
  },
  {
    question: "How do you typically structure your projects?",
    answer: "Each project begins with a discovery phase to understand requirements, followed by planning, design, development, testing, and deployment phases. I maintain transparent communication throughout the process."
  },
  {
    question: "What technologies do you specialize in?",
    answer: "I specialize in modern web technologies including React, TypeScript, Next.js, and various AI/ML frameworks. I'm always expanding my skills to stay current with industry trends."
  },
  {
    question: "How do you handle project pricing?",
    answer: "Project pricing depends on scope, complexity, and timeline. I offer both fixed-price quotes for well-defined projects and hourly rates for ongoing work. Contact me for a custom quote."
  },
  {
    question: "What is your typical turnaround time?",
    answer: "Turnaround time varies based on project complexity. Small projects may take 1-2 weeks, while larger projects could take several months. I'll provide a detailed timeline during our initial consultation."
  }
];

const contactInfo = {
  title: "Still have questions?",
  description: "If you couldn't find the answer to your question, feel free to reach out directly.",
  buttonText: "Contact Me",
  contactUrl: "/contact"
};

export default function ServicesPage() {
  return (
    <Container>
      <ServicesSection />
      <FaqSection 
        title="Frequently Asked Questions" 
        description="Find answers to common questions about my services, process, and expertise."
        items={faqItems}
        contactInfo={contactInfo}
      />
    </Container>
  );
}