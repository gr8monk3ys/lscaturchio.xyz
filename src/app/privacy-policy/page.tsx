import { Container } from "@/components/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Lorenzo Scaturchio",
  description: "Privacy policy and data handling practices for Lorenzo Scaturchio's services.",
};

export default function PrivacyPolicyPage() {
  return (
    <Container>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>Privacy Policy</h1>
        <p className="lead">
          Last updated: January 17, 2025
        </p>
        
        <h2>Introduction</h2>
        <p>
          This privacy policy outlines how I collect, use, and protect your personal information when you use my services.
        </p>

        <h2>Information Collection</h2>
        <p>
          I collect information that you voluntarily provide when you:
        </p>
        <ul>
          <li>Contact me through the website</li>
          <li>Schedule a consultation</li>
          <li>Sign up for my services</li>
        </ul>

        <h2>Use of Information</h2>
        <p>
          The information collected is used to:
        </p>
        <ul>
          <li>Provide and improve my services</li>
          <li>Communicate with you about your projects</li>
          <li>Send relevant updates and information</li>
        </ul>

        <h2>Data Protection</h2>
        <p>
          I implement appropriate security measures to protect your personal information and ensure it is not accessed, disclosed, altered, or destroyed without authorization.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          I may use third-party services that collect, monitor, and analyze data to improve my services. These services have their own privacy policies regarding how they handle user data.
        </p>

        <h2>Contact Information</h2>
        <p>
          If you have any questions about this privacy policy, please contact me at{" "}
          <a href="mailto:contact@lscaturchio.xyz">contact@lscaturchio.xyz</a>.
        </p>
      </div>
    </Container>
  );
}