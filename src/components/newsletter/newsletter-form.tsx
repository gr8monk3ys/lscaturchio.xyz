"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2, Check, AlertCircle } from 'lucide-react'
import { NEWSLETTER_TOPICS, type NewsletterTopicId } from '@/constants/newsletter'
import { cn } from '@/lib/utils'

type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error'

function normalizeTopics(topics: string[] | undefined): NewsletterTopicId[] {
  if (!topics) return [];
  const set = new Set(
    topics
      .map((t) => String(t).trim())
      .filter(Boolean)
  );
  const allowed = new Set(NEWSLETTER_TOPICS.map((t) => t.id));
  return Array.from(set)
    .filter((t): t is NewsletterTopicId => allowed.has(t as NewsletterTopicId))
    .slice(0, 6);
}

export function NewsletterForm({
  defaultTopics,
  sourcePath,
  compact = false,
}: {
  defaultTopics?: string[];
  sourcePath?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscriptionStatus>('idle')
  const [message, setMessage] = useState('')
  const [topics, setTopics] = useState<NewsletterTopicId[]>(() => normalizeTopics(defaultTopics))

  const toggleTopic = (id: NewsletterTopicId) => {
    setTopics((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return Array.from(set).slice(0, 6);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topics, source: sourcePath }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Successfully subscribed!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to subscribe')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-muted-foreground">
              Topics (optional)
            </div>
            <div className="text-[11px] text-muted-foreground tabular-nums">
              {topics.length}/6
            </div>
          </div>
          <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
            {NEWSLETTER_TOPICS.map((t) => {
              const active = topics.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTopic(t.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                    "bg-background/70 border-border/60 hover:bg-primary/[0.04]",
                    active && "border-primary/30 bg-primary/10 text-primary",
                    compact && "px-2.5 py-0.5 text-[11px]"
                  )}
                  aria-pressed={active}
                  title={t.description}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'loading' || status === 'success'}
            className="w-full pl-11 pr-4 py-3 rounded-xl neu-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <motion.button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          whileHover={{ scale: status === 'idle' || status === 'error' ? 1.02 : 1 }}
          whileTap={{ scale: status === 'idle' || status === 'error' ? 0.98 : 1 }}
        className="w-full px-4 py-3 rounded-xl cta-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Subscribing...</span>
            </>
          )}
          {status === 'success' && (
            <>
              <Check className="h-4 w-4" />
              <span>Subscribed!</span>
            </>
          )}
          {(status === 'idle' || status === 'error') && (
            <span>Subscribe</span>
          )}
        </motion.button>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 p-3 rounded-xl text-sm flex items-start gap-2 neu-pressed-sm ${
            status === 'success'
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}
        >
          {status === 'success' ? (
            <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <span>{message}</span>
        </motion.div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Get notified when I publish new articles. Unsubscribe anytime.
      </p>
    </div>
  )
}
