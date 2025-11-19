"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Link2, Check, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
}

/**
 * Enhanced social share component with platform-specific buttons
 * Includes Twitter, LinkedIn, copy link, and native share fallback
 */
export function SocialShare({ title, description, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && navigator.share;

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
        <Twitter className="h-4 w-4" />
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
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      {/* Copy Link */}
      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 relative"
        aria-label="Copy link"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-green-600" />
              <span className="hidden sm:inline text-green-600">Copied!</span>
            </motion.div>
          ) : (
            <motion.div
              key="link"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </motion.div>
          )}
        </AnimatePresence>
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
