import "./globals.css"
import { Footer } from "@/components/ui/footer-section";
import { Navbar } from "@/components/ui/navbar";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { MobileNavbar } from "@/components/ui/mobile-navbar"
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { PWARegister } from '@/components/pwa-register'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { LayoutWrapper } from '@/components/layout/layout-wrapper'
import { CanonicalLink } from '@/components/layout/canonical-link'
import { HreflangLinks } from "@/components/layout/hreflang-links";
import { GoogleTranslateProvider } from "@/components/i18n/google-translate";
import { HtmlLangSync } from "@/components/i18n/html-lang-sync";
import { Metadata } from 'next'
import { ogCardUrl } from "@/lib/seo";
import { Instrument_Sans, Fraunces } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
const WEBMENTION_DOMAIN = new URL(SITE_URL).hostname.replace(/^www\./, "");

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: 'Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman',
    template: '%s | Lorenzo Scaturchio'
  },
  description: 'Explore Lorenzo Scaturchio\'s portfolio featuring innovative data science projects, web development solutions, and creative digital experiences. Specializing in machine learning, data analysis, and responsive web applications.',
  metadataBase: new URL(SITE_URL),
  keywords: ['data scientist', 'developer', 'portfolio', 'machine learning', 'data analysis', 'web development', 'digital solutions', 'AI', 'programmer', 'creative technologist'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Lorenzo Scaturchio Portfolio',
    title: 'Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman',
    description: 'Explore Lorenzo Scaturchio\'s portfolio featuring innovative data science projects, web development solutions, and creative digital experiences.',
    images: [
      {
        url: ogCardUrl({
          title: "Lorenzo Scaturchio",
          description: "Data Scientist & Developer",
          type: "default",
        }),
        width: 1200,
        height: 630,
        alt: 'Lorenzo Scaturchio - Data Scientist and Developer'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lorenzo Scaturchio | Data Scientist & Developer',
    description: 'Explore Lorenzo Scaturchio\'s portfolio featuring innovative data science projects, web development solutions, and creative digital experiences.',
    images: [ogCardUrl({ title: "Lorenzo Scaturchio", description: "Data Scientist & Developer", type: "default" })],
    creator: '@lscaturchio'
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      'application/rss+xml': '/api/rss',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Lorenzo Scaturchio",
        description:
          "Personal site for Lorenzo Scaturchio: RAG systems, machine learning, web development, and writing.",
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Lorenzo Scaturchio",
        url: SITE_URL,
        image: `${SITE_URL}/images/portrait.webp`,
        jobTitle: "Data Scientist & Developer",
        sameAs: [
          "https://github.com/gr8monk3ys",
          "https://linkedin.com/in/lorenzo-scaturchio",
          "https://www.instagram.com/lorenzo.scaturchio",
          "https://letterboxd.com/gr8monk3ys/",
          "https://www.goodreads.com/user/show/168274083-lorenzo",
          "https://leetcode.com/u/gr8monk3ys/",
          "https://substack.com/@gr8monk3ys",
        ],
      },
    ],
  };

  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <head>
        {/* Canonical Link - Client Component for dynamic pathname */}
        <CanonicalLink />
        {/* Hreflang Links - Client Component for dynamic pathname */}
        <HreflangLinks />

        {/* RSS Feed Autodiscovery */}
        <link rel="alternate" type="application/rss+xml" title="Lorenzo Scaturchio Blog RSS" href="/api/rss" />
        <link rel="alternate" type="application/rss+xml" title="Lorenzo Scaturchio Podcast RSS" href="/podcast/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="Lorenzo Scaturchio Changelog RSS" href="/changelog/rss.xml" />

        {/* Webmention endpoints (IndieWeb) */}
        <link rel="webmention" href={`https://webmention.io/${WEBMENTION_DOMAIN}/webmention`} />
        <link rel="pingback" href={`https://webmention.io/${WEBMENTION_DOMAIN}/xmlrpc`} />

        {/* Core Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="theme-color" content="#2c5530" />

        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lorenzo S." />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Performance Hints */}
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />

        {/* Global JSON-LD structured data (site-wide) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <GoogleTranslateProvider />
        <HtmlLangSync />

        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div className="min-h-[64px]"></div>}>
            <Navbar />
          </Suspense>
          <Suspense fallback={<div className="min-h-[64px] md:hidden"></div>}>
            <MobileNavbar />
          </Suspense>

          {/* LayoutWrapper handles pathname-dependent ContactCTA */}
          <LayoutWrapper>
            {children}
          </LayoutWrapper>

          <Suspense fallback={<div className="min-h-[200px]"></div>}>
            <Footer />
          </Suspense>

          {/* Load analytics with low priority */}
          <Analytics />
          <SpeedInsights />
          <PWARegister />
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
