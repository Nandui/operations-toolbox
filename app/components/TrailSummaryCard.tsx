type Color = 'default' | 'green' | 'amber' | 'red'

const colorMap: Record<Color, string> = {
  default: 'bg-white text-slate-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
}

const valueColorMap: Record<Color, string> = {
  default: 'text-slate-900',
  green: 'text-emerald-700',
  amber: 'text-amber-600',
  red: 'text-red-600',
}

export default function TrailSummaryCard({
  label,
  value,
  color = 'default',
}: {
  label: string
  value: string | number
  color?: Color
}) {
  return (
    <div className={`rounded-xl p-5 shadow-sm border border-slate-100 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${valueColorMap[color]}`}>
        {value}
      </p>
    </div>
  )
}
