"use client"

import { buttonVariants } from "@/components/ui/button"
import { navigation } from '@/constants/navlinks';
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
              Subscribe to my AI News newsletter for the latest updates in artificial intelligence, machine learning, and tech innovations.
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
              <a
                href="/api/rss"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "default" }), "inline-flex items-center gap-2")}
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </a>
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
                <a
                  key={item.name}
                  href={item.href}
                  className="block transition-colors hover:text-primary"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>Los Angeles, California</p>
              <p>United States</p>
              <p>Email: lorenzosca7@protonmail.ch</p>
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
            <a href="/stats" className="transition-colors hover:text-primary">
              Stats
            </a>
            <a href="/privacy-policy" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footer }