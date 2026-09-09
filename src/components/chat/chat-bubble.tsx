"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageLoading } from "@/components/ui/message-loading";

interface ChatBubbleProps {
  variant?: "sent" | "received"
  layout?: "default" | "ai"
  className?: string
  children: React.ReactNode
}

export function ChatBubble({
  variant = "received",
  layout = "default",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      data-layout={layout}
      className={cn(
        "flex items-start gap-2 mb-4",
        variant === "sent" && "flex-row-reverse",
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received"
  isLoading?: boolean
  className?: string
  children?: React.ReactNode
}

export function ChatBubbleMessage({
  variant = "received",
  isLoading,
  className,
  children,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        // Paper, not speech bubbles. `bg-primary` on every user turn spent
        // Forest Ink as area — the One Pen Rule's named failure — and the
        // received turn had no hairline, which the Tinted Paper Rule requires
        // of any contained surface. Radius drops to the card step (12px).
        "max-w-[78ch] rounded-xl border px-4 py-3 text-sm leading-relaxed",
        variant === "sent"
          ? "border-primary/25 bg-primary/8 text-foreground"
          : "border-border bg-card",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  )
}

interface ChatBubbleAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  className?: string
}

export function ChatBubbleAvatar({
  src,
  alt = "",
  fallback = "AI",
  className,
}: ChatBubbleAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}
