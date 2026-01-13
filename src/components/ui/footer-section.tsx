"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { navigation } from '@/constants/navlinks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Moon, Send, Sun, Rss, Pizza } from "lucide-react"
import { socials } from "@/constants/socials"

function Footer() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

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
              <Button
                onClick={() => window.open(substackUrl, '_blank')}
                variant="primary"
                className="inline-flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Subscribe to Newsletter
              </Button>
              <Button
                onClick={() => window.open('/api/rss', '_blank')}
                variant="default"
                className="inline-flex items-center gap-2"
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Button>
              <Button
                onClick={() => window.open('https://www.buymeacoffee.com/lorenzoscak', '_blank')}
                variant="default"
                className="inline-flex items-center gap-2"
              >
                <Pizza className="h-4 w-4" />
                Buy me a pizza
              </Button>
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
                      <Button
                        variant="default"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => window.open(social.href, '_blank')}
                      >
                        <social.icon className="h-4 w-4" />
                        <span className="sr-only">{social.label}</span>
                      </Button>
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