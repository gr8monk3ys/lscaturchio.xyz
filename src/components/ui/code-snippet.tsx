// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeSnippetProps {
  children: React.ReactNode;
  language?: string;
  showLineNumbers?: boolean;
  title?: string;
  source?: string;
  className?: string;
  highlightLines?: number[];
}

export function CodeSnippet({
  children,
  language = "text",
  showLineNumbers = true,
  title,
  source,
  className = "",
  highlightLines = [],
}: CodeSnippetProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  // Function to extract text content from children
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (node == null) return "";

    if (React.isValidElement(node)) {
      const children = React.Children.toArray(node.props.children);
      return children.map(getTextContent).join("");
    }

    if (Array.isArray(node)) {
      return node.map(getTextContent).join("");
    }

    return "";
  };

  const handleCopy = () => {
    const text = getTextContent(children);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative my-6 overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950 ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-2 dark:border-stone-800 dark:bg-stone-900">
          <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
            {title}
          </span>
          <div className="flex items-center gap-2">
            {source && (
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="sr-only">View source</span>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <pre
          className={`overflow-x-auto p-4 text-sm ${
            showLineNumbers ? "pl-12" : ""
          }`}
          data-language={language}
        >
          <code className={`language-${language}`}>{children}</code>
        </pre>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="absolute right-2 top-2 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
