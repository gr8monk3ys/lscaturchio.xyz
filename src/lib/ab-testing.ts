/**
 * A/B Testing Infrastructure
 *
 * Simple client-side A/B testing system that:
 * - Assigns users to variants deterministically based on a hash
 * - Persists assignments in localStorage
 * - Provides hooks for React components
 * - Tracks which variants are shown
 */

import { logWarn, logDebug } from '@/lib/logger';
import { safeStorage } from '@/lib/storage';

// Experiment definitions
export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // Optional weights for non-equal distribution
}

// Active experiments registry
export const experiments: Record<string, Experiment> = {
  'blog-layout': {
    id: 'blog-layout',
    name: 'Blog Layout Style',
    variants: ['default', 'compact', 'wide'],
    weights: [0.8, 0.1, 0.1], // 80% default, 10% each for alternatives
  },
  'cta-style': {
    id: 'cta-style',
    name: 'CTA Button Style',
    variants: ['primary', 'gradient'],
    weights: [0.5, 0.5],
  },
  'hero-animation': {
    id: 'hero-animation',
    name: 'Hero Animation Type',
    variants: ['particles', 'gradient-orb', 'none'],
    weights: [0.4, 0.4, 0.2],
  },
};

// Storage key for experiment assignments
const STORAGE_KEY = 'ab_experiments';

// Generate a simple hash from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get or generate a user ID for consistent variant assignment
function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  let userId = safeStorage.get('ab_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    safeStorage.set('ab_user_id', userId);
  }
  return userId;
}

// Get stored experiment assignments
function getStoredAssignments(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  return safeStorage.getJSON<Record<string, string>>(STORAGE_KEY) || {};
}

// Save experiment assignments
function saveAssignments(assignments: Record<string, string>): void {
  if (typeof window === 'undefined') {
    return;
  }

  safeStorage.setJSON(STORAGE_KEY, assignments);
}

// Assign a variant based on weights
function assignVariant(experiment: Experiment, userId: string): string {
  const { variants, weights } = experiment;

  // Use equal weights if not specified
  const normalizedWeights = weights || variants.map(() => 1 / variants.length);

  // Generate a consistent random value based on user ID and experiment ID
  const hash = hashString(`${userId}:${experiment.id}`);
  const randomValue = (hash % 10000) / 10000; // 0-1 range

  // Select variant based on cumulative weights
  let cumulative = 0;
  for (let i = 0; i < variants.length; i++) {
    cumulative += normalizedWeights[i];
    if (randomValue < cumulative) {
      return variants[i];
    }
  }

  // Fallback to first variant
  return variants[0];
}

/**
 * Get the variant for an experiment
 * Handles assignment and persistence
 */
export function getVariant(experimentId: string): string | null {
  const experiment = experiments[experimentId];
  if (!experiment) {
    logWarn(`Experiment "${experimentId}" not found`, { action: 'getVariant', experimentId });
    return null;
  }

  // Get stored assignments
  const assignments = getStoredAssignments();

  // Check if already assigned
  if (assignments[experimentId]) {
    return assignments[experimentId];
  }

  // Assign new variant
  const userId = getUserId();
  const variant = assignVariant(experiment, userId);

  // Store assignment
  assignments[experimentId] = variant;
  saveAssignments(assignments);

  return variant;
}

/**
 * Force a specific variant (for testing/debugging)
 */
export function forceVariant(experimentId: string, variant: string): void {
  const experiment = experiments[experimentId];
  if (!experiment) {
    logWarn(`Experiment "${experimentId}" not found`, { action: 'forceVariant', experimentId });
    return;
  }

  if (!experiment.variants.includes(variant)) {
    logWarn(`Variant "${variant}" not valid for experiment "${experimentId}"`, { action: 'forceVariant', experimentId, variant });
    return;
  }

  const assignments = getStoredAssignments();
  assignments[experimentId] = variant;
  saveAssignments(assignments);
}

/**
 * Clear all experiment assignments (reset user)
 */
export function clearAssignments(): void {
  if (typeof window === 'undefined') {
    return;
  }

  safeStorage.remove(STORAGE_KEY);
  safeStorage.remove('ab_user_id');
}

/**
 * Get all current assignments for debugging
 */
export function getAllAssignments(): Record<string, string> {
  return getStoredAssignments();
}

/**
 * Track that a variant was displayed (for analytics)
 */
export function trackVariantView(experimentId: string, variant: string): void {
  // This would integrate with your analytics system
  // For now, just log in development
  logDebug(`[A/B Test] Viewed: ${experimentId} = ${variant}`, { action: 'trackVariantView', experimentId, variant });

  // Could send to analytics endpoint:
  // fetch('/api/analytics/ab-event', {
  //   method: 'POST',
  //   body: JSON.stringify({ experimentId, variant, event: 'view' }),
  // });
}

/**
 * Track a conversion event for an experiment
 */
export function trackConversion(experimentId: string, conversionType: string): void {
  const variant = getStoredAssignments()[experimentId];
  if (!variant) {
    return;
  }

  logDebug(`[A/B Test] Conversion: ${experimentId} = ${variant}, type: ${conversionType}`, { action: 'trackConversion', experimentId, variant, conversionType });

  // Could send to analytics endpoint:
  // fetch('/api/analytics/ab-event', {
  //   method: 'POST',
  //   body: JSON.stringify({ experimentId, variant, event: 'conversion', conversionType }),
  // });
}
