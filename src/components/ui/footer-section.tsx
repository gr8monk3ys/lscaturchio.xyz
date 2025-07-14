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
import { FooterShortcuts } from "@/components/ui/footer-shortcuts"

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
    <footer className="relative bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100 shadow-[0_-3px_6px_rgba(0,0,0,0.05),0_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[0_-3px_6px_rgba(0,0,0,0.2),0_-1px_3px_rgba(255,255,255,0.05)] transition-all duration-300">
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
                className="neu-button inline-flex items-center gap-2 bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.7)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.3),-0.5px_-0.5px_1px_rgba(255,255,255,0.05)] transform active:scale-98 transition-all"
              >
                <Send className="h-4 w-4" />
                Subscribe to Newsletter
              </Button>
              <Button
                onClick={() => window.open('/api/rss', '_blank')}
                variant="outline"
                className="inline-flex items-center gap-2 rounded-lg bg-stone-50 dark:bg-stone-800 border-none shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.04)] hover:shadow-[2px_2px_3px_rgba(0,0,0,0.1),-2px_-2px_3px_rgba(255,255,255,0.7)] dark:hover:shadow-[2px_2px_3px_rgba(0,0,0,0.3),-2px_-2px_3px_rgba(255,255,255,0.05)] transition-all"
              >
                <Rss className="h-4 w-4" />
                RSS Feed
              </Button>
              <Button
                onClick={() => window.open('https://www.buymeacoffee.com/lorenzoscak', '_blank')}
                variant="outline"
                className="inline-flex items-center gap-2 rounded-lg bg-stone-50 dark:bg-stone-800 border-none shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.04)] hover:shadow-[2px_2px_3px_rgba(0,0,0,0.1),-2px_-2px_3px_rgba(255,255,255,0.7)] dark:hover:shadow-[2px_2px_3px_rgba(0,0,0,0.3),-2px_-2px_3px_rgba(255,255,255,0.05)] transition-all"
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
                  className="block transition-all hover:text-primary hover:pl-1"
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
              <p>Email: lorenzosca7@gmail.com</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Me</h3>
            <div className="mb-6 flex flex-wrap gap-4">
              {socials.map((social) => (
                <TooltipProvider key={social.label}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full bg-stone-50 dark:bg-stone-800 border-none shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] transform hover:scale-105 active:scale-95 transition-all"
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-t border-stone-200 dark:border-stone-800 pt-8 mt-8">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Lorenzo Scaturchio. All rights reserved.
          </p>
          <div className="flex flex-col gap-2 md:flex-row md:gap-4 mt-4 md:mt-0">
            <nav className="flex gap-4 text-sm">
              <a href="/privacy-policy" className="transition-all hover:text-primary hover:underline">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="transition-all hover:text-primary hover:underline">
                Terms of Service
              </a>
            </nav>
            <FooterShortcuts />
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }