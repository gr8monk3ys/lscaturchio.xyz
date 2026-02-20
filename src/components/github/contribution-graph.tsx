"use client"

import { useState } from 'react'
import { LazyMotion, domAnimation, m } from '@/lib/motion'
import { Github } from 'lucide-react'
import useSWR from 'swr'
import { fetchJson } from '@/lib/fetcher'

interface ContributionDay {
  contributionCount: number
  date: string
  color: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export function ContributionGraph() {
  const { data, isLoading } = useSWR<{ totalContributions: number; weeks: ContributionWeek[] }>(
    '/api/github/contributions',
    fetchJson,
    { revalidateOnFocus: false }
  )
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <Github className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">GitHub Contributions</h3>
        </div>
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!data) return null

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  const displayMonths = Array.from({ length: 12 }, (_, offset) => ({
    key: `${currentMonth}-${offset}`,
    label: months[(currentMonth - 11 + offset + 12) % 12],
    showLabel: offset % 2 === 0,
  }))

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">GitHub Contributions</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{data.totalContributions}</span> contributions in the last year
        </p>
      </div>

      <LazyMotion features={domAnimation}>
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex gap-1 mb-2 ml-8">
              {displayMonths.map((month) => (
                <div key={month.key} className="text-xs text-muted-foreground" style={{ width: '52px' }}>
                  {month.showLabel ? month.label : ''}
                </div>
              ))}
            </div>

            {/* Contribution grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-2">
                <div style={{ height: '12px' }}>Mon</div>
                <div style={{ height: '12px' }}></div>
                <div style={{ height: '12px' }}>Wed</div>
                <div style={{ height: '12px' }}></div>
                <div style={{ height: '12px' }}>Fri</div>
                <div style={{ height: '12px' }}></div>
                <div style={{ height: '12px' }}>Sun</div>
              </div>

              {/* Weeks */}
              {data.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.contributionDays.map((day, dayIndex) => (
                    <m.div
                      key={dayIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: weekIndex * 0.01 + dayIndex * 0.002 }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-150 hover:z-10 relative"
                      style={{
                        backgroundColor: day.color,
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                      title={`${day.contributionCount} contributions on ${day.date}`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Tooltip */}
            {hoveredDay && (
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{hoveredDay.contributionCount} contributions</span> on{' '}
                {new Date(hoveredDay.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ebedf0' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9be9a8' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#40c463' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#30a14e' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#216e39' }} />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </LazyMotion>
    </div>
  )
}
