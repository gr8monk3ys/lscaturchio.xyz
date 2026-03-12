"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ContactCTAGate = dynamic(
  () =>
    import("@/components/layout/contact-cta-gate").then(
      (module) => module.ContactCTAGate
    ),
  { ssr: false, loading: () => null }
);

const ClientEnhancements = dynamic(
  () =>
    import("@/components/layout/client-enhancements").then(
      (module) => module.ClientEnhancements
    ),
  { ssr: false, loading: () => null }
);

function scheduleIdleWork(callback: () => void, timeout = 1200) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const idleCallbackId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(idleCallbackId);
  }

  const timeoutId = globalThis.setTimeout(callback, 1);
  return () => globalThis.clearTimeout(timeoutId);
}

export function DeferredLayoutExtras() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    return scheduleIdleWork(() => {
      setShouldLoad(true);
    });
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      <ContactCTAGate />
      <ClientEnhancements />
    </>
  );
}
