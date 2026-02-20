"use client"

import { buttonVariants } from "@/components/ui/button"
import { navigation } from '@/constants/navlinks';
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Send, Rss, Pizza } from "lucide-react"
import { socials } from "@/constants/socials"
import { cn } from "@/lib/utils"

function Footer() {

  const substackUrl = socials.find(social => social.label === "Substack")?.href || "https://substack.com/@gr8monk3ys"

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
                href={substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "primary" }), "inline-flex items-center gap-2")}
              >
                <Send className="h-4 w-4" />
                Subscribe to Newsletter
              </a>
              <Link
                href="/api/rss"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "default" }), "inline-flex items-center gap-2")}
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Link>
              <a
                href="https://www.buymeacoffee.com/lorenzoscak"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "default" }), "inline-flex items-center gap-2")}
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
                <TooltipProvider key={social.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "default", size: "icon" }), "rounded-xl")}
                      >
                        <social.icon className="h-4 w-4" />
                        <span className="sr-only">{social.label}</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{social.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Lorenzo Scaturchio. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link href="/stats" className="transition-colors hover:text-primary">
              Stats
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
