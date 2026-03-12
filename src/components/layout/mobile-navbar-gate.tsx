"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MobileNavbar = dynamic(
  () => import("@/components/ui/mobile-navbar").then((module) => module.MobileNavbar),
  {
    ssr: false,
    loading: () => <div className="min-h-[64px] md:hidden" />,
  }
);

const MOBILE_NAV_MEDIA_QUERY = "(max-width: 767px)";

export function MobileNavbarGate() {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_NAV_MEDIA_QUERY);
    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  if (!isMobileViewport) {
    return null;
  }

  return <MobileNavbar />;
}
