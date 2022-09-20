"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

const ContactCTA = dynamic(
  () => import("@/components/ui/contact-cta").then((module) => module.ContactCTA),
  { ssr: false, loading: () => null }
);

const CONTACT_CTA_EXCLUDED_PATHS = new Set<string>([
  "/chat",
  "/contact",
  "/services",
  "/work-with-me",
]);

export function ContactCTAGate() {
  const pathname = usePathname();

  if (!pathname) return null;
  if (pathname === "/") return null;
  if (pathname.startsWith("/blog")) return null;
  if (CONTACT_CTA_EXCLUDED_PATHS.has(pathname)) return null;

  return (
    <Suspense fallback={<div className="min-h-[200px]" />}>
      <ContactCTA />
    </Suspense>
  );
}
