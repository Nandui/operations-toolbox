export type Site = 'churchfield' | 'bishopstown'

export interface PoolReading {
  timestamp: string
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
  name: string
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

export const DEFAULT_RANGES: Record<'chlorine' | 'ph', { min: number; max: number }> = {
  chlorine: { min: 1, max: 3 },
  ph: { min: 7.2, max: 7.6 },
}
