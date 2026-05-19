'use client'

import { useState } from 'react'
import type { PoolDashboardData, Pool, Site } from '../lib/pool-types'
import { ParameterChart } from './PoolChart'
import { formatTime } from '../lib/utils'

const SITES: { id: Site; label: string }[] = [
  { id: 'churchfield', label: 'Churchfield' },
  { id: 'bishopstown', label: 'Bishopstown' },
]

function PoolCard({ pool, days }: { pool: Pool; days: number }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        🏊 {pool.name}
        {pool.lastUpdated && (
          <span className="text-xs text-slate-400 font-normal">
            Last reading: {formatTime(pool.lastUpdated)}
          </span>
        )}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pool.parameters.map((param) => (
          <ParameterChart key={param.name} param={param} days={days} />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ site }: { site: string }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <p className="text-4xl mb-3">🏊</p>
      <p className="text-sm">No pool readings found for {site}.</p>
      <p className="text-xs mt-1">Readings will appear once Trail tasks are completed.</p>
    </div>
  )
}

export default function PoolDashboard({ data }: { data: PoolDashboardData }) {
  const [activeSite, setActiveSite] = useState<Site>('churchfield')
  const [days, setDays] = useState<1 | 7>(1)

  const pools = data.sites[activeSite]

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Pool Water Quality
        </h2>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
          <button
            onClick={() => setDays(1)}
            className={`px-3 py-1.5 transition-colors ${days === 1 ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            24h
          </button>
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1.5 transition-colors ${days === 7 ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            7 days
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {SITES.map((site) => {
          const count = data.sites[site.id].length
          return (
            <button
              key={site.id}
              onClick={() => setActiveSite(site.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeSite === site.id
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {site.label}
              {count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeSite === site.id ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {pools.length === 0 ? (
        <EmptyState site={SITES.find((s) => s.id === activeSite)?.label ?? activeSite} />
      ) : (
        <div className="space-y-8">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} days={days} />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Fetched at {formatTime(data.fetchedAt)} · refreshes every 5 min
      </p>
    </section>
  )
}
