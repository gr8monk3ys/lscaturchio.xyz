"use client";

import React, { ErrorInfo, ReactNode } from 'react';

interface MDXErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface MDXErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specific for MDX content to prevent hydration errors
 * from breaking the entire application
 */
export class MDXErrorBoundary extends React.Component<MDXErrorBoundaryProps, MDXErrorBoundaryState> {
  constructor(props: MDXErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): MDXErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("MDX Content Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-6 my-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-900/30">
          <h3 className="text-xl font-space-mono text-red-700 dark:text-red-400 mb-2">
            Error Loading Content
          </h3>
          <p className="text-red-600 dark:text-red-300 font-space-mono text-sm">
            {this.state.error?.message || "An unexpected error occurred while loading the blog content."}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-space-mono text-sm transition-colors duration-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A hook component version for functional components
 */
export function WithMDXErrorBoundary({ children, fallback }: MDXErrorBoundaryProps): JSX.Element {
  return (
    <MDXErrorBoundary fallback={fallback}>
      {children}
    </MDXErrorBoundary>
  );
}
