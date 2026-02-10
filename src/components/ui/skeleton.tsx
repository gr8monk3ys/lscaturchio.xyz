'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type AnimationType = 'pulse' | 'shimmer' | 'none'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation type: pulse (default), shimmer, or none */
  animation?: AnimationType
  /** Shape variant: rounded (default), circular, or rectangular */
  shape?: 'rounded' | 'circular' | 'rectangular'
  /** Use neumorphic inset shadow styling */
  neumorphic?: boolean
}

function Skeleton({
  className,
  animation = 'pulse',
  shape = 'rounded',
  neumorphic = true,
  ...props
}: SkeletonProps): React.ReactElement {
  const shapeClasses = {
    rounded: 'rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton-shimmer',
    none: '',
  }

  return (
    <div
      className={cn(
        'bg-muted/60 dark:bg-muted/40',
        neumorphic && 'neu-pressed-sm',
        shapeClasses[shape],
        animationClasses[animation],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
export type { SkeletonProps, AnimationType }
