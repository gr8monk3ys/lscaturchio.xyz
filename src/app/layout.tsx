import "./globals.css"
import { Footer } from "@/components/ui/footer-section";
import { Navbar } from "@/components/ui/navbar";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Metadata } from 'next'
import Script from "next/script";
import { ogCardUrl } from "@/lib/seo";
import { Instrument_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
import { IDENTITY } from "@/constants/identity";
import { cookies } from "next/headers";
import { getActiveLanguage, isRtlLanguage } from "@/lib/site-language";
import { DeferredLayoutExtras } from "@/components/layout/deferred-layout-extras";
import { AskDrawerProvider } from "@/components/chat/ask-drawer-provider";
import { AskDrawer } from "@/components/chat/ask-drawer";
import { ConsoleGreeting } from "@/components/layout/console-greeting";
import { MobileNavbarGate } from "@/components/layout/mobile-navbar-gate";
import { MotionProvider } from "@/components/layout/motion-provider";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
const WEBMENTION_DOMAIN = new URL(SITE_URL).hostname.replace(/^www\./, "");
const ENABLE_VERCEL_ANALYTICS = process.env.VERCEL === "1";

const displayFont = Fraunces({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--site-font-display",
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--site-font-body",
});

// Wall-label monospace — metadata, kickers, catalogue numbers.
const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  /**
   * `optional`, not `swap`.
   *
   * This font only ever paints the wall label — 11.5px, uppercase, tracked —
   * and `swap` means the browser renders a fallback, then re-lays-out when
   * IBM Plex Mono arrives. The essay header's meta row (date · reading time ·
   * tags · stage · views) measures 654px in a 672px column: 97% full. So that
   * swap flipped it between one line and two, and the h1, the description and
   * the 16:9 hero plate moved 26px with it.
   *
   * Measured at 0.135 cumulative layout shift on three essays against a 0.15
   * budget — after the view counter, which was a contributor but not the
   * cause. `optional` gives the font about 100ms to arrive and otherwise keeps
   * the fallback for that page load, which for a small uppercase label is a
   * difference almost nobody will notice and nobody will notice twice, since
   * it is cached from then on.
   *
   * `preload: false` stays: preloading it would compete with the body font on
   * the critical path to buy back a difference this small.
   */
  display: "optional",
  preload: false,
  variable: "--site-font-mono",
});

export const metadata: Metadata = {
  title: {
    default: IDENTITY.titleDefault,
    template: '%s | Lorenzo Scaturchio'
  },
  description: IDENTITY.tagline,
  metadataBase: new URL(SITE_URL),
  keywords: ['AI engineer', 'applied machine learning', 'RAG systems', 'retrieval', 'essays', 'technology criticism', 'political economy', 'web development', 'Lorenzo Scaturchio'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Lorenzo Scaturchio Portfolio',
    title: IDENTITY.titleDefault,
    description: IDENTITY.tagline,
    images: [
      {
        url: ogCardUrl({
          title: "Lorenzo Scaturchio",
          description: IDENTITY.role,
          type: "default",
        }),
        width: 1200,
        height: 630,
        alt: `${IDENTITY.name} — ${IDENTITY.role}`
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: IDENTITY.titleDefault,
    description: IDENTITY.tagline,
    images: [ogCardUrl({ title: "Lorenzo Scaturchio", description: IDENTITY.role, type: "default" })],
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

export default async function RootLayout({
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
        jobTitle: IDENTITY.role,
        sameAs: [
          "https://social.lscaturchio.xyz/@gr8monk3ys",
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

  // Resolved on the server from the locale cookie. This was hardcoded to
  // `lang="en" dir="ltr"` and corrected in a client effect, so Arabic shipped
  // mirrored-wrong on first paint and stayed wrong with JavaScript off —
  // against PRODUCT.md's "multilingual is real, not a toy".
  const cookieHeader = (await cookies())
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const language = getActiveLanguage({ cookies: cookieHeader });

  return (
    <html
      lang={language}
      dir={isRtlLanguage(language) ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <head>
        {/* RSS Feed Autodiscovery */}
        <link rel="alternate" type="application/rss+xml" title="Lorenzo Scaturchio Blog RSS" href="/api/rss" />
        <link rel="alternate" type="application/rss+xml" title="Lorenzo Scaturchio Podcast RSS" href="/podcast/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="Lorenzo Scaturchio Changelog RSS" href="/changelog/rss.xml" />

        {/* Webmention endpoints (IndieWeb) */}
        <link rel="webmention" href={`https://webmention.io/${WEBMENTION_DOMAIN}/webmention`} />
        <link rel="pingback" href={`https://webmention.io/${WEBMENTION_DOMAIN}/xmlrpc`} />
        <link rel="me" href="https://social.lscaturchio.xyz/@gr8monk3ys" />

        {/* Core Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Forest Ink, not the pre-palette green. #2c5530 is hue 126; the
            token is #184e35, hue 152. This is the colour framing the site in
            mobile browser chrome. */}
        <meta name="theme-color" content="#184e35" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111317" media="(prefers-color-scheme: dark)" />

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
        <Script id="global-structured-data" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
      </head>
      <body>
        {/* Skip to content link. Positioned off-screen by transform rather than
            clipped with sr-only, so the focused state has a real, measurable box:
            a paper card on a hairline, outlined by the global `:focus-visible`
            rule in globals.css like every other control.

            The reveal stays on `focus:`, not `focus-visible:`. A skip link is
            the one control that can be reached without the heuristic agreeing
            it should be — script, a restored focus position, a browser's own
            "skip to content" affordance — and a link that is focused but still
            translated 300% off-screen is a keyboard trap. */}
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[200] -translate-y-[300%] rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 focus:translate-y-0"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <SmoothScrollProvider />
            <AskDrawerProvider>
              {/* Everything the drawer pushes lives in .site-shell. The fixed
                  header moves separately, via .site-header, because a padded
                  ancestor cannot shift a position-fixed child. */}
              <div className="site-shell">
                {/* Each fallback reserves exactly what its component occupies
                    in flow, or the swap is a layout shift on every route.
                    `Navbar` renders a fixed header plus a `hidden h-20 md:block`
                    spacer, so the fallback is that same spacer — the old
                    `min-h-[64px]` was 16px short of it. `MobileNavbarGate` is
                    fixed and occupies nothing, so its fallback reserved 64px
                    that the resolved component gave straight back. */}
                <Suspense fallback={<div className="hidden h-20 md:block" />}>
                  <Navbar />
                </Suspense>
                <Suspense fallback={null}>
                  <MobileNavbarGate />
                </Suspense>
                {/* `focus:outline-hidden` is deliberate, and allowlisted in
                    design-drift.test.ts: this element exists to receive
                    programmatic focus from the skip link, and the global
                    `:focus-visible` outline would draw a 2px box around the
                    whole page when it did. */}
                <main id="main-content" tabIndex={-1} className="overflow-x-clip focus:outline-hidden">
                  {children}
                </main>
                <DeferredLayoutExtras />
                <ConsoleGreeting />

                <Suspense fallback={<div className="min-h-[200px]"></div>}>
                  <Footer />
                </Suspense>
              </div>

              <AskDrawer />
            </AskDrawerProvider>

            {ENABLE_VERCEL_ANALYTICS && <Analytics />}
            {ENABLE_VERCEL_ANALYTICS && <SpeedInsights />}
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
