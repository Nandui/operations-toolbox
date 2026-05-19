export type Site = 'churchfield' | 'bishopstown'

export interface PoolReading {
  timestamp: string       // ISO string
  value: number
}

export interface PoolParameter {
  name: 'chlorine' | 'ph'
  label: string
  unit: string
  targetMin: number
  targetMax: number
  readings: PoolReading[]
}

export interface Pool {
  id: string
  name: string            // e.g. "Learners Pool", "25 Meters Pool"
  site: Site
  parameters: PoolParameter[]
  lastUpdated: string | null
}

export interface PoolDashboardData {
  sites: {
    churchfield: Pool[]
    bishopstown: Pool[]
  }
  fetchedAt: string
}

// Standard fallback ranges if Trail doesn't provide them
export const DEFAULT_RANGES: Record<'chlorine' | 'ph', { min: number; max: number }> = {
  chlorine: { min: 1, max: 3 },
  ph: { min: 7.2, max: 7.6 },
}
