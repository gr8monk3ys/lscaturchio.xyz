'use client'

import { LazyMotion } from '@/lib/motion'
import { loadMotionFeatures } from '@/lib/motion'
import type { ReactNode } from 'react'

interface MotionProviderProps {
  children: ReactNode
}

/**
 * Mount this in the layout of any segment that renders `m.` components.
 *
 * Not in the root layout. `LazyMotion` calls its feature loader on mount, not
 * on first use, so wherever this sits, the whole `domAnimation` bundle
 * (46 KB gzipped) plus framer-motion's core (23 KB) is fetched and evaluated
 * — measured on the home route, where no component animates, as the two
 * largest "unused JavaScript" entries in Lighthouse. Six segments use motion
 * (about, photos, professional, projects, secret, work-with-me) and each has
 * a `layout.tsx` that renders this; a new `m.` component in a segment without
 * one renders static, because `m` outside a provider never animates. Add the
 * layout, do not move the provider back up.
 */
export function MotionProvider({ children }: MotionProviderProps): ReactNode {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      {children}
    </LazyMotion>
  )
}
