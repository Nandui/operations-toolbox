import type { Pool, PoolDashboardData, PoolParameter, PoolReading, Site } from './pool-types'
import { DEFAULT_RANGES } from './pool-types'

const BASE_URL = process.env.TRAIL_API_BASE_URL ?? 'https://web.trailapp.com/api/v1'
const API_KEY = process.env.TRAIL_API_KEY

async function trailFetch<T>(path: string, revalidate = 300): Promise<T> {
  if (!API_KEY) throw new Error('TRAIL_API_KEY is not configured')
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Token ${API_KEY}`, 'Content-Type': 'application/json' },
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`Trail API error ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

// Detect site from task title prefix
function detectSite(title: string): Site {
  return title.startsWith('[CF]') ? 'churchfield' : 'bishopstown'
}

// Strip prefix and emoji to get a clean pool name
function cleanPoolName(title: string): string {
  return title
    .replace(/^\[CF\]\s*/, '')
    .replace(/^\[BT\]\s*/, '')
    .replace(/🧪\s*/g, '')
    .replace(/^Test\s+/i, '')
    .trim()
}

// Detect if a step name relates to chlorine or pH
function detectParameter(stepName: string): 'chlorine' | 'ph' | null {
  const lower = stepName.toLowerCase()
  if (lower.includes('chlorine') || lower.includes('cl')) return 'chlorine'
  if (lower.includes('ph')) return 'ph'
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractRange(step: any, type: 'chlorine' | 'ph') {
  const min = step.min_value ?? step.minValue ?? step.min ?? DEFAULT_RANGES[type].min
  const max = step.max_value ?? step.maxValue ?? step.max ?? DEFAULT_RANGES[type].max
  return { targetMin: Number(min), targetMax: Number(max) }
}

export async function fetchPoolDashboardData(days = 1): Promise<PoolDashboardData> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]

  // Fetch schedules/tasks that are water tests, plus their completions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schedulesRes = await trailFetch<any>('/schedules?per_page=100', 3600)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allSchedules: any[] = Array.isArray(schedulesRes)
    ? schedulesRes
    : (schedulesRes.data ?? schedulesRes.schedules ?? [])

  // Filter to water test tasks only (contain 🧪 or "test" + "pool"/"water")
  const waterTestSchedules = allSchedules.filter((s: { title?: string; name?: string }) => {
    const title: string = s.title ?? s.name ?? ''
    const lower = title.toLowerCase()
    return title.includes('🧪') || (lower.includes('test') && (lower.includes('pool') || lower.includes('water')))
  })

  // Fetch completions for each schedule in the date range
  const poolMap = new Map<string, Pool>()

  await Promise.all(
    waterTestSchedules.map(async (schedule: { id: string; title?: string; name?: string; steps?: unknown[] }) => {
      const title: string = schedule.title ?? schedule.name ?? ''
      const site = detectSite(title)
      const poolName = cleanPoolName(title)
      const poolKey = `${site}:${poolName}`

      if (!poolMap.has(poolKey)) {
        poolMap.set(poolKey, {
          id: schedule.id,
          name: poolName,
          site,
          parameters: [],
          lastUpdated: null,
        })
      }

      try {
        // Fetch completions for this schedule within the date range
        const completionsRes = await trailFetch<any>(
          `/schedules/${schedule.id}/completions?from=${sinceStr}&to=${today}&per_page=200`,
          300
        )
        const completions: any[] = Array.isArray(completionsRes)
          ? completionsRes
          : (completionsRes.data ?? completionsRes.completions ?? [])

        // Build readings from completion answers
        const chlorineReadings: PoolReading[] = []
        const phReadings: PoolReading[] = []
        let chlorineRange = { targetMin: DEFAULT_RANGES.chlorine.min, targetMax: DEFAULT_RANGES.chlorine.max }
        let phRange = { targetMin: DEFAULT_RANGES.ph.min, targetMax: DEFAULT_RANGES.ph.max }

        // Extract target ranges from schedule step definitions
        const steps: any[] = schedule.steps ?? []
        for (const step of steps) {
          const paramType = detectParameter(step.title ?? step.name ?? step.label ?? '')
          if (paramType === 'chlorine') chlorineRange = extractRange(step, 'chlorine')
          if (paramType === 'ph') phRange = extractRange(step, 'ph')
        }

        for (const completion of completions) {
          const ts: string = completion.completed_at ?? completion.completedAt ?? completion.created_at ?? ''
          const answers: any[] = completion.answers ?? completion.responses ?? completion.steps ?? []

          for (const answer of answers) {
            const stepTitle: string = answer.title ?? answer.name ?? answer.label ?? answer.step_title ?? ''
            const paramType = detectParameter(stepTitle)
            const rawValue = answer.value ?? answer.response ?? answer.answer

            if (paramType && rawValue !== null && rawValue !== undefined && rawValue !== '') {
              const numVal = Number(rawValue)
              if (!isNaN(numVal) && ts) {
                if (paramType === 'chlorine') chlorineReadings.push({ timestamp: ts, value: numVal })
                if (paramType === 'ph') phReadings.push({ timestamp: ts, value: numVal })
              }
            }
          }
        }

        // Sort readings by time
        const sortByTime = (a: PoolReading, b: PoolReading) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        chlorineReadings.sort(sortByTime)
        phReadings.sort(sortByTime)

        const pool = poolMap.get(poolKey)!
        const allReadingTimes = [...chlorineReadings, ...phReadings].map((r) => r.timestamp)
        pool.lastUpdated = allReadingTimes.length > 0
          ? allReadingTimes.sort().at(-1) ?? null
          : null

        const parameters: PoolParameter[] = []
        if (chlorineReadings.length > 0) {
          parameters.push({
            name: 'chlorine',
            label: 'Free Chlorine',
            unit: 'ppm',
            targetMin: chlorineRange.targetMin,
            targetMax: chlorineRange.targetMax,
            readings: chlorineReadings,
          })
        }
        if (phReadings.length > 0) {
          parameters.push({
            name: 'ph',
            label: 'pH',
            unit: '',
            targetMin: phRange.targetMin,
            targetMax: phRange.targetMax,
            readings: phReadings,
          })
        }
        pool.parameters = parameters
      } catch {
        // If fetching completions fails for one pool, skip it silently
      }
    })
  )

  const pools = Array.from(poolMap.values()).filter((p) => p.parameters.length > 0)

  return {
    sites: {
      churchfield: pools.filter((p) => p.site === 'churchfield'),
      bishopstown: pools.filter((p) => p.site === 'bishopstown'),
    },
    fetchedAt: new Date().toISOString(),
  }
}

