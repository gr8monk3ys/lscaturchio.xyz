'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, Slash, ArrowRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// TYPES
// ============================================

export type BreadcrumbSeparatorType = 'chevron' | 'slash' | 'arrow'

interface BreadcrumbContextValue {
  separator: BreadcrumbSeparatorType
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({
  separator: 'chevron',
})

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

// ============================================
// BREADCRUMB CONTAINER
// ============================================

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  separator?: BreadcrumbSeparatorType
  children: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator = 'chevron', className, children, ...props }, ref) => {
    return (
      <BreadcrumbContext.Provider value={{ separator }}>
        <nav
          ref={ref}
          aria-label="Breadcrumb"
          className={cn('relative', className)}
          {...props}
        >
          {children}
        </nav>
      </BreadcrumbContext.Provider>
    )
  }
)
Breadcrumb.displayName = 'Breadcrumb'

// ============================================
// BREADCRUMB LIST
// ============================================

export interface BreadcrumbListProps
  extends React.ComponentPropsWithoutRef<typeof motion.ol> {
  children: React.ReactNode
}

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.ol
        ref={ref}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className={cn(
          'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
          className
        )}
        {...props}
      >
        {children}
      </motion.ol>
    )
  }
)
BreadcrumbList.displayName = 'BreadcrumbList'

// ============================================
// BREADCRUMB ITEM
// ============================================

export interface BreadcrumbItemProps
  extends React.ComponentPropsWithoutRef<typeof motion.li> {
  children: React.ReactNode
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.li
        ref={ref}
        variants={itemVariants}
        className={cn('inline-flex items-center gap-1.5', className)}
        {...props}
      >
        {children}
      </motion.li>
    )
  }
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

// ============================================
// BREADCRUMB LINK
// ============================================

export interface BreadcrumbLinkProps
  extends React.ComponentPropsWithoutRef<'a'> {
  asChild?: boolean
  href?: string
  icon?: React.ReactNode
  truncate?: boolean
  maxWidth?: number
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  (
    {
      asChild = false,
      href,
      icon,
      truncate = false,
      maxWidth = 150,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : href ? Link : 'span'

    return (
      <Comp
        ref={ref}
        href={href as string}
        className={cn(
          'inline-flex items-center gap-1.5 transition-colors hover:text-foreground',
          truncate && 'max-w-[var(--max-width)] truncate',
          className
        )}
        style={truncate ? { '--max-width': `${maxWidth}px` } as React.CSSProperties : undefined}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </Comp>
    )
  }
)
BreadcrumbLink.displayName = 'BreadcrumbLink'

// ============================================
// BREADCRUMB SEPARATOR
// ============================================

export interface BreadcrumbSeparatorProps {
  type?: BreadcrumbSeparatorType
  children?: React.ReactNode
  className?: string
}

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(({ type, className, children }, ref) => {
  const { separator: contextSeparator } = React.useContext(BreadcrumbContext)
  const separatorType = type || contextSeparator

  const getSeparatorIcon = () => {
    switch (separatorType) {
      case 'slash':
        return <Slash className="h-3.5 w-3.5" />
      case 'arrow':
        return <ArrowRight className="h-3.5 w-3.5" />
      case 'chevron':
      default:
        return <ChevronRight className="h-3.5 w-3.5" />
    }
  }

  return (
    <motion.li
      ref={ref}
      variants={itemVariants}
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
    >
      {children ?? getSeparatorIcon()}
    </motion.li>
  )
})
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

// ============================================
// BREADCRUMB PAGE (Current Page - Not Clickable)
// ============================================

export interface BreadcrumbPageProps
  extends React.ComponentPropsWithoutRef<'span'> {
  icon?: React.ReactNode
  truncate?: boolean
  maxWidth?: number
}

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  (
    { icon, truncate = false, maxWidth = 200, className, children, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn(
          'inline-flex items-center gap-1.5 font-medium text-foreground',
          truncate && 'max-w-[var(--max-width)] truncate',
          className
        )}
        style={truncate ? { '--max-width': `${maxWidth}px` } as React.CSSProperties : undefined}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </span>
    )
  }
)
BreadcrumbPage.displayName = 'BreadcrumbPage'

// ============================================
// BREADCRUMB ELLIPSIS
// ============================================

export interface BreadcrumbEllipsisProps
  extends React.ComponentPropsWithoutRef<'span'> {}

const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbEllipsisProps
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
})
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'

// ============================================
// UTILITY: Auto-generate breadcrumbs from path
// ============================================

export interface BreadcrumbPath {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface AutoBreadcrumbProps extends Omit<BreadcrumbProps, 'children'> {
  paths: BreadcrumbPath[]
  homeIcon?: React.ReactNode
  truncateItems?: boolean
  maxItemWidth?: number
  maxItems?: number
}

const AutoBreadcrumb = React.forwardRef<HTMLElement, AutoBreadcrumbProps>(
  (
    {
      paths,
      homeIcon,
      truncateItems = true,
      maxItemWidth = 150,
      maxItems = 4,
      separator = 'chevron',
      className,
      ...props
    },
    ref
  ) => {
    // Truncate middle items if there are too many
    const shouldTruncate = paths.length > maxItems
    const displayPaths = shouldTruncate
      ? [
          paths[0], // First item (usually home)
          { label: '...', href: undefined }, // Ellipsis
          ...paths.slice(-2), // Last two items
        ]
      : paths

    return (
      <Breadcrumb ref={ref} separator={separator} className={className} {...props}>
        <BreadcrumbList>
          {displayPaths.map((path, index) => {
            const isLast = index === displayPaths.length - 1
            const isEllipsis = path.label === '...'
            const isFirst = index === 0

            return (
              <React.Fragment key={`${path.label}-${index}`}>
                <BreadcrumbItem>
                  {isEllipsis ? (
                    <BreadcrumbEllipsis />
                  ) : isLast ? (
                    <BreadcrumbPage
                      icon={path.icon}
                      truncate={truncateItems}
                      maxWidth={maxItemWidth}
                    >
                      {path.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={path.href}
                      icon={isFirst && homeIcon ? homeIcon : path.icon}
                      truncate={truncateItems}
                      maxWidth={maxItemWidth}
                    >
                      {path.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }
)
AutoBreadcrumb.displayName = 'AutoBreadcrumb'

// ============================================
// EXPORTS
// ============================================

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbEllipsis,
  AutoBreadcrumb,
}
