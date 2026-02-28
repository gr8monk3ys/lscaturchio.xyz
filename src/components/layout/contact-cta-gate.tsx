"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { ContactCTA } from "@/components/ui/contact-cta";

const CONTACT_CTA_EXCLUDED_PATHS = new Set<string>([
  "/chat",
  "/contact",
  "/services",
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
