import { useEffect, useState } from 'react'
import { Users, FileText, Sparkles, Infinity } from 'lucide-react'
import { listProfilesWithUsage, type ExtProfile } from '../../lib/admin'

export default function StatsPanel() {
  const [users, setUsers] = useState<ExtProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { listProfilesWithUsage().then(u => { setUsers(u); setLoading(false) }) }, [])

  if (loading) return <div className="text-[var(--color-muted)] text-sm">Loading…</div>

  const total = users.length
  const lifetime = users.filter(u => u.plan === 'lifetime').length
  const active = users.filter(u => u.active).length
  const totalScreenings = users.reduce((s, u) => s + u.screenings_used, 0)
  const last7 = users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 864e5)).length
  const last30 = users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 864e5)).length

  // Signup chart — last 14 days bar
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    d.setHours(0, 0, 0, 0)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const count = users.filter(u => {
      const t = new Date(u.created_at)
      return t >= d && t < next
    }).length
    return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count }
  })
  const maxCount = Math.max(1, ...days.map(d => d.count))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<Users size={18}/>} label="Total users" value={total} sub={`+${last7} this week`}/>
        <Stat icon={<Infinity size={18}/>} label="Lifetime plans" value={lifetime} sub={`${total ? Math.round(lifetime/total*100) : 0}% of users`}/>
        <Stat icon={<Sparkles size={18}/>} label="Active users" value={active} sub={`${total - active} suspended`}/>
        <Stat icon={<FileText size={18}/>} label="CVs scored" value={totalScreenings} sub={`Across all users`}/>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-1">Signups — last 14 days</h3>
        <div className="text-xs text-[var(--color-muted)] mb-5">{last30} new users in the last 30 days</div>
        <div className="flex items-end gap-2 h-40">
          {days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-[10px] text-[var(--color-muted)]">{d.count}</div>
              <div className="w-full rounded-t bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary-2)]" style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count ? 4 : 1 }}/>
              <div className="text-[9px] text-[var(--color-muted)] -rotate-45 origin-top-left h-6 whitespace-nowrap">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</div>
          <div className="text-3xl font-bold mt-2">{value}</div>
          <div className="text-[11px] text-[var(--color-muted)] mt-1">{sub}</div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] flex items-center justify-center text-[var(--color-primary-2)]">{icon}</div>
      </div>
    </div>
  )
}
