"use client";

import { useEffect, useRef } from "react";
import { logError, logWarn } from "@/lib/logger";

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

interface InArticleAdProps {
  slot: string;
  className?: string;
}

export function InArticleAd({ slot, className = "" }: InArticleAdProps) {
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
        logError("AdSense initialization failed", error, { component: "InArticleAd", slot });
      }
    } else {
      logWarn("AdSense script not loaded", { component: "InArticleAd", slot });
    }
    
    return () => {
      // Clean up if needed
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, [slot]);
  
  return (
    <div ref={adRef} className={`my-8 text-center ${className}`}>
      <div className="text-xs text-center text-muted-foreground mb-1">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-4505962980988232"
        data-ad-slot={slot}
      ></ins>
    </div>
  );
}
