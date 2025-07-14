// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import React from "react";
import { CodeCopyButton } from "./code-copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  filename?: string;
  className?: string;
  highlightLines?: number[];
}

export function CodeBlock({
  children,
  language,
  filename,
  className,
  highlightLines = [],
}: CodeBlockProps): JSX.Element {
  // Extract the code content as string from children
  let codeContent = "";
  
  // Handle when children is a string
  if (typeof children === "string") {
    codeContent = children;
  } 
  // Handle when children is a React element (pre > code structure from MDX)
  else if (React.isValidElement(children) && children.props.children) {
    if (typeof children.props.children === "string") {
      codeContent = children.props.children;
    } else if (
      React.isValidElement(children.props.children) &&
      children.props.children.props?.children
    ) {
      codeContent = children.props.children.props.children;
    }
  }

  return (
    <div className="group relative my-6">
      {filename && (
        <div className="absolute -top-9 left-0 rounded-t-lg border border-b-0 border-stone-200 bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
          {filename}
        </div>
      )}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900",
          filename && "rounded-tl-none",
          className
        )}
      >
        <CodeCopyButton content={codeContent} />
        <div className="overflow-x-auto p-4 text-sm">
          {/* Pass all props to children to maintain syntax highlighting */}
          {React.isValidElement(children) ? (
            React.cloneElement(children as React.ReactElement, {
              className: cn(
                "language-",
                language,
                (children as React.ReactElement).props.className
              ),
            })
          ) : (
            <pre className={cn("language-", language)}>
              <code>{children}</code>
            </pre>
          )}
        </div>
        {language && (
          <div className="absolute bottom-2 right-2 rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 opacity-70 dark:bg-stone-800 dark:text-stone-400">
            {language}
          </div>
        )}
      </div>
    </div>
  );
}
