import { useEffect, useState } from 'react'
import { FileClock, RefreshCw } from 'lucide-react'
import { listAudit, type AuditEntry } from '../../lib/admin'

const ACTION_LABEL: Record<string, string> = {
  'profile.update': 'Updated user profile',
  'role.set': 'Changed user role',
  'access_code.create': 'Created access code',
  'access_code.delete': 'Deleted access code',
  'settings.update_default_limit': 'Updated default free limit',
}

export default function AuditPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { reload() }, [])
  const reload = async () => { setLoading(true); setEntries(await listAudit(200)); setLoading(false) }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold">Audit Log</div>
          <div className="text-xs text-[var(--color-muted)] mt-1">Last 200 admin actions, newest first.</div>
        </div>
        <button onClick={reload} className="btn-ghost text-xs"><RefreshCw size={12} className={loading ? 'animate-spin' : ''}/>Refresh</button>
      </div>

      <div className="card overflow-hidden">
        {loading && <div className="p-6 text-[var(--color-muted)] text-sm">Loading…</div>}
        {!loading && entries.length === 0 && <div className="p-6 text-[var(--color-muted)] text-sm">No actions recorded yet.</div>}
        {!loading && entries.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Actor</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Target</th>
                <th className="text-left p-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-3 text-[var(--color-muted)] text-xs whitespace-nowrap"><FileClock size={12} className="inline mr-1"/>{new Date(e.created_at).toLocaleString()}</td>
                  <td className="p-3 text-xs">{e.actor_email ?? '—'}</td>
                  <td className="p-3 text-xs">{ACTION_LABEL[e.action] ?? e.action}</td>
                  <td className="p-3 text-xs text-[var(--color-muted)]">{e.target_label ?? '—'}</td>
                  <td className="p-3 text-[10px] text-[var(--color-muted)] font-mono">{e.meta ? JSON.stringify(e.meta) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
