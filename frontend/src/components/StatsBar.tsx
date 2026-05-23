// src/components/StatsBar.tsx
import type { ApplicationStats } from '../api/types'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}

function StatCard({ label, value, sub, accent = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

interface Props {
  stats: ApplicationStats
}

export default function StatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard
        label="Total Applications"
        value={stats.total}
        sub="all time"
      />
      <StatCard
        label="Response Rate"
        value={`${stats.response_rate}%`}
        sub="moved past applied"
        accent={stats.response_rate >= 20 ? 'text-green-600' : 'text-gray-900'}
      />
      <StatCard
        label="Active Pipeline"
        value={stats.active_pipeline}
        sub="screening + interview"
        accent={stats.active_pipeline > 0 ? 'text-amber-600' : 'text-gray-900'}
      />
      <StatCard
        label="Offers"
        value={stats.offers}
        sub={stats.offers > 0 ? '🎉 congrats' : 'keep going'}
        accent={stats.offers > 0 ? 'text-green-600' : 'text-gray-900'}
      />
    </div>
  )
}
