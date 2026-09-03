import { Container } from "@/components/Container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & Transparency",
  description: "Transparency about data handling, analytics, and business practices for Lorenzo Scaturchio's services.",
};

export default function PrivacyPolicyPage() {
  return (
    <Container>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>Privacy Policy & Transparency</h1>
        <p className="lead">
          Last updated: September 2, 2026
        </p>
        
        <h2>Transparency Statement</h2>
        <p>
          I believe in being transparent about how I operate and handle data. This page outlines my practices
          and gives you insight into how I maintain sustainability while providing value to the community.
        </p>

        <h2>Analytics &amp; Tracking</h2>
        <p>
          Five third-party services run on this site. Naming two of them and leaving the
          others out would be the kind of omission the essays here complain about, so here
          is the whole list.
        </p>
        <ul>
          <li>
            <strong>Vercel Analytics and Speed Insights</strong> — page views and loading
            performance, aggregated. No cookies, no cross-site identifier.
          </li>
          <li>
            <strong>Cloudflare Web Analytics</strong> — the same kind of aggregate traffic
            counting, injected at the network edge rather than by this codebase.
          </li>
          <li>
            <strong>Sentry</strong> — error and performance monitoring. When something breaks
            it sends me the error, the page it happened on, and the browser. Your IP address
            and email are stripped before the event leaves your browser. It does not record
            your session: session replay was removed in September 2026 because it captured
            reader sessions this page had never disclosed.
          </li>
          <li>
            <strong>Giscus</strong> — comments on essays and the guestbook, backed by GitHub
            Discussions. It loads only on pages that have comments, and only GitHub sees your
            account.
          </li>
          <li>
            <strong>Google Translate</strong> — loads only if you switch the site to another
            language. Leave it in English and it never runs.
          </li>
        </ul>
        <p>
          None of these tell me who you are. I cannot see which essays a specific person read.
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
          <a href="mailto:lorenzosca7@protonmail.ch">lorenzosca7@protonmail.ch</a>.
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
