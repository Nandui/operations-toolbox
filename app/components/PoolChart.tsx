'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts'
import type { PoolParameter } from '../lib/pool-types'

function formatTick(iso: string, days: number) {
  const d = new Date(iso)
  if (days <= 1) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

function statusColor(value: number, min: number, max: number) {
  if (value < min || value > max) return '#ef4444'
  const margin = (max - min) * 0.1
  if (value < min + margin || value > max - margin) return '#f59e0b'
  return '#10b981'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, param }: any) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value
  const color = value != null ? statusColor(value, param.targetMin, param.targetMax) : '#64748b'
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="text-slate-500 text-xs mb-1">
        {new Date(label).toLocaleString('en-GB', {
          weekday: 'short', day: 'numeric', month: 'short',
          hour: '2-digit', minute: '2-digit',
        })}
      </p>
      <p className="font-semibold" style={{ color }}>
        {value}{param.unit ? ` ${param.unit}` : ''}
      </p>
      <p className="text-xs text-slate-400 mt-0.5">
        Target: {param.targetMin}–{param.targetMax}{param.unit ? ` ${param.unit}` : ''}
      </p>
    </div>
  )
}

function LatestBadge({ param }: { param: PoolParameter }) {
  if (!param.readings.length) return null
  const latest = param.readings[param.readings.length - 1]
  const color = statusColor(latest.value, param.targetMin, param.targetMax)
  const inRange = latest.value >= param.targetMin && latest.value <= param.targetMax
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold tabular-nums" style={{ color }}>
        {latest.value}{param.unit}
      </span>
      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
        {inRange ? 'In range' : latest.value < param.targetMin ? 'Too low' : 'Too high'}
      </span>
    </div>
  )
}

export function ParameterChart({ param, days }: { param: PoolParameter; days: number }) {
  const data = param.readings.map((r) => ({ time: r.timestamp, value: r.value }))
  const allValues = param.readings.map((r) => r.value)
  const minVal = Math.min(...allValues, param.targetMin)
  const maxVal = Math.max(...allValues, param.targetMax)
  const padding = (maxVal - minVal) * 0.2 || 0.5
  const yMin = Math.max(0, minVal - padding)
  const yMax = maxVal + padding

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{param.label}</p>
          <LatestBadge param={param} />
          <p className="text-xs text-slate-400 mt-0.5">
            Target: {param.targetMin}–{param.targetMax}{param.unit ? ` ${param.unit}` : ''}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => formatTick(v, days)}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            tickCount={5}
          />
          <ReferenceArea y1={param.targetMin} y2={param.targetMax} fill="#10b981" fillOpacity={0.08} />
          <ReferenceLine y={param.targetMin} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
          <ReferenceLine y={param.targetMax} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
          <Tooltip content={<CustomTooltip param={param} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props
              const color = statusColor(payload.value, param.targetMin, param.targetMax)
              return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={color} stroke="white" strokeWidth={1.5} />
            }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
