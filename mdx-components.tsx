import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/blog/code-block";

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: CodeBlock,
    ...components,
  };
}
