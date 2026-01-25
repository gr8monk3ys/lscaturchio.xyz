'use client';

import { useRef, ReactNode } from 'react';
import { CursorGlow, GradientCursorGlow } from './cursor-glow';

// ============================================
// TYPES
// ============================================
interface GlowSectionProps {
  /**
   * Content to render inside the glow section.
   */
  children: ReactNode;
  /**
   * Additional CSS classes for the section wrapper.
   */
  className?: string;
  /**
   * Type of glow effect to use.
   * - 'default': Single color radial gradient
   * - 'gradient': Dual color with offset gradients
   * @default 'default'
   */
  variant?: 'default' | 'gradient';
  /**
   * Size of the glow gradient in pixels.
   * @default 600 for default, 800 for gradient
   */
  size?: number;
  /**
   * Opacity of the glow effect (0-1).
   * @default 0.15 for default, 0.12 for gradient
   */
  opacity?: number;
  /**
   * Color of the glow (for default variant).
   * @default 'hsl(var(--primary))'
   */
  color?: string;
  /**
   * Primary color (for gradient variant).
   * @default 'rgba(100, 200, 100, 0.4)'
   */
  primaryColor?: string;
  /**
   * Secondary color (for gradient variant).
   * @default 'rgba(59, 130, 246, 0.2)'
   */
  secondaryColor?: string;
  /**
   * Whether the glow should be enabled.
   * @default true
   */
  enabled?: boolean;
  /**
   * HTML tag to use for the wrapper element.
   * @default 'section'
   */
  as?: 'section' | 'div' | 'article' | 'main' | 'header' | 'footer';
}

// ============================================
// GLOW SECTION COMPONENT
// ============================================

/**
 * GlowSection - A wrapper component that adds cursor glow effect to its children.
 * The glow is scoped to only appear within the section bounds.
 *
 * @example
 * // Basic usage with default glow
 * <GlowSection>
 *   <YourContent />
 * </GlowSection>
 *
 * @example
 * // With gradient variant and custom colors
 * <GlowSection
 *   variant="gradient"
 *   primaryColor="rgba(147, 51, 234, 0.3)"
 *   secondaryColor="rgba(59, 130, 246, 0.2)"
 * >
 *   <YourContent />
 * </GlowSection>
 *
 * @example
 * // With custom styling
 * <GlowSection
 *   className="min-h-screen"
 *   color="rgba(34, 197, 94, 0.2)"
 *   opacity={0.2}
 * >
 *   <YourContent />
 * </GlowSection>
 */
export function GlowSection({
  children,
  className = '',
  variant = 'default',
  size,
  opacity,
  color,
  primaryColor,
  secondaryColor,
  enabled = true,
  as: Component = 'section',
}: GlowSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use a wrapper div for consistent ref typing across different 'as' components
  return (
    <Component className={`relative ${className}`}>
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {enabled && variant === 'default' && (
          <CursorGlow
            containerRef={containerRef}
            size={size}
            opacity={opacity}
            color={color}
          />
        )}
        {enabled && variant === 'gradient' && (
          <GradientCursorGlow
            containerRef={containerRef}
            size={size}
            opacity={opacity}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        )}
      </div>
      {children}
    </Component>
  );
}

// ============================================
// HERO GLOW SECTION (Pre-configured for hero areas)
// ============================================

interface HeroGlowSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * HeroGlowSection - A pre-configured glow section optimized for hero areas.
 * Uses larger glow size and slightly higher opacity for maximum impact.
 *
 * @example
 * <HeroGlowSection className="min-h-screen">
 *   <HeroContent />
 * </HeroGlowSection>
 */
export function HeroGlowSection({ children, className = '' }: HeroGlowSectionProps) {
  return (
    <GlowSection
      className={className}
      variant="default"
      size={700}
      opacity={0.18}
      color="hsl(var(--primary))"
    >
      {children}
    </GlowSection>
  );
}

// ============================================
// SUBTLE GLOW SECTION (Pre-configured for content areas)
// ============================================

interface SubtleGlowSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * SubtleGlowSection - A pre-configured glow section for content areas.
 * Uses smaller glow size and lower opacity for a more subtle effect.
 *
 * @example
 * <SubtleGlowSection>
 *   <BlogContent />
 * </SubtleGlowSection>
 */
export function SubtleGlowSection({ children, className = '' }: SubtleGlowSectionProps) {
  return (
    <GlowSection
      className={className}
      variant="default"
      size={500}
      opacity={0.1}
      color="hsl(var(--primary))"
    >
      {children}
    </GlowSection>
  );
}
