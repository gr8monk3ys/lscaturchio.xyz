// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeCopyButtonProps {
  content: string;
  className?: string;
}

export function CodeCopyButton({
  content,
  className,
}: CodeCopyButtonProps): JSX.Element {
  const [isCopied, setIsCopied] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "absolute right-3 top-3 z-10 rounded-md border border-stone-200 bg-white p-2 text-stone-600 transition-all hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700",
        className
      )}
      aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
