'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================
// ANIMATION TYPES
// ============================================
type AnimationType = 'pulse' | 'shimmer' | 'none'

// ============================================
// BASE SKELETON COMPONENT
// ============================================
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

// ============================================
// SKELETON TEXT COMPONENT
// ============================================
interface SkeletonTextProps extends Omit<SkeletonProps, 'shape'> {
  /** Number of text lines to render */
  lines?: number
  /** Text size: sm, md, lg */
  size?: 'sm' | 'md' | 'lg'
  /** Width of the last line (percentage) */
  lastLineWidth?: number
}

function SkeletonText({
  lines = 3,
  size = 'md',
  lastLineWidth = 60,
  className,
  animation = 'pulse',
  neumorphic = true,
  ...props
}: SkeletonTextProps): React.ReactElement {
  const sizeClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5',
  }

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          animation={animation}
          neumorphic={neumorphic}
          className={cn(
            sizeClasses[size],
            index === lines - 1 ? `w-[${lastLineWidth}%]` : 'w-full'
          )}
          style={index === lines - 1 ? { width: `${lastLineWidth}%` } : undefined}
        />
      ))}
    </div>
  )
}

// ============================================
// SKELETON AVATAR COMPONENT
// ============================================
interface SkeletonAvatarProps extends Omit<SkeletonProps, 'shape'> {
  /** Avatar size: xs, sm, md, lg, xl */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

function SkeletonAvatar({
  size = 'md',
  className,
  animation = 'pulse',
  neumorphic = true,
  ...props
}: SkeletonAvatarProps): React.ReactElement {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  return (
    <Skeleton
      shape="circular"
      animation={animation}
      neumorphic={neumorphic}
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
}

// ============================================
// SKELETON BUTTON COMPONENT
// ============================================
interface SkeletonButtonProps extends Omit<SkeletonProps, 'shape'> {
  /** Button size: sm, md, lg */
  size?: 'sm' | 'md' | 'lg'
  /** Button width style */
  width?: 'auto' | 'full'
}

function SkeletonButton({
  size = 'md',
  width = 'auto',
  className,
  animation = 'pulse',
  neumorphic = true,
  ...props
}: SkeletonButtonProps): React.ReactElement {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  }

  return (
    <Skeleton
      animation={animation}
      neumorphic={neumorphic}
      className={cn(
        sizeClasses[size],
        width === 'full' && 'w-full',
        'rounded-lg',
        className
      )}
      {...props}
    />
  )
}

// ============================================
// SKELETON CARD COMPONENT
// ============================================
interface SkeletonCardProps extends Omit<SkeletonProps, 'shape'> {
  /** Show image placeholder at top */
  showImage?: boolean
  /** Image aspect ratio */
  imageAspect?: 'video' | 'square' | 'wide'
  /** Number of text lines in body */
  lines?: number
  /** Show footer section */
  showFooter?: boolean
}

function SkeletonCard({
  showImage = true,
  imageAspect = 'video',
  lines = 2,
  showFooter = false,
  className,
  animation = 'pulse',
  neumorphic = true,
  ...props
}: SkeletonCardProps): React.ReactElement {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[2/1]',
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-background neu-card overflow-hidden',
        className
      )}
      {...props}
    >
      {/* Image placeholder */}
      {showImage && (
        <Skeleton
          animation={animation}
          neumorphic={false}
          shape="rectangular"
          className={cn('w-full', aspectClasses[imageAspect])}
        />
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <Skeleton
          animation={animation}
          neumorphic={neumorphic}
          className="h-6 w-3/4"
        />

        {/* Description lines */}
        <SkeletonText
          lines={lines}
          size="sm"
          animation={animation}
          neumorphic={neumorphic}
        />

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center gap-3 pt-2">
            <SkeletonAvatar size="sm" animation={animation} neumorphic={neumorphic} />
            <Skeleton
              animation={animation}
              neumorphic={neumorphic}
              className="h-4 w-24"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// BLOG CARD SKELETON
// ============================================
interface BlogCardSkeletonProps {
  animation?: AnimationType
  className?: string
}

function BlogCardSkeleton({
  animation = 'pulse',
  className,
}: BlogCardSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden rounded-2xl bg-background neu-card',
        className
      )}
    >
      {/* Image placeholder - matches BlogCard h-48 */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
        <Skeleton
          animation={animation}
          neumorphic={false}
          shape="rectangular"
          className="absolute inset-0"
        />
        {/* Progress badge placeholder */}
        <div className="absolute top-3 right-3">
          <Skeleton
            animation={animation}
            neumorphic={false}
            className="h-5 w-16 rounded-full"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-2">
          <Skeleton animation={animation} className="h-5 w-14 rounded-full" />
          <Skeleton animation={animation} className="h-5 w-18 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton animation={animation} className="h-7 w-full" />
        <Skeleton animation={animation} className="h-7 w-2/3" />

        {/* Date and views */}
        <div className="flex items-center gap-3 mt-2">
          <Skeleton animation={animation} className="h-4 w-24" />
          <Skeleton animation={animation} className="h-4 w-16" />
        </div>
      </div>

      {/* Content - description */}
      <div className="p-6 pt-0 flex-grow">
        <SkeletonText lines={3} size="sm" animation={animation} lastLineWidth={80} />
      </div>
    </div>
  )
}

