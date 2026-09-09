"use client"

import { useState } from 'react'
import { IconBrandGithub } from '@tabler/icons-react'
import useSWR from 'swr'
import { fetchJson, type ApiEnvelope } from '@/lib/fetcher'

interface ContributionDay {
  contributionCount: number
  date: string
  /** GitHub's own green. Kept in the type because the API sends it; not used. */
  color: string
}

/**
 * The heatmap in one ink.
 *
 * GitHub returns five hardcoded greens (#ebedf0 through #216e39) and this
 * component used to paint them directly, which put a third colour system on
 * the site beside Forest Ink and the changelog's four accents. The ramp is now
 * opacity on the one pen, derived from the count rather than the palette the
 * API happens to ship.
 */
const RAMP = [
  "hsl(var(--muted))",
  "hsl(var(--primary) / 0.25)",
  "hsl(var(--primary) / 0.45)",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary))",
] as const

function inkFor(count: number): string {
  if (count <= 0) return RAMP[0]
  if (count < 3) return RAMP[1]
  if (count < 6) return RAMP[2]
  if (count < 10) return RAMP[3]
  return RAMP[4]
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionsResponse {
  totalContributions: number
  weeks: ContributionWeek[]
  degraded: boolean
  message?: string
}

export function ContributionGraph() {
  const { data: envelope, error, isLoading } = useSWR<ApiEnvelope<ContributionsResponse>>(
    '/api/github/contributions',
    fetchJson,
    { revalidateOnFocus: false }
  )
  const data = envelope?.data
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null)

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-6">
          <IconBrandGithub className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">GitHub contributions</h2>
        </div>
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <IconBrandGithub className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">GitHub contributions</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          GitHub contribution data is temporarily unavailable.
        </p>
      </div>
    )
  }

  if (!data) return null

  if (data.degraded || data.weeks.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <IconBrandGithub className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">GitHub contributions</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {data.message || 'GitHub contribution data is temporarily unavailable.'}
        </p>
      </div>
    )
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  const displayMonths = Array.from({ length: 12 }, (_, offset) => ({
    key: `${currentMonth}-${offset}`,
    label: months[(currentMonth - 11 + offset + 12) % 12],
    showLabel: offset % 2 === 0,
  }))

  return (
    <div className="p-6 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <IconBrandGithub className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">GitHub contributions</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{data.totalContributions}</span> contributions in the last year
        </p>
      </div>

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
                    <div
                      key={dayIndex}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="relative h-3 w-3 cursor-pointer rounded-sm transition-colors hover:outline hover:outline-1 hover:outline-offset-1 hover:outline-primary/45"
                      style={{
                        backgroundColor: inkFor(day.contributionCount),
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
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RAMP[0] }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RAMP[1] }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RAMP[2] }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RAMP[3] }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RAMP[4] }} />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
    </div>
  )
}
