import { fetchPoolDashboardData, getMockPoolData } from '../lib/pool'
import PoolDashboard from './PoolDashboard'

export default async function PoolDashboardServer() {
  const useMock = !process.env.TRAIL_API_KEY

  let data
  try {
    data = useMock ? getMockPoolData() : await fetchPoolDashboardData(1)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return (
      <section className="rounded-xl border border-red-100 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">Pool data unavailable</h2>
        <p className="mt-1 text-sm text-red-600 font-mono break-all">{msg}</p>
      </section>
    )
  }

  return <PoolDashboard data={data} />
}
