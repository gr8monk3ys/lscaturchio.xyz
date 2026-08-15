"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check, Share2, Globe, Zap } from "lucide-react";
import { IconBrandTwitter, IconBrandLinkedin } from "@tabler/icons-react";
import { logError } from "@/lib/logger";

interface SocialShareProps {
  title: string;
  description: string;
  /** Canonical URL. Required so this never has to read window.location. */
  url: string;
}

/**
 * Enhanced social share component with platform-specific buttons
 * Includes Twitter, LinkedIn, copy link, and native share fallback
 */
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">
        Share:
      </span>

      {/* Twitter Share */}
      <Button
        onClick={handleTwitterShare}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        aria-label="Share on Twitter"
      >
        <IconBrandTwitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>

      {/* LinkedIn Share */}
      <Button
        onClick={handleLinkedInShare}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        aria-label="Share on LinkedIn"
      >
        <IconBrandLinkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      {/* Bluesky Share */}
      <Button
        onClick={handleBlueskyShare}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        aria-label="Share on Bluesky"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">Bluesky</span>
      </Button>

      {/* Hacker News Share. WCAG 2.5.3 (Label in Name): the accessible name
          must contain the visible label, so it leads with "HN" rather than
          spelling out Hacker News alone. */}
      <Button
        onClick={handleHackerNewsShare}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        aria-label="Share on HN (Hacker News)"
      >
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">HN</span>
      </Button>

      {/* Copy Link */}
      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 relative"
        aria-label="Copy link"
      >
        <div className="flex items-center gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="hidden sm:inline text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </>
          )}
        </div>
      </Button>

      {/* Native Share (mobile fallback) */}
      {hasNativeShare && (
        <Button
          onClick={handleNativeShare}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 sm:hidden"
          aria-label="Share via native share"
        >
          <Share2 className="h-4 w-4" />
          <span>More</span>
        </Button>
      )}
    </div>
  );
}
