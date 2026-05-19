import { Suspense } from 'react'
import Header from './components/Header'
import QuickLinks from './components/QuickLinks'
import TrailDashboard from './components/TrailDashboard'
import Footer from './components/Footer'
import { getQuickLinksConfig } from './lib/config'

function TrailSkeleton() {
  return (
    <section>
      <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="mt-6 h-40 bg-slate-100 rounded-xl animate-pulse" />
    </section>
  )
}

export default function DashboardPage() {
  const links = getQuickLinksConfig()

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Header />
      <QuickLinks links={links} />
      <Suspense fallback={<TrailSkeleton />}>
        <TrailDashboard />
      </Suspense>
      <Footer />
    </main>
  )
}
