'use client'

import { LazyMotion } from '@/lib/motion'
import { loadMotionFeatures } from '@/lib/motion'
import type { ReactNode } from 'react'

interface MotionProviderProps {
  children: ReactNode
}

export function MotionProvider({ children }: MotionProviderProps): ReactNode {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      {children}
    </LazyMotion>
  )
}
