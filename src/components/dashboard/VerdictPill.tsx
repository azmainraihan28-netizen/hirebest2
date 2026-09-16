import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

const MAP = {
  Fit:   { cls: 'verdict-fit',   Icon: CheckCircle2 },
  Maybe: { cls: 'verdict-maybe', Icon: AlertCircle },
  Skip:  { cls: 'verdict-skip',  Icon: XCircle },
} as const

/** Status is icon + label + color — never color alone. */
export default function VerdictPill({ verdict, compact = false }: { verdict: 'Fit' | 'Maybe' | 'Skip'; compact?: boolean }) {
  const { cls, Icon } = MAP[verdict]
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-md ${cls} ${compact ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}>
      <Icon size={compact ? 11 : 12}/>{verdict}
    </span>
  )
}
