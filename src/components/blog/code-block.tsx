"use client";

import { useState, useCallback, useMemo } from "react";
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
    <div className="group relative my-6 rounded-xl border border-border overflow-hidden bg-card">
      {/* Header — a wall label for the listing, not a window chrome. */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-muted/50 border-b border-border/70">
        <div className="flex items-center gap-3">
          {/* Filename or language label */}
          <div className="label-mono flex items-center gap-1.5">
            {languageInfo.icon || <Hash className="h-3.5 w-3.5" />}
            <span>{filename || languageInfo.label}</span>
          </div>

          {/* Line count */}
          <span className="label-mono hidden sm:inline">
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
            className="h-7 px-2 text-muted-foreground hover:text-primary hover:bg-primary/6"
            aria-label={showNumbers ? "Hide line numbers" : "Show line numbers"}
          >
            <Hash className={cn("h-3.5 w-3.5", showNumbers && "text-primary")} />
          </Button>

          {/* Copy button */}
          <Button
            onClick={handleCopy}
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-muted-foreground hover:text-primary hover:bg-primary/6"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-primary">
                <Check className="h-3.5 w-3.5" />
                <span className="label-mono text-primary">Copied!</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="h-3.5 w-3.5" />
                <span className="label-mono hidden sm:inline">Copy</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Code content.

          `tabIndex={0}` and a label, because this scrolls. WCAG 2.1.1: a
          region that can be scrolled has to be reachable by keyboard, and a
          plain `overflow-x-auto` div is not — measured at 390px with 550px of
          content in a 390px box, unreachable by Tab. Long code lines are
          exactly the content a keyboard or screen-reader user most needs to
          pan through.

          `role="region"` with `aria-label` so it is announced as something
          worth entering rather than as an anonymous focus stop, and
          `focus-visible` inherits the site's one focus treatment. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={`${language || "Code"} snippet, scrollable`}
        className={cn(
          "relative overflow-x-auto",
          shouldCollapse && "max-h-[400px] overflow-hidden"
        )}
      >
        <pre
          className={cn(
            // The typography plugin paints .prose pre with gray-200 on a dark
            // ground; the frame is paper now, so force the paper ink instead.
            "p-4 text-sm leading-relaxed text-foreground! bg-transparent!",
            showNumbers && "pl-2",
            className
          )}
          {...props}
        >
          {showNumbers ? (
            <code className="flex">
              {/* Line numbers */}
              <div
                /* Full-strength `text-muted-foreground`, not `/60`.
                    The opacity modifier measured 2.43:1 at 12.6px in BOTH
                    themes, against a 4.5:1 floor — a real WCAG 1.4.3 failure
                    on every essay that shows code, and one I had already
                    claimed did not exist: the note in semantic-search-demo.tsx
                    asserted /lab's snippet was "the only WCAG contrast failure
                    anywhere on the site". It was not, and the claim is
                    corrected there too.
                    Line numbers are content, not a disabled control. The two
                    other `/60` uses in this repo are the exhausted Prev/Next
                    spans, which carry `aria-disabled="true"` and are exempt
                    from 1.4.3 — which is why a blanket ban would be wrong and
                    this is the one instance that moves. */
                className="select-none pr-4 text-right text-muted-foreground border-r border-border mr-4"
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
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-card to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand/collapse button */}
      {isLongCode && (
        <div className="border-t border-border/70">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            className="w-full h-10 rounded-none text-muted-foreground hover:text-primary hover:bg-primary/6"
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
