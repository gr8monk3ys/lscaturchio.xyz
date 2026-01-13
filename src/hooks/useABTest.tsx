"use client";

import { useState, useEffect } from "react";
import {
  getVariant,
  trackVariantView,
  experiments,
  type Experiment,
} from "@/lib/ab-testing";

interface UseABTestResult {
  variant: string | null;
  isLoading: boolean;
  experiment: Experiment | null;
}

/**
 * Hook for using A/B tests in React components
 *
 * @param experimentId - The ID of the experiment to use
 * @param trackView - Whether to track that the variant was viewed (default: true)
 * @returns The assigned variant, loading state, and experiment info
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { variant, isLoading } = useABTest('blog-layout');
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   if (variant === 'compact') {
 *     return <CompactLayout />;
 *   }
 *
 *   return <DefaultLayout />;
 * }
 * ```
 */
export function useABTest(
  experimentId: string,
  trackView: boolean = true
): UseABTestResult {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get variant on client side only
    const assignedVariant = getVariant(experimentId);
    setVariant(assignedVariant);
    setIsLoading(false);

    // Track view if enabled
    if (trackView && assignedVariant) {
      trackVariantView(experimentId, assignedVariant);
    }
  }, [experimentId, trackView]);

  return {
    variant,
    isLoading,
    experiment: experiments[experimentId] || null,
  };
}

/**
 * Hook to check if a specific variant is active
 *
 * @param experimentId - The ID of the experiment
 * @param targetVariant - The variant to check for
 * @returns Whether the target variant is active
 *
 * @example
 * ```tsx
 * function MyButton() {
 *   const isGradient = useVariant('cta-style', 'gradient');
 *
 *   return (
 *     <button className={isGradient ? 'bg-gradient' : 'bg-primary'}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function useVariant(
  experimentId: string,
  targetVariant: string
): boolean {
  const { variant, isLoading } = useABTest(experimentId);

  if (isLoading) {
    return false; // Default to false while loading
  }

  return variant === targetVariant;
}

/**
 * Component wrapper for A/B testing
 * Renders children only if the specified variant is active
 *
 * @example
 * ```tsx
 * <ABTestVariant experimentId="blog-layout" variant="compact">
 *   <CompactBlogLayout />
 * </ABTestVariant>
 * ```
 */
export function ABTestVariant({
  experimentId,
  variant: targetVariant,
  children,
  fallback = null,
}: {
  experimentId: string;
  variant: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isActive = useVariant(experimentId, targetVariant);

  if (isActive) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
