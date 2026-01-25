"use client";

import { useState, useCallback } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackConsole,
  useSandpack,
  SandpackTheme,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { RotateCcw, Maximize2, Minimize2, Play, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CodePlaygroundProps {
  files: Record<string, string>;
  template?: "react" | "vanilla" | "static";
  showPreview?: boolean;
  showConsole?: boolean;
  editorHeight?: string;
  autorun?: boolean;
  readOnly?: boolean;
}

// Custom theme matching the site's color scheme
const lightTheme: SandpackTheme = {
  colors: {
    surface1: "#f5f5f5",
    surface2: "#e5e5e5",
    surface3: "#d4d4d4",
    clickable: "#737373",
    base: "#404040",
    disabled: "#a3a3a3",
    hover: "#262626",
    accent: "#3d6b1f",
    error: "#dc2626",
    errorSurface: "#fef2f2",
  },
  syntax: {
    plain: "#404040",
    comment: { color: "#a3a3a3", fontStyle: "italic" },
    keyword: "#3d6b1f",
    tag: "#3d6b1f",
    punctuation: "#525252",
    definition: "#0d9488",
    property: "#2563eb",
    static: "#9333ea",
    string: "#c2410c",
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    size: "14px",
    lineHeight: "1.6",
  },
};

const darkTheme: SandpackTheme = {
  colors: {
    surface1: "#18181b",
    surface2: "#27272a",
    surface3: "#3f3f46",
    clickable: "#a1a1aa",
    base: "#fafafa",
    disabled: "#71717a",
    hover: "#f4f4f5",
    accent: "#84cc16",
    error: "#f87171",
    errorSurface: "#450a0a",
  },
  syntax: {
    plain: "#e4e4e7",
    comment: { color: "#71717a", fontStyle: "italic" },
    keyword: "#84cc16",
    tag: "#84cc16",
    punctuation: "#a1a1aa",
    definition: "#2dd4bf",
    property: "#60a5fa",
    static: "#c084fc",
    string: "#fb923c",
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
    size: "14px",
    lineHeight: "1.6",
  },
};

// Reset button component that uses Sandpack context
function ResetButton({ originalFiles }: { originalFiles: Record<string, string> }) {
  const { sandpack } = useSandpack();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = useCallback(() => {
    setIsResetting(true);
    Object.entries(originalFiles).forEach(([path, code]) => {
      sandpack.updateFile(path, code);
    });
    setTimeout(() => setIsResetting(false), 300);
  }, [sandpack, originalFiles]);

  return (
    <Button
      onClick={handleReset}
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
      aria-label="Reset code to original"
    >
      <motion.div
        animate={{ rotate: isResetting ? -360 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </motion.div>
      <span className="text-xs ml-1 hidden sm:inline">Reset</span>
    </Button>
  );
}

// Run button for manual execution
function RunButton() {
  const { sandpack } = useSandpack();

  return (
    <Button
      onClick={() => sandpack.runSandpack()}
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
      aria-label="Run code"
    >
      <Play className="h-3.5 w-3.5" />
      <span className="text-xs ml-1 hidden sm:inline">Run</span>
    </Button>
  );
}

export function CodePlayground({
  files,
  template = "react",
  showPreview = true,
  showConsole = false,
  editorHeight = "400px",
  autorun = true,
  readOnly = false,
}: CodePlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "console">("preview");

  const isDark = resolvedTheme === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  // Normalize file paths to ensure they start with /
  const normalizedFiles = Object.entries(files).reduce(
    (acc, [path, code]) => {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      acc[normalizedPath] = code;
      return acc;
    },
    {} as Record<string, string>
  );

  // Template-specific setup
  const templateConfig = {
    react: {
      template: "react" as const,
      customSetup: {
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
        },
      },
    },
    vanilla: {
      template: "vanilla" as const,
      customSetup: {},
    },
    static: {
      template: "static" as const,
      customSetup: {},
    },
  };

  const config = templateConfig[template];

  return (
    <div
      className={cn(
        "group relative my-8 rounded-xl border border-border overflow-hidden bg-zinc-950 dark:bg-zinc-900",
        isExpanded && "fixed inset-4 z-50 m-0"
      )}
    >
      <SandpackProvider
        {...config}
        files={normalizedFiles}
        theme={theme}
        options={{
          autorun,
          recompileMode: "delayed",
          recompileDelay: 500,
          classes: {
            "sp-wrapper": "!rounded-none !border-0",
            "sp-layout": "!rounded-none !border-0",
          },
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 dark:bg-zinc-800/50 border-b border-border/50">
          <div className="flex items-center gap-2">
            {/* Traffic lights decoration */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>

            <span className="text-xs text-zinc-400 font-medium">
              Interactive Playground
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {template === "react" ? "React" : template === "vanilla" ? "JavaScript" : "HTML/CSS"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {!autorun && <RunButton />}
            <ResetButton originalFiles={normalizedFiles} />
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              aria-label={isExpanded ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Sandpack Layout */}
        <SandpackLayout
          style={{
            borderRadius: 0,
            border: "none",
          }}
        >
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            closableTabs={false}
            readOnly={readOnly}
            style={{
              height: isExpanded ? "calc(100vh - 120px)" : editorHeight,
              minHeight: "200px",
            }}
          />
          {(showPreview || showConsole) && (
            <div
              className="flex flex-col"
              style={{
                height: isExpanded ? "calc(100vh - 120px)" : editorHeight,
                minHeight: "200px",
              }}
            >
              {/* Preview/Console tabs */}
              {showPreview && showConsole && (
                <div className="flex border-b border-zinc-800">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={cn(
                      "px-4 py-2 text-xs font-medium transition-colors",
                      activeTab === "preview"
                        ? "text-zinc-200 border-b-2 border-lime-500"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab("console")}
                    className={cn(
                      "px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1",
                      activeTab === "console"
                        ? "text-zinc-200 border-b-2 border-lime-500"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <Terminal className="h-3 w-3" />
                    Console
                  </button>
                </div>
              )}

              {/* Preview or Console */}
              <div className="flex-1 overflow-hidden">
                {showPreview && (activeTab === "preview" || !showConsole) && (
                  <SandpackPreview
                    showNavigator={false}
                    showRefreshButton
                    showOpenInCodeSandbox={false}
                    style={{ height: "100%" }}
                  />
                )}
                {showConsole && (activeTab === "console" || !showPreview) && (
                  <SandpackConsole
                    showHeader={false}
                    style={{ height: "100%" }}
                  />
                )}
              </div>
            </div>
          )}
        </SandpackLayout>
      </SandpackProvider>

      {/* Fullscreen overlay backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// Convenience components for common use cases
export function ReactPlayground({
  code,
  showConsole = false,
  ...props
}: Omit<CodePlaygroundProps, "files" | "template"> & { code: string }) {
  return (
    <CodePlayground
      files={{ "/App.js": code }}
      template="react"
      showConsole={showConsole}
      {...props}
    />
  );
}

export function CSSPlayground({
  html,
  css,
  ...props
}: Omit<CodePlaygroundProps, "files" | "template"> & {
  html: string;
  css: string;
}) {
  return (
    <CodePlayground
      files={{
        "/index.html": html,
        "/styles.css": css,
      }}
      template="static"
      {...props}
    />
  );
}

export function JavaScriptPlayground({
  code,
  html = '<div id="app"></div>',
  ...props
}: Omit<CodePlaygroundProps, "files" | "template"> & {
  code: string;
  html?: string;
}) {
  return (
    <CodePlayground
      files={{
        "/index.html": html,
        "/index.js": code,
      }}
      template="vanilla"
      showConsole
      {...props}
    />
  );
}
