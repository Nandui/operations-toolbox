import type { QuickLink } from '../lib/config'
import QuickLinkCard from './QuickLinkCard'

export default function QuickLinks({ links }: { links: QuickLink[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {links.map((link) => <QuickLinkCard key={link.label} link={link} />)}
      </div>
    </section>
  )
}