// ============================================
// PROJECT CARD SKELETON
// ============================================
interface ProjectCardSkeletonProps {
  animation?: AnimationType
  variant?: 'featured' | 'default'
  className?: string
}

function ProjectCardSkeleton({
  animation = 'pulse',
  variant = 'default',
  className,
}: ProjectCardSkeletonProps): React.ReactElement {
  const isFeatured = variant === 'featured'

  return (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-2xl border border-border/50',
        'bg-card/50 backdrop-blur-sm',
        isFeatured && 'col-span-2',
        className
      )}
    >
      {/* Featured star placeholder */}
      {isFeatured && (
        <div className="absolute top-3 right-3 z-10">
          <Skeleton
            animation={animation}
            shape="circular"
            neumorphic={false}
            className="h-8 w-8"
          />
        </div>
      )}

      {/* Image Section */}
      <div className={cn('relative overflow-hidden', isFeatured ? 'aspect-[2/1]' : 'aspect-video')}>
        <Skeleton
          animation={animation}
          neumorphic={false}
          shape="rectangular"
          className="absolute inset-0"
        />
      </div>

      {/* Content Section */}
      <div className="relative p-5 space-y-4">
        {/* Status & Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton animation={animation} className="h-6 w-16 rounded-full" />
          <Skeleton animation={animation} className="h-5 w-14 rounded-full" />
          <Skeleton animation={animation} className="h-5 w-20 rounded-full" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <Skeleton
            animation={animation}
            className={cn('w-3/4', isFeatured ? 'h-8' : 'h-6')}
          />
          <SkeletonText
            lines={isFeatured ? 3 : 2}
            size="sm"
            animation={animation}
            lastLineWidth={70}
          />
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: isFeatured ? 5 : 3 }).map((_, i) => (
            <Skeleton
              key={i}
              animation={animation}
              className="h-6 w-14 rounded-md"
            />
          ))}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5">
          <Skeleton animation={animation} shape="circular" className="h-3.5 w-3.5" />
          <Skeleton animation={animation} className="h-3 w-20" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <SkeletonButton size="sm" animation={animation} />
          <SkeletonButton size="sm" animation={animation} />
        </div>
      </div>
    </div>
  )
}

// ============================================
// TESTIMONIAL CARD SKELETON
// ============================================
interface TestimonialCardSkeletonProps {
  animation?: AnimationType
  className?: string
}

function TestimonialCardSkeleton({
  animation = 'pulse',
  className,
}: TestimonialCardSkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'relative h-full p-6 flex flex-col rounded-2xl bg-background neu-card',
        className
      )}
    >
      {/* Quote icon placeholder */}
      <div className="absolute -top-3 -left-1">
        <Skeleton
          animation={animation}
          neumorphic={false}
          className="h-12 w-12 opacity-20"
        />
      </div>

      {/* Content - quote text */}
      <div className="relative z-10 flex-1 mb-6">
        <SkeletonText
          lines={4}
          size="md"
          animation={animation}
          lastLineWidth={50}
        />
      </div>

      {/* Author Info */}
      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
        {/* Avatar */}
        <SkeletonAvatar size="lg" animation={animation} />

        {/* Name and Role */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton animation={animation} className="h-5 w-32" />
          <Skeleton animation={animation} className="h-4 w-40" />
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-2">
          <Skeleton animation={animation} shape="circular" className="h-8 w-8" />
          <Skeleton animation={animation} shape="circular" className="h-8 w-8" />
        </div>
      </div>

      {/* Date */}
      <div className="mt-3">
        <Skeleton animation={animation} className="h-3 w-24" />
      </div>
    </div>
  )
}

// ============================================
// SKELETON IMAGE COMPONENT
// ============================================
interface SkeletonImageProps extends Omit<SkeletonProps, 'shape'> {
  /** Image aspect ratio */
  aspect?: 'video' | 'square' | 'wide' | 'portrait'
}

function SkeletonImage({
  aspect = 'video',
  className,
  animation = 'pulse',
  neumorphic = false,
  ...props
}: SkeletonImageProps): React.ReactElement {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[2/1]',
    portrait: 'aspect-[3/4]',
  }

  return (
    <Skeleton
      animation={animation}
      neumorphic={neumorphic}
      shape="rounded"
      className={cn('w-full overflow-hidden', aspectClasses[aspect], className)}
      {...props}
    />
  )
}

// ============================================
// SKELETON BADGE COMPONENT
// ============================================
interface SkeletonBadgeProps extends Omit<SkeletonProps, 'shape'> {
  /** Badge width */
  width?: 'sm' | 'md' | 'lg'
}

function SkeletonBadge({
  width = 'md',
  className,
  animation = 'pulse',
  neumorphic = true,
  ...props
}: SkeletonBadgeProps): React.ReactElement {
  const widthClasses = {
    sm: 'w-12',
    md: 'w-16',
    lg: 'w-24',
  }

  return (
    <Skeleton
      animation={animation}
      neumorphic={neumorphic}
      className={cn('h-5 rounded-full', widthClasses[width], className)}
      {...props}
    />
  )
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonImage,
  SkeletonBadge,
  BlogCardSkeleton,
  ProjectCardSkeleton,
  TestimonialCardSkeleton,
}

export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonButtonProps,
  SkeletonCardProps,
  SkeletonImageProps,
  SkeletonBadgeProps,
  BlogCardSkeletonProps,
  ProjectCardSkeletonProps,
  TestimonialCardSkeletonProps,
  AnimationType,
}
