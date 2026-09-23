"use client";

import dynamic from "next/dynamic";

/**
 * Vercel Analytics and Speed Insights, loaded after hydration.
 *
 * Neither affects what a reader sees, so neither belongs in the initial
 * bundle (react-best-practices: bundle-defer-third-party). `ssr: false` has to
 * live in a client component; the root layout is a server component.
 */
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false }
);

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false }
);

export function VercelInsights() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
