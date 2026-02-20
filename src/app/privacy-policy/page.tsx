import { Container } from "@/components/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & Transparency | Lorenzo Scaturchio",
  description: "Transparency about data handling, analytics, and business practices for Lorenzo Scaturchio's services.",
};

export default function PrivacyPolicyPage() {
  return (
    <Container>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>Privacy Policy & Transparency</h1>
        <p className="lead">
          Last updated: February 4, 2025
        </p>
        
        <h2>Transparency Statement</h2>
        <p>
          I believe in being transparent about how I operate and handle data. This page outlines my practices
          and gives you insight into how I maintain sustainability while providing value to the community.
        </p>

        <h2>Analytics & Tracking</h2>
        <p>
          I use Vercel Analytics and Speed Insights to understand website performance and user experience.
          These tools are privacy-focused and do not collect personally identifiable information. The analytics
          help me improve the website&apos;s performance and content quality.
        </p>

        <h2>Information Collection</h2>
        <p>
          I collect minimal information, only what&apos;s necessary to provide my services:
        </p>
        <ul>
          <li>Contact form submissions (name, email, message)</li>
          <li>Consultation bookings through Calendly</li>
          <li>Project-related communications</li>
        </ul>

        <h2>Data Storage & Security</h2>
        <p>
          All data is stored securely using modern encryption standards. I use:
        </p>
        <ul>
          <li>Vercel for website hosting and deployment</li>
          <li>Secure email servers for communications</li>
          <li>Industry-standard security practices for all stored data</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>
          I use several third-party services to enhance functionality:
        </p>
        <ul>
          <li>Vercel - Website hosting and analytics</li>
          <li>Calendly - Consultation scheduling</li>
          <li>GitHub - Code repository and version control</li>
        </ul>
        <p>
          Each service has its own privacy policy, and I encourage you to review them.
        </p>

        <h2>Open Source</h2>
        <p>
          This website is open source, and you can verify how your data is handled by reviewing the code on
          my GitHub repository. I believe in transparency through code.
        </p>

        <h2>Sustainability Practices</h2>
        <p>
          I strive to make my digital services environmentally conscious by:
        </p>
        <ul>
          <li>Optimizing website performance to reduce server load</li>
          <li>Using efficient code practices</li>
          <li>Choosing eco-friendly hosting providers</li>
        </ul>

        <h2>Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Request access to your personal data</li>
          <li>Request correction or deletion of your data</li>
          <li>Opt-out of communications</li>
          <li>Know how your data is being used</li>
        </ul>

        <h2>Contact Information</h2>
        <p>
          For any questions about this privacy policy or data handling practices, please contact me at{" "}
          <a href="mailto:lorenzo@lscaturchio.xyz">lorenzo@lscaturchio.xyz</a>.
        </p>

        <h2>Updates to This Policy</h2>
        <p>
          This privacy policy may be updated periodically to reflect changes in practices or regulations.
          Significant changes will be communicated through the website or email if necessary.
        </p>
      </div>
    </Container>
  );
}
