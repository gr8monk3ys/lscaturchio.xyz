import type { MDXComponents } from "mdx/types";
import dynamic from "next/dynamic";
import { CodeBlock } from "@/components/blog/code-block";

// Dynamically import Sandpack components to reduce initial bundle size (~200KB savings)
const CodePlayground = dynamic(
  () => import("@/components/blog/code-playground").then((mod) => mod.CodePlayground),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

const ReactPlayground = dynamic(
  () => import("@/components/blog/code-playground").then((mod) => mod.ReactPlayground),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

const CSSPlayground = dynamic(
  () => import("@/components/blog/code-playground").then((mod) => mod.CSSPlayground),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

const JavaScriptPlayground = dynamic(
  () => import("@/components/blog/code-playground").then((mod) => mod.JavaScriptPlayground),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    pre: CodeBlock,
    // Interactive code playgrounds (Sandpack) - loaded dynamically
    CodePlayground,
    ReactPlayground,
    CSSPlayground,
    JavaScriptPlayground,
    ...components,
  };
}
