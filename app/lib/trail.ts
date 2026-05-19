import type { TrailLocation, TrailTaskSummary, TrailDashboardData } from './trail-types'

const BASE_URL = process.env.TRAIL_API_BASE_URL ?? 'https://web.trailapp.com/api/v1'
const API_KEY = process.env.TRAIL_API_KEY

async function trailFetch<T>(path: string, revalidate = 300): Promise<T> {
  if (!API_KEY) throw new Error('TRAIL_API_KEY is not configured in .env.local')

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate },
  })

  if (!res.ok) {
    throw new Error(`Trail API error ${res.status} for ${path}`)
  }

  return res.json() as Promise<T>
}

function buildSummaries(
  locations: TrailLocation[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawReports: any[]
): TrailTaskSummary[] {
  const today = new Date().toISOString().split('T')[0]
  const reportByLocation = new Map<string, typeof rawReports[number]>()

  for (const report of rawReports) {
    const locId = report.location_id ?? report.locationId ?? report.id
    if (locId) reportByLocation.set(String(locId), report)
  }

  return locations.map((loc) => {
    const report = reportByLocation.get(loc.id) ?? {}
    const total = Number(report.total_tasks ?? report.totalTasks ?? 0)
    const completed = Number(report.completed_tasks ?? report.completedTasks ?? 0)
    const overdue = Number(report.overdue_tasks ?? report.overdueTasks ?? 0)
    const pending = total - completed - overdue < 0 ? 0 : total - completed - overdue
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      locationId: loc.id,
      locationName: loc.name,
      date: today,
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      completionRate: rate,
    }
  })
}

function computeTotals(summaries: TrailTaskSummary[]) {
  const totalTasks = summaries.reduce((s, r) => s + r.totalTasks, 0)
  const completedTasks = summaries.reduce((s, r) => s + r.completedTasks, 0)
  const pendingTasks = summaries.reduce((s, r) => s + r.pendingTasks, 0)
  const overdueTasks = summaries.reduce((s, r) => s + r.overdueTasks, 0)
  const overallCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return { totalTasks, completedTasks, pendingTasks, overdueTasks, overallCompletionRate }
}

export async function fetchTrailDashboardData(): Promise<TrailDashboardData> {
  const today = new Date().toISOString().split('T')[0]

  const [locationsRes, reportsRes] = await Promise.all([
    trailFetch<{ data?: TrailLocation[]; locations?: TrailLocation[] } | TrailLocation[]>(
      '/locations',
      3600
    ),
    trailFetch<{ data?: unknown[]; reports?: unknown[] } | unknown[]>(
      `/task-reports?date=${today}`,
      300
    ),
  ])

  const locations: TrailLocation[] = Array.isArray(locationsRes)
    ? locationsRes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : ((locationsRes as any).data ?? (locationsRes as any).locations ?? [])

  const rawReports: unknown[] = Array.isArray(reportsRes)
    ? reportsRes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : ((reportsRes as any).data ?? (reportsRes as any).reports ?? [])

  const summaries = buildSummaries(locations, rawReports as Record<string, unknown>[])
  const totals = computeTotals(summaries)

  return {
    fetchedAt: new Date().toISOString(),
    locations,
    summaries,
    totals,
  }
}

export function getMockTrailData(): TrailDashboardData {
  const today = new Date().toISOString().split('T')[0]
  const locations: TrailLocation[] = [
    { id: '1', name: 'Main Street' },
    { id: '2', name: 'City Centre' },
    { id: '3', name: 'Airport Branch' },
  ]

  const summaries: TrailTaskSummary[] = [
    { locationId: '1', locationName: 'Main Street', date: today, totalTasks: 24, completedTasks: 22, pendingTasks: 1, overdueTasks: 1, completionRate: 92 },
    { locationId: '2', locationName: 'City Centre', date: today, totalTasks: 18, completedTasks: 18, pendingTasks: 0, overdueTasks: 0, completionRate: 100 },
    { locationId: '3', locationName: 'Airport Branch', date: today, totalTasks: 30, completedTasks: 21, pendingTasks: 7, overdueTasks: 2, completionRate: 70 },
  ]

  return {
    fetchedAt: new Date().toISOString(),
    locations,
    summaries,
    totals: {
      totalTasks: 72,
      completedTasks: 61,
      pendingTasks: 8,
      overdueTasks: 3,
      overallCompletionRate: 85,
    },
  }
}
