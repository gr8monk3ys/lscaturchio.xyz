"use client";

import { useEffect, useRef } from "react";
import { logError, logWarn } from "@/lib/logger";

// Google AdSense client ID
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-4505962980988232";

// Type definition for Google AdSense
interface AdSenseConfig {
  google_ad_client?: string;
  enable_page_level_ads?: boolean;
  [key: string]: unknown;
}

// Add type definition for window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: AdSenseConfig[];
  }
}

/**
 * Custom hook for Google AdSense initialization and cleanup
 * Reduces code duplication between AdBanner and InArticleAd components
 */
export function useAdSense(slot: string, componentName: string) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Store ref value for cleanup
    const currentRef = adRef.current;

    // Check if Google AdSense is loaded
    if (window.adsbygoogle) {
      try {
        // Push the ad to AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        logError("AdSense initialization failed", error, {
          component: componentName,
          slot,
        });
      }
    } else {
      logWarn("AdSense script not loaded", { component: componentName, slot });
    }

    return () => {
      // Clean up ad container on unmount (safe - only clears content)
      if (currentRef) {
        currentRef.textContent = "";
      }
    };
  }, [slot, componentName]);

  return adRef;
}
