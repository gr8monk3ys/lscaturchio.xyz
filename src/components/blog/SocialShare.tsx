// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { Twitter, Linkedin, Facebook, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export function SocialShare({
  title,
  url,
  description = "",
  className = "",
  compact = false,
}: SocialShareProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  
  // Ensure we're using the full URL
  const fullUrl = url.startsWith("http") ? url : `https://lscaturchio.xyz${url}`;
  
  // Encoded parameters for share URLs
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);
  
  // Social media share URLs
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
  
  // Copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
  };
  
  // Open share dialog if native sharing is available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (err) {
        console.error("Error sharing: ", err);
      }
    }
  };
  
  // If native sharing is available and on mobile, use that instead
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;
  
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {hasNativeShare && isMobile ? (
          <Button
            onClick={handleNativeShare}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            Share
          </Button>
        ) : (
          <>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter"
              className="rounded-full p-2 text-stone-600 bg-stone-50 dark:bg-stone-700 dark:text-stone-300 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)] hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.05),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.25px_rgba(255,255,255,0.03)] transition-all transform hover:translate-y-[-1px] hover:text-stone-900 dark:hover:text-stone-200"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Facebook"
              className="rounded-full p-2 text-stone-600 bg-stone-50 dark:bg-stone-700 dark:text-stone-300 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)] hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.05),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.25px_rgba(255,255,255,0.03)] transition-all transform hover:translate-y-[-1px] hover:text-stone-900 dark:hover:text-stone-200"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="rounded-full p-2 text-stone-600 bg-stone-50 dark:bg-stone-700 dark:text-stone-300 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)] hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.05),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.25px_rgba(255,255,255,0.03)] transition-all transform hover:translate-y-[-1px] hover:text-stone-900 dark:hover:text-stone-200"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <button
              onClick={copyToClipboard}
              aria-label="Copy link to clipboard"
              className="rounded-full p-2 text-stone-600 bg-stone-50 dark:bg-stone-700 dark:text-stone-300 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)] hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.05),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_0.5px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.25px_rgba(255,255,255,0.03)] transition-all transform hover:translate-y-[-1px] hover:text-stone-900 dark:hover:text-stone-200"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className={`rounded-lg shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] bg-stone-50 dark:bg-stone-800 p-5 border-0 ${className}`}>
      <h3 className="mb-4 text-sm font-medium text-stone-900 dark:text-stone-100">
        Share this article
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {hasNativeShare && (
          <Button
            onClick={handleNativeShare}
            variant="outline"
            size="sm"
            className="flex-1 text-sm"
          >
            Share
          </Button>
        )}
        
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-700 border-0 shadow-[2px_2px_3px_rgba(0,0,0,0.05),-2px_-2px_3px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_3px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.7)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.04)] hover:translate-y-[-1px] transition-all"
        >
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </a>
        
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-700 border-0 shadow-[2px_2px_3px_rgba(0,0,0,0.05),-2px_-2px_3px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_3px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.7)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.04)] hover:translate-y-[-1px] transition-all"
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </a>
        
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-700 border-0 shadow-[2px_2px_3px_rgba(0,0,0,0.05),-2px_-2px_3px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_3px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.7)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.04)] hover:translate-y-[-1px] transition-all"
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </a>
        
        <button
          onClick={copyToClipboard}
          className="inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-700 border-0 shadow-[2px_2px_3px_rgba(0,0,0,0.05),-2px_-2px_3px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_3px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.7)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.04)] hover:translate-y-[-1px] transition-all"
        >
          <LinkIcon className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
