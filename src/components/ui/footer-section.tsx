import { navigation } from '@/constants/navlinks';
import Link from "next/link";
import { Send, Rss, Pizza } from "lucide-react"
import { socials } from "@/constants/socials"

const primaryLinkClass = "cta-primary inline-flex items-center gap-2";
const secondaryLinkClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl neu-button px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const iconLinkClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl neu-button text-foreground transition-all duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function Footer() {

  const substackUrl = socials.find(social => social.label === "Substack")?.href || "https://substack.com/@gr8monk3ys"
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Stay Connected</h2>
            <p className="mb-6 text-muted-foreground">
              Subscribe for updates on AI systems, engineering notes, and new writing.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://social.lscaturchio.xyz/auth/sign_up"
                target="_blank"
                rel="noopener noreferrer"
                className={primaryLinkClass}
              >
                <Send className="h-4 w-4" />
                Join Lorenzo Social
              </a>
              <a
                href={substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={primaryLinkClass}
              >
                <Send className="h-4 w-4" />
                Subscribe to Newsletter
              </a>
              <Link
                href="/api/rss"
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryLinkClass}
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Link>
              <a
                href="https://www.buymeacoffee.com/lorenzoscak"
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryLinkClass}
              >
                <Pizza className="h-4 w-4" />
                Buy me a pizza
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  className="block transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>Los Angeles, California</p>
              <p>United States</p>
              <p>
                Email:{" "}
                <a href="mailto:lorenzosca7@protonmail.ch" className="hover:text-primary transition-colors">
                  lorenzosca7@protonmail.ch
                </a>
              </p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Me</h3>
            <div className="mb-6 flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconLinkClass}
                  title={social.label}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            {currentYear} Lorenzo Scaturchio. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link href="/stats" prefetch={false} className="transition-colors hover:text-primary">
              Stats
            </Link>
            <Link href="/privacy-policy" prefetch={false} className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" prefetch={false} className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
