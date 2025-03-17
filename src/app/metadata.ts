import { Metadata } from 'next'

// Default metadata for the site
export const metadata: Metadata = {
  metadataBase: new URL('https://lscaturchio.xyz'),
  title: {
    default: 'Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman',
    template: '%s | Lorenzo Scaturchio - Data Scientist & Developer'
  },
  description: 'Explore Lorenzo Scaturchio\'s portfolio showcasing innovative data science projects, web applications, and digital solutions. Specializing in data analysis, machine learning, and creative development for impactful digital experiences.',
  keywords: ['data scientist', 'developer', 'machine learning', 'portfolio', 'data analysis', 'web development', 'digital solutions', 'AI', 'programmer', 'creative technologist'],
  authors: [{ name: 'Lorenzo Scaturchio' }],
  creator: 'Lorenzo Scaturchio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lscaturchio.xyz',
    title: 'Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman',
    description: 'Explore Lorenzo Scaturchio\'s portfolio showcasing innovative data science projects, web applications, and digital solutions. Specializing in data analysis, machine learning, and creative development.',
    siteName: 'Lorenzo Scaturchio Portfolio',
    images: [
      {
        url: 'https://lscaturchio.xyz/images/portrait.jpg',
        width: 1200,
        height: 630,
        alt: 'Lorenzo Scaturchio - Data Scientist and Developer'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lorenzo Scaturchio | Data Scientist & Developer',
    description: 'Explore Lorenzo Scaturchio\'s portfolio showcasing innovative data science projects, web applications, and digital solutions. Specializing in data analysis, machine learning, and creative development.',
    images: ['https://lscaturchio.xyz/images/portrait.jpg'],
    creator: '@lscaturchio'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
  alternates: {
    canonical: 'https://lscaturchio.xyz',
    languages: {
      'en-US': 'https://lscaturchio.xyz',
    },
  },
  category: 'technology',
  applicationName: 'Lorenzo Scaturchio Portfolio',
  other: {
    "og:site_name": "Lorenzo Scaturchio Portfolio",
    "og:image:alt": "Lorenzo Scaturchio - Data Scientist and Developer",
    "twitter:site": "@lscaturchio",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent"
  },
}
