"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js components to avoid SSR issues
const ParticleField = dynamic(
  () => import('./particle-field').then((mod) => mod.ParticleField),
  { ssr: false }
);

const ParticleFieldLite = dynamic(
  () => import('./particle-field').then((mod) => mod.ParticleFieldLite),
  { ssr: false }
);

const GradientOrb = dynamic(
  () => import('./gradient-orb').then((mod) => mod.GradientOrb),
  { ssr: false }
);

type BackgroundType = 'particles' | 'orb' | 'none';

interface ThreeBackgroundProps {
  type?: BackgroundType;
  className?: string;
}

export function ThreeBackground({ type = 'particles', className = '' }: ThreeBackgroundProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    // Check for low-end device (less than 4 cores or mobile)
    const isLowEndDevice =
      navigator.hardwareConcurrency < 4 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsLowEnd(isLowEndDevice);

    // Only render after hydration and if motion is allowed
    if (!motionQuery.matches) {
      setShouldRender(true);
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      setShouldRender(!e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  if (!shouldRender || prefersReducedMotion || type === 'none') {
    return null;
  }

  return (
    <div className={`pointer-events-none ${className}`}>
      <Suspense fallback={null}>
        {type === 'particles' && (isLowEnd ? <ParticleFieldLite /> : <ParticleField />)}
        {type === 'orb' && <GradientOrb />}
      </Suspense>
    </div>
  );
}

// Export a hook for controlling the background from other components
export function useThreeBackground() {
  const [isEnabled, setIsEnabled] = useState(true);

  const toggle = () => setIsEnabled((prev) => !prev);
  const enable = () => setIsEnabled(true);
  const disable = () => setIsEnabled(false);

  return { isEnabled, toggle, enable, disable };
}
