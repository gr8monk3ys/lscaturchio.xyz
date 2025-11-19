"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailedHTMLProps, HTMLAttributes } from "react";

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;

export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract the code text from children
  const getCodeText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getCodeText).join("");
    if (node && typeof node === "object" && "props" in node) {
      return getCodeText(node.props.children);
    }
    return "";
  };

  const handleCopy = async () => {
    const code = getCodeText(children);
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <pre className={className} {...props}>
        {children}
      </pre>
      <Button
        onClick={handleCopy}
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background border border-gray-200 dark:border-gray-800"
        aria-label="Copy code to clipboard"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span className="ml-1 text-xs">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span className="ml-1 text-xs">Copy</span>
          </>
        )}
      </Button>
    </div>
  );
}
