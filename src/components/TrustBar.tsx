import { Shield, Lock, Globe } from 'lucide-react'

const signals = [
  { icon: Shield, label: 'GDPR compliant', sub: 'EU data protection standards' },
  { icon: Lock, label: 'Data not used for training', sub: 'Your CVs stay private' },
  { icon: Globe, label: 'Row-level security', sub: 'Supabase RLS — your data isolated' },
]

export default function TrustBar() {
  return (
    <section className="max-w-5xl mx-auto px-5 py-6">
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {signals.map(s => (
          <div key={s.label} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(22,163,74,0.12)] flex items-center justify-center shrink-0">
              <s.icon size={16} className="text-[#16A34A]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[var(--color-fg)]">{s.label}</div>
              <div className="text-[10px] text-[var(--color-muted)]">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
