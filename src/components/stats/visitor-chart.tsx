"use client"

import { BarChart } from 'lucide-react'

export function VisitorChart() {
  // Placeholder - would integrate with a real charting library like Recharts or Chart.js
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const data = [120, 150, 180, 140, 200, 90, 110]
  const max = Math.max(...data)

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <BarChart className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Weekly Visitors</h3>
      </div>

      <div className="flex items-end justify-between gap-4 h-48">
        {days.map((day, index) => {
          const height = (data[index] / max) * 100
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-muted rounded-t flex items-end justify-center relative group" style={{ height: `${height}%` }}>
                <div className="absolute inset-0 bg-primary rounded-t opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-xs font-medium text-white mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {data[index]}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
