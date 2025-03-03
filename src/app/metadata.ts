import { Metadata } from 'next'

// Default metadata for the site
export const metadata: Metadata = {
  metadataBase: new URL('https://lscaturchio.xyz'),
  title: {
    default: 'Lorenzo Scaturchio | Developer & Designer',
    template: '%s | Lorenzo Scaturchio'
  },
  description: 'Personal website and portfolio of Lorenzo Scaturchio, showcasing projects, blog posts, and services.',
  keywords: ['developer', 'designer', 'portfolio', 'blog', 'projects', 'services'],
  authors: [{ name: 'Lorenzo Scaturchio' }],
  creator: 'Lorenzo Scaturchio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lscaturchio.xyz',
    title: 'Lorenzo Scaturchio | Developer & Designer',
    description: 'Personal website and portfolio of Lorenzo Scaturchio, showcasing projects, blog posts, and services.',
    siteName: 'Lorenzo Scaturchio',
    images: [
      {
        url: 'https://lscaturchio.xyz/images/portrait.jpg',
        width: 1200,
        height: 630,
        alt: 'Lorenzo Scaturchio'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lorenzo Scaturchio | Developer & Designer',
    description: 'Personal website and portfolio of Lorenzo Scaturchio, showcasing projects, blog posts, and services.',
    images: ['https://lscaturchio.xyz/images/portrait.jpg']
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
}
