import { fetchTrailDashboardData, getMockTrailData } from '../lib/trail'
import TrailSummaryCard from './TrailSummaryCard'
import TrailLocationRow from './TrailLocationRow'
import { formatTime } from '../lib/utils'

export default async function TrailDashboard() {
  let data
  const useMock = !process.env.TRAIL_API_KEY

  try {
    data = useMock ? getMockTrailData() : await fetchTrailDashboardData()
  } catch {
    return (
      <section className="rounded-xl border border-red-100 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">Trail data unavailable</h2>
        <p className="mt-1 text-sm text-red-600">
          Could not connect to Trail API. Check your API key and try again.
        </p>
      </section>
    )
  }

  const { totals, summaries, fetchedAt } = data

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Today&apos;s Operations — Trail
        </h2>
        {useMock && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            Demo data — add TRAIL_API_KEY to connect
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TrailSummaryCard
          label="Completion Rate"
          value={`${totals.overallCompletionRate}%`}
        />
        <TrailSummaryCard
          label="Tasks Complete"
          value={totals.completedTasks}
          color="green"
        />
        <TrailSummaryCard
          label="Pending"
          value={totals.pendingTasks}
          color="amber"
        />
        <TrailSummaryCard
          label="Overdue"
          value={totals.overdueTasks}
          color="red"
        />
      </div>

      {summaries.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100 px-6">
          {summaries.map((s) => (
            <TrailLocationRow key={s.locationId} summary={s} />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-3">
        {useMock
          ? 'Add TRAIL_API_KEY to .env.local to load live data'
          : `Last updated: ${formatTime(fetchedAt)} · refreshes every 5 min`}
      </p>
    </section>
  )
}
