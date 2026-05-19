import type { TrailTaskSummary } from '../lib/trail-types'

function rateColor(rate: number): string {
  if (rate >= 90) return 'bg-emerald-500'
  if (rate >= 70) return 'bg-amber-400'
  return 'bg-red-500'
}

export default function TrailLocationRow({ summary }: { summary: TrailTaskSummary }) {
  const { locationName, completionRate, completedTasks, totalTasks, pendingTasks, overdueTasks } = summary
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-4">
      <div className="sm:w-40 font-medium text-slate-700 truncate">{locationName}</div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100} aria-label={`${locationName} completion rate`}>
          <div className={`h-full rounded-full transition-all ${rateColor(completionRate)}`} style={{ width: `${completionRate}%` }} />
        </div>
        <span className="text-sm font-semibold tabular-nums text-slate-600 w-10 text-right">{completionRate}%</span>
      </div>
      <div className="flex gap-4 text-xs text-slate-500 sm:w-48">
        <span><span className="font-semibold text-slate-700">{completedTasks}</span>/{totalTasks} done</span>
        {pendingTasks > 0 && <span className="text-amber-600 font-medium">{pendingTasks} pending</span>}
        {overdueTasks > 0 && <span className="text-red-600 font-semibold">{overdueTasks} overdue</span>}
      </div>
    </div>
  )
}
