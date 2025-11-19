import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman",
  description: "Explore Lorenzo Scaturchio's portfolio featuring innovative data science projects, web development solutions, and creative digital experiences. Specializing in machine learning, data analysis, and responsive web applications.",
  openGraph: {
    title: "Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman",
    description: "Explore Lorenzo Scaturchio's portfolio featuring innovative data science projects, web development solutions, and creative digital experiences. Specializing in machine learning, data analysis, and responsive web applications.",
    url: "https://lscaturchio.xyz",
    siteName: "Lorenzo Scaturchio Portfolio",
    images: [
      {
        url: '/images/portrait.webp',
        width: 1200,
        height: 630,
        alt: "Lorenzo Scaturchio - Data Scientist and Developer"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorenzo Scaturchio | Data Scientist & Developer",
    description: "Explore Lorenzo Scaturchio's portfolio featuring innovative data science projects, web development solutions, and creative digital experiences.",
    images: ['/images/portrait.webp'],
    creator: "@lscaturchio"
  },
  keywords: ["data scientist", "developer", "portfolio", "machine learning", "data analysis", "web development", "digital solutions", "AI", "programmer", "creative technologist"],
  alternates: {
    canonical: "https://lscaturchio.xyz",
  }
};
