import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { ContactForm } from "@/components/contact/ContactForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | Lorenzo Scaturchio",
  description:
    "Get in touch with Lorenzo Scaturchio for consulting, collaboration, or contributions. Available via encrypted email (PGP) and Signal for secure communications.",
};

export default function Contact() {
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Heading className="font-black mb-4">Contact</Heading>
          <Paragraph className="text-lg">
            There could be a multitude of reasons we can be in contact. Hopefully
            whatever it may be, I can help out the best I can to ensure all runs
            smoothly. Excluding help, if you are simply willing to discuss
            whatever is on your mind lets do that as well!
          </Paragraph>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
            I&apos;m available for:
          </h2>
          <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">
                Consulting
              </strong>{" "}
              - If you need help with general system design I can be of
              assistance
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">
                Collaboration
              </strong>{" "}
              - It could be for coding or music, either are fun to me
            </li>
            <li>
              <strong className="text-neutral-800 dark:text-neutral-200">
                Contribution
              </strong>{" "}
              - Especially if you believe your tool is for common good
            </li>
          </ul>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
            Contact Information
          </h2>
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
            <p>
              <strong className="text-neutral-800 dark:text-neutral-200">
                Email:
              </strong>{" "}
              <Link
                href="mailto:lorenzo@lscaturchio.xyz"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                lorenzo@lscaturchio.xyz
              </Link>
            </p>
            <p>
              For sensitive communication (PGP or Signal), mention your preference in your first
              email and I&apos;ll share the right channel details.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
            Response Time
          </h2>
          <Paragraph>
            I typically respond to emails within 2 business days give or take.
            For urgent matters, please mention &quot;URGENT&quot; in the subject
            line.
          </Paragraph>
          <Paragraph className="mt-4">
            Looking forward to hearing from you!
          </Paragraph>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
          <h2 className="text-xl font-semibold mb-6 text-center text-neutral-800 dark:text-neutral-200">
            Or send a message directly
          </h2>
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
