// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Twitter, Linkedin, Github, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialLink {
  platform: "twitter" | "linkedin" | "github" | "email";
  url: string;
}

interface AuthorCardProps {
  name: string;
  avatar: string;
  role?: string;
  bio?: string;
  longBio?: string;
  socialLinks?: SocialLink[];
  className?: string;
  compact?: boolean;
}

export function AuthorCard({
  name,
  avatar,
  role = "Author",
  bio,
  longBio,
  socialLinks = [],
  className,
  compact = false,
}: AuthorCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  // Get social icon component based on platform
  const getSocialIcon = (platform: SocialLink["platform"]) => {
    switch (platform) {
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "github":
        return <Github className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Format url for email
  const formatUrl = (platform: SocialLink["platform"], url: string) => {
    if (platform === "email" && !url.startsWith("mailto:")) {
      return `mailto:${url}`;
    }
    return url;
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3",
        className
      )}>
        <Image
          src={avatar}
          alt={name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div>
          <div className="font-medium text-stone-900 dark:text-stone-100">{name}</div>
          {role && <div className="text-sm text-stone-500 dark:text-stone-400">{role}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950",
      className
    )}>
      <div className="flex items-center gap-4">
        <Image
          src={avatar}
          alt={name}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">{name}</h3>
          {role && <div className="text-stone-600 dark:text-stone-400">{role}</div>}
          
          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="mt-2 flex gap-2">
              {socialLinks.map((link, index) => (
                <Link 
                  key={index}
                  href={formatUrl(link.platform, link.url)}
                  target={link.platform !== "email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={`${name}'s ${link.platform}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    {getSocialIcon(link.platform)}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="mt-4 text-sm text-stone-600 dark:text-stone-400">
          <p>{bio}</p>
        </div>
      )}

      {/* Expandable long bio */}
      {longBio && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex w-full items-center justify-between px-0 text-stone-600 hover:bg-transparent hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            onClick={() => setExpanded(!expanded)}
          >
            <span>{expanded ? "Show less" : "Read more about the author"}</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  <p>{longBio}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
