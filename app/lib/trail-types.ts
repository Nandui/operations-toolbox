export interface TrailLocation {
  id: string
  name: string
  timezone?: string
}

export interface TrailTaskSummary {
  locationId: string
  locationName: string
  date: string
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
}

export interface TrailDashboardData {
  fetchedAt: string
  locations: TrailLocation[]
  summaries: TrailTaskSummary[]
  totals: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    overdueTasks: number
    overallCompletionRate: number
  }
}
