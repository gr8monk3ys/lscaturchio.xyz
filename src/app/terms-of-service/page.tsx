import { Container } from "@/components/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Lorenzo Scaturchio",
  description: "Terms and conditions for using Lorenzo Scaturchio's data science and AI services.",
};

export default function TermsOfServicePage() {
  return (
    <Container>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>Terms of Service</h1>
        <p className="lead">
          Last updated: January 17, 2025
        </p>

        <h2>1. Services</h2>
        <p>
          I provide data science and artificial intelligence consulting services, including but not limited to:
        </p>
        <ul>
          <li>Data analysis and visualization</li>
          <li>Machine learning model development</li>
          <li>AI solution implementation</li>
          <li>Technical consulting and advisory</li>
        </ul>

        <h2>2. Project Terms</h2>
        <p>
          All projects are governed by the following terms:
        </p>
        <ul>
          <li>Project scope and deliverables will be clearly defined in writing</li>
          <li>Timeline and milestones will be agreed upon before project start</li>
          <li>Payment terms will be specified in the project agreement</li>
          <li>Changes to scope will require written agreement from both parties</li>
        </ul>

        <h2>3. Intellectual Property</h2>
        <p>
          Upon full payment, clients receive:
        </p>
        <ul>
          <li>Full ownership of custom code developed specifically for their project</li>
          <li>Rights to use the developed models and solutions</li>
          <li>Documentation and training materials</li>
        </ul>

        <h2>4. Confidentiality</h2>
        <p>
          I maintain strict confidentiality regarding:
        </p>
        <ul>
          <li>Client data and business information</li>
          <li>Project details and specifications</li>
          <li>Proprietary methodologies and technologies</li>
        </ul>

        <h2>5. Payment Terms</h2>
        <p>
          Standard payment terms include:
        </p>
        <ul>
          <li>50% upfront deposit for new projects</li>
          <li>Remaining balance upon project completion</li>
          <li>Monthly billing for ongoing services</li>
          <li>Late payments may incur additional fees</li>
        </ul>

        <h2>6. Limitation of Liability</h2>
        <p>
          While I strive for excellence in all projects, I cannot guarantee specific business outcomes. My liability is limited to the amount paid for services.
        </p>

        <h2>7. Termination</h2>
        <p>
          Either party may terminate services with 30 days written notice. Client remains responsible for payment of services rendered up to termination date.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these terms, please contact me at{" "}
          <a href="mailto:contact@lscaturchio.xyz">contact@lscaturchio.xyz</a>.
        </p>
      </div>
    </Container>
  );
}