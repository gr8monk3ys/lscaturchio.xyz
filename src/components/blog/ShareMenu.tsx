// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import { 
  Share2, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Mail, 
  Link as LinkIcon,
  Copy,
  Check
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

interface ShareMenuProps {
  title: string;
  description?: string;
  url: string;
  size?: "sm" | "md" | "lg";
}

export function ShareMenu({
  title,
  description = "",
  url,
  size = "md",
}: ShareMenuProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description);
  
  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "text-blue-400 hover:text-blue-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "text-blue-600 hover:text-blue-700",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "text-blue-500 hover:text-blue-600",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: "text-stone-500 hover:text-stone-600",
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied to clipboard",
        description: "You can now paste it anywhere",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full ${sizeClasses[size]}`}
          aria-label="Share this content"
        >
          <Share2 className={iconClasses[size]} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {shareLinks.map((link) => (
          <DropdownMenuItem
            key={link.name}
            onClick={() => window.open(link.url, "_blank")}
            className="cursor-pointer"
          >
            <link.icon className={`mr-2 h-4 w-4 ${link.color}`} />
            <span>{link.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              <span>Copy link</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