export function getMockPoolData(): PoolDashboardData {
  const now = Date.now()
  const hour = 3600_000

  function makeReadings(base: number, variance: number, count: number): PoolReading[] {
    return Array.from({ length: count }, (_, i) => ({
      timestamp: new Date(now - (count - i) * hour).toISOString(),
      value: Math.round((base + (Math.random() - 0.5) * variance * 2) * 100) / 100,
    }))
  }

  const makePool = (id: string, name: string, site: Site): Pool => ({
    id,
    name,
    site,
    lastUpdated: new Date(now - 30 * 60_000).toISOString(),
    parameters: [
      {
        name: 'chlorine',
        label: 'Free Chlorine',
        unit: 'ppm',
        targetMin: 1,
        targetMax: 3,
        readings: makeReadings(2, 0.8, 24),
      },
      {
        name: 'ph',
        label: 'pH',
        unit: '',
        targetMin: 7.2,
        targetMax: 7.6,
        readings: makeReadings(7.4, 0.2, 24),
      },
    ],
  })

  return {
    fetchedAt: new Date().toISOString(),
    sites: {
      churchfield: [
        makePool('cf-1', 'Learners Pool', 'churchfield'),
        makePool('cf-2', '25 Meters Pool', 'churchfield'),
      ],
      bishopstown: [
        makePool('bt-1', '18 Meters Pool', 'bishopstown'),
      ],
    },
  }
}
