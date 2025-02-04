import { Metadata } from 'next'

const defaultMetadata: Metadata = {
  title: {
    default: 'Lorenzo Scaturchio - Data Scientist & Developer',
    template: '%s | Lorenzo Scaturchio'
  },
  description: 'Data Scientist, Musician, and Outdoor Enthusiast crafting digital experiences that make a difference.',
  keywords: ['Data Science', 'Machine Learning', 'Web Development', 'Python', 'React', 'Next.js'],
  authors: [{ name: 'Lorenzo Scaturchio' }],
  creator: 'Lorenzo Scaturchio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lscaturchio.xyz',
    siteName: 'Lorenzo Scaturchio',
    title: 'Lorenzo Scaturchio - Data Scientist & Developer',
    description: 'Data Scientist, Musician, and Outdoor Enthusiast crafting digital experiences that make a difference.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lorenzo Scaturchio'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lorenzo Scaturchio - Data Scientist & Developer',
    description: 'Data Scientist, Musician, and Outdoor Enthusiast crafting digital experiences that make a difference.',
    images: ['/images/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  }
}

export default defaultMetadata
