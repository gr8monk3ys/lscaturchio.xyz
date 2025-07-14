"use client";

import React from "react";
import { MDXProvider as BaseMDXProvider } from "@mdx-js/react";

interface MDXProviderProps {
  children: React.ReactNode;
}

// MDX components to be made available to all MDX content
const components = {
  h1: (props: any) => <h1 className="text-4xl font-space-mono font-bold tracking-tight text-stone-800 dark:text-stone-100 mt-8 mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-space-mono font-bold tracking-tight text-stone-800 dark:text-stone-100 mt-6 mb-3" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-space-mono font-bold tracking-tight text-stone-800 dark:text-stone-100 mt-5 mb-2" {...props} />,
  h4: (props: any) => <h4 className="text-xl font-space-mono font-bold tracking-tight text-stone-800 dark:text-stone-100 mt-4 mb-2" {...props} />,
  p: (props: any) => <p className="text-base font-space-mono text-stone-600 dark:text-stone-400 leading-relaxed my-4" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside font-space-mono text-stone-600 dark:text-stone-400 my-4 pl-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside font-space-mono text-stone-600 dark:text-stone-400 my-4 pl-4" {...props} />,
  li: (props: any) => <li className="font-space-mono text-stone-600 dark:text-stone-400 my-1" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-stone-300 dark:border-stone-600 pl-4 italic text-stone-700 dark:text-stone-300 font-space-mono my-4" {...props} />,
  a: (props: any) => <a className="text-stone-700 dark:text-stone-300 font-space-mono underline hover:text-stone-900 dark:hover:text-stone-100 transition-colors" {...props} />,
  code: (props: any) => <code className="bg-stone-100 dark:bg-stone-700 rounded px-1.5 py-0.5 font-space-mono text-stone-700 dark:text-stone-300 text-sm" {...props} />,
  pre: (props: any) => <pre className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 overflow-x-auto shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] font-space-mono my-6" {...props} />,
  table: (props: any) => <div className="overflow-x-auto my-6"><table className="min-w-full font-space-mono border-collapse" {...props} /></div>,
  th: (props: any) => <th className="bg-stone-100 dark:bg-stone-700 font-space-mono font-medium text-left px-4 py-2 text-stone-800 dark:text-stone-200" {...props} />,
  td: (props: any) => <td className="border-t border-stone-200 dark:border-stone-700 font-space-mono px-4 py-2 text-stone-600 dark:text-stone-400" {...props} />,
  hr: (props: any) => <hr className="border-t border-stone-200 dark:border-stone-700 my-6" {...props} />,
};

export function MDXProvider({ children }: MDXProviderProps) {
  return <BaseMDXProvider components={components}>{children}</BaseMDXProvider>;
}
