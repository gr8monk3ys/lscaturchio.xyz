"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from '@/lib/motion';
import { Check, Copy, ChevronDown, ChevronUp, Hash, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
  showLineNumbers?: boolean;
  maxLines?: number;
  filename?: string;
};

// Language icons and labels mapping
const languageMap: Record<string, { label: string; icon?: ReactNode }> = {
  javascript: { label: "JavaScript" },
  js: { label: "JavaScript" },
  typescript: { label: "TypeScript" },
  ts: { label: "TypeScript" },
  tsx: { label: "TypeScript (React)" },
  jsx: { label: "JavaScript (React)" },
  python: { label: "Python" },
  py: { label: "Python" },
  bash: { label: "Bash", icon: <Terminal className="h-3.5 w-3.5" /> },
  sh: { label: "Shell", icon: <Terminal className="h-3.5 w-3.5" /> },
  shell: { label: "Shell", icon: <Terminal className="h-3.5 w-3.5" /> },
  zsh: { label: "Zsh", icon: <Terminal className="h-3.5 w-3.5" /> },
  json: { label: "JSON" },
  html: { label: "HTML" },
  css: { label: "CSS" },
  scss: { label: "SCSS" },
  sql: { label: "SQL" },
  yaml: { label: "YAML" },
  yml: { label: "YAML" },
  markdown: { label: "Markdown" },
  md: { label: "Markdown" },
  mdx: { label: "MDX" },
  rust: { label: "Rust" },
  go: { label: "Go" },
  java: { label: "Java" },
  kotlin: { label: "Kotlin" },
  swift: { label: "Swift" },
  ruby: { label: "Ruby" },
  php: { label: "PHP" },
  csharp: { label: "C#" },
  cpp: { label: "C++" },
  c: { label: "C" },
  graphql: { label: "GraphQL" },
  dockerfile: { label: "Dockerfile" },
  docker: { label: "Docker" },
  nginx: { label: "Nginx" },
  toml: { label: "TOML" },
  env: { label: "Environment" },
  text: { label: "Plain Text" },
  plaintext: { label: "Plain Text" },
};

export function CodeBlock({
  children,
  className,
  showLineNumbers = true,
  maxLines = 20,
  filename,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNumbersOverride, setShowNumbersOverride] = useState<boolean | null>(null);

  // Extract language from className
  const language = useMemo(() => {
    const match = className?.match(/language-(\w+)/);
    return match ? match[1].toLowerCase() : "text";
  }, [className]);

  // Get language info
  const languageInfo = languageMap[language] || { label: language.toUpperCase() };

  // Get code content - extract text from children recursively
  const codeText = useMemo(() => {
    const getCodeText = (node: React.ReactNode): string => {
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(getCodeText).join("");
      if (node && typeof node === "object" && "props" in node) {
        const nodeWithProps = node as { props: { children?: React.ReactNode } };
        return getCodeText(nodeWithProps.props.children);
      }
      return "";
    };
    return getCodeText(children);
  }, [children]);
  const lines = useMemo(() => codeText.split("\n"), [codeText]);
  const lineNumbers = useMemo(
    () => Array.from({ length: lines.length }, (_, lineIndex) => lineIndex + 1),
    [lines.length]
  );
  const totalLines = lines.length;
  const isLongCode = totalLines > maxLines;
  const shouldCollapse = isLongCode && !isExpanded;
  const showNumbers = showNumbersOverride ?? showLineNumbers;

  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = codeText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [codeText]);

  return (
    <div className="group relative my-6 rounded-xl border border-border overflow-hidden bg-zinc-950 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 dark:bg-zinc-800/50 border-b border-border/50">
        <div className="flex items-center gap-2">
          {/* Traffic lights decoration */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          {/* Filename or language label */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            {languageInfo.icon || <Hash className="h-3.5 w-3.5" />}
            <span className="font-medium">
              {filename || languageInfo.label}
            </span>
          </div>

          {/* Line count */}
          <span className="text-xs text-zinc-500 hidden sm:inline">
            {totalLines} line{totalLines !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Line numbers toggle */}
          <Button
            onClick={() => {
              setShowNumbersOverride((prev) => (prev === null ? !showLineNumbers : !prev));
            }}
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            aria-label={showNumbers ? "Hide line numbers" : "Show line numbers"}
          >
            <Hash className={cn("h-3.5 w-3.5", showNumbers && "text-primary")} />
          </Button>

          {/* Copy button */}
          <Button
            onClick={handleCopy}
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            aria-label="Copy code to clipboard"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="flex items-center gap-1 text-green-400"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-xs">Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs hidden sm:inline">Copy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div
        className={cn(
          "relative overflow-x-auto",
          shouldCollapse && "max-h-[400px] overflow-hidden"
        )}
      >
        <pre
          className={cn(
            "p-4 text-sm leading-relaxed",
            showNumbers && "pl-2",
            className
          )}
          {...props}
        >
          {showNumbers ? (
            <code className="flex">
              {/* Line numbers */}
              <div
                className="select-none pr-4 text-right text-zinc-600 border-r border-zinc-800 mr-4"
                aria-hidden="true"
              >
                {lineNumbers.map((lineNumber) => (
                  <div key={`line-number-${lineNumber}`} className="leading-relaxed">
                    {lineNumber}
                  </div>
                ))}
              </div>
              {/* Code */}
              <div className="flex-1">{children}</div>
            </code>
          ) : (
            children
          )}
        </pre>

        {/* Collapse gradient */}
        {shouldCollapse && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 dark:from-zinc-900 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand/collapse button */}
      {isLongCode && (
        <div className="border-t border-border/50">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            className="w-full h-10 rounded-none text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show {totalLines - maxLines} more lines
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Simple inline code styling
export function InlineCode({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.4rem] py-[0.2rem] font-mono text-sm",
        "before:content-none after:content-none",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}
