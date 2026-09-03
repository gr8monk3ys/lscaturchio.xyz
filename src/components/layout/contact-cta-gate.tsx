"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

const ContactCTA = dynamic(
  () => import("@/components/ui/contact-cta").then((module) => module.ContactCTA),
  { ssr: false, loading: () => null }
);

// The CTA is an allowlist, not a blocklist. It used to render everywhere
// except a handful of pages, which put a consulting pitch on the guestbook,
// the photography page, the movie diary and the 404. The garden pages are
// personal; selling on them is the wrong move, and pitching someone who just
// hit a broken link is worse. Selling belongs where the visitor came to buy.
const CONTACT_CTA_PATHS = new Set<string>(["/projects"]);

export function ContactCTAGate() {
  const pathname = usePathname();

  if (!pathname) return null;
  if (!CONTACT_CTA_PATHS.has(pathname)) return null;

  return (
    <Suspense fallback={<div className="min-h-[200px]" />}>
      <ContactCTA />
    </Suspense>
  );
}
