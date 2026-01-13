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
                href="mailto:lorenzosca7@protonmail.ch"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                lorenzosca7@protonmail.ch
              </Link>
            </p>
            <p>
              For sensitive communications, I use PGP encryption. You can
              download my public key here:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <Link
                  href="/publickey.lorenzosca7@protonmail.ch-394a5d92f69235e6e03b3efeb3d7a1f8c0dffd27.asc"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  PGP Public Key
                </Link>
              </li>
              <li>
                <strong className="text-neutral-800 dark:text-neutral-200">
                  Key Fingerprint:
                </strong>{" "}
                <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm">
                  394A5D92F69235E6E033EFEB3D7A1F8C0DFFD27
                </code>
              </li>
            </ul>
            <p>
              <strong className="text-neutral-800 dark:text-neutral-200">
                Signal:
              </strong>{" "}
              I&apos;m also available on Signal for secure, encrypted messaging.
              Please mention &quot;Signal&quot; in your initial email if
              you&apos;d prefer to continue our conversation there.
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
