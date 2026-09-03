"use client";

import { useEffect, useState } from "react";
import { Link2, Check, Share2, Globe, Zap } from "lucide-react";
import { IconBrandTwitter, IconBrandLinkedin } from "@tabler/icons-react";
import { logError } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  title: string;
  description: string;
  /** Canonical URL. Required so this never has to read window.location. */
  url: string;
}

// Share as a row of wall-label links, not a row of pills: the same register
// as the suggested questions on the masthead. One mono label, then the
// destinations, each an underline-on-hover link.
const shareLinkClass =
  "label-mono inline-flex items-center gap-1.5 normal-case tracking-normal text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function SocialShare({ title, description, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  // Detect after mount, not during render: probing navigator while rendering
  // makes the first client render disagree with the server HTML.
  const [hasNativeShare, setHasNativeShare] = useState(false);
  useEffect(() => {
    setHasNativeShare(typeof navigator.share === "function");
  }, []);

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  };

  const handleBlueskyShare = () => {
    const text = `${title}\n${url}`;
    const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
    window.open(blueskyUrl, "_blank", "noopener,noreferrer");
  };

  const handleHackerNewsShare = () => {
    const hnUrl = `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(
      url
    )}&t=${encodeURIComponent(title)}`;
    window.open(hnUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logError("Failed to copy link", error, { component: "SocialShare" });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        logError("Failed to share", error, { component: "SocialShare" });
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <span className="label-mono">Share</span>

      <button type="button" onClick={handleTwitterShare} className={shareLinkClass} aria-label="Share on Twitter">
        <IconBrandTwitter className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Twitter</span>
      </button>

      <button type="button" onClick={handleLinkedInShare} className={shareLinkClass} aria-label="Share on LinkedIn">
        <IconBrandLinkedin className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">LinkedIn</span>
      </button>

      <button type="button" onClick={handleBlueskyShare} className={shareLinkClass} aria-label="Share on Bluesky">
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Bluesky</span>
      </button>

      {/* WCAG 2.5.3 (Label in Name): the accessible name must contain the
          visible label, so it leads with "HN" rather than Hacker News alone. */}
      <button type="button" onClick={handleHackerNewsShare} className={shareLinkClass} aria-label="Share on HN (Hacker News)">
        <Zap className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">HN</span>
      </button>

      <button
        type="button"
        onClick={handleCopyLink}
        className={cn(shareLinkClass, copied && "text-primary")}
        aria-label="Copy link"
        aria-live="polite"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </button>

      {hasNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={cn(shareLinkClass, "sm:hidden")}
          aria-label="Share via native share"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>More</span>
        </button>
      )}
    </div>
  );
}
