"use client"

import { useMemo } from 'react'
import { LazyMotion, domAnimation, m } from '@/lib/motion'
import { Eye, FileText, Users, TrendingUp } from 'lucide-react'
import useSWR from 'swr'
import { fetchJson } from '@/lib/fetcher'

interface Stats {
  totalViews: number
  totalPosts: number
  newsletterSubscribers: number
  avgReadTime: number
}

export function StatsOverview() {
  const { data: newsletterStats, isLoading, error } = useSWR<{ activeSubscribers?: number }>(
    '/api/newsletter/stats',
    fetchJson,
    { shouldRetryOnError: false, revalidateOnFocus: false }
  )

  const stats: Stats = useMemo(
    () => ({
      totalViews: 12543,
      totalPosts: 14,
      newsletterSubscribers:
        error || typeof newsletterStats?.activeSubscribers !== 'number'
          ? 0
          : newsletterStats.activeSubscribers,
      avgReadTime: 5,
    }),
    [newsletterStats, error]
  )

  const cards = [
    {
      label: 'Total Page Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Blog Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Newsletter Subscribers',
      value: stats.newsletterSubscribers,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Avg. Read Time',
      value: stats.avgReadTime,
      suffix: ' min',
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]

  return (
    <LazyMotion features={domAnimation}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <m.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-3xl font-bold">
                {isLoading ? (
                  <span className="text-muted-foreground">•••</span>
                ) : (
                  <>
                    {card.value.toLocaleString()}
                    {card.suffix}
                  </>
                )}
              </p>
            </div>
          </m.div>
        ))}
      </div>
    </LazyMotion>
  )
}
