import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { twMerge } from "tailwind-merge";
import { Footer } from "@/components/ui/footer-section";
import { Navbar } from "@/components/ui/navbar";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lorenzo Scaturchio",
  description: "Data Scientist, Musician, and Outdoor Enthusiast",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={twMerge("scroll-smooth", inter.variable)}>
      <body className="min-h-screen antialiased">
        <Navbar />
        <div className="flex-1 relative">
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            <main className="relative">
              {children}
              <SpeedInsights />
              <Analytics />
            </main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
