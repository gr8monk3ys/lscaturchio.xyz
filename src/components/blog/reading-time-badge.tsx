"use client"

import { Clock } from 'lucide-react'

interface ReadingTimeBadgeProps {
  minutes: number
  className?: string
}

export function ReadingTimeBadge({ minutes, className = '' }: ReadingTimeBadgeProps) {
  const text = minutes === 1 ? '1 min read' : `${minutes} min read`

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}>
      <Clock className="h-4 w-4" />
      <span>{text}</span>
    </div>
  )
}
