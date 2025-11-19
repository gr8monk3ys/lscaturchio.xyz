"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { logError, logWarn } from "@/lib/logger";

// Add type definition for window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}

export function AdBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdBannerProps) {
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
        logError("AdSense initialization failed", error, { component: "AdBanner", slot });
      }
    } else {
      logWarn("AdSense script not loaded", { component: "AdBanner", slot });
    }
    
    return () => {
      // Clean up if needed
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, [slot]);
  
  return (
    <Card className={`overflow-hidden my-6 ${className}`}>
      <div className="p-1 text-xs text-center text-muted-foreground">Advertisement</div>
      <div ref={adRef} className="flex justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: "100px" }}
          data-ad-client="ca-pub-4505962980988232"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        ></ins>
      </div>
    </Card>
  );
}
