import { Users, Key, Shield, BarChart3, FileClock, Building2 } from 'lucide-react'

export type AdminTab = 'subscriptions' | 'access-codes' | 'admins' | 'stats' | 'audit' | 'orgs' | 'my-org'

const ALL_TABS: { id: AdminTab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'subscriptions', label: 'Subscriptions', icon: Users },
  { id: 'orgs',          label: 'Organizations', icon: Building2 },
  { id: 'access-codes',  label: 'Access Codes', icon: Key },
  { id: 'admins',        label: 'Admins', icon: Shield },
  { id: 'stats',         label: 'Stats', icon: BarChart3 },
  { id: 'audit',         label: 'Audit Log', icon: FileClock },
  { id: 'my-org',        label: 'My Organization', icon: Building2 },
]

export default function AdminTabs({ value, onChange, allowed }: { value: AdminTab; onChange: (v: AdminTab) => void; allowed: AdminTab[] }) {
  const tabs = ALL_TABS.filter(t => allowed.includes(t.id))
  return (
    <div className="inline-flex bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] rounded-lg p-1 border border-[var(--color-border)]">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition ${value === t.id ? 'bg-[color-mix(in_srgb,var(--color-fg)_8%,transparent)] text-[var(--color-fg)]' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'}`}
        >
          <t.icon size={14}/>{t.label}
        </button>
      ))}
    </div>
  )
}
