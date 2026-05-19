import LiveClock from './LiveClock'
import { getDashboardTitle } from '../lib/config'
import { formatDateLong } from '../lib/utils'

export default function Header() {
  const title = getDashboardTitle()
  const date = formatDateLong()

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{date}</p>
      </div>
      <LiveClock />
    </header>
  )
}
