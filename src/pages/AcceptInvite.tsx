import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { acceptInvite } from '../lib/orgs'
import { useAuth } from '../lib/auth'

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>()
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const [state, setState] = useState<'idle' | 'accepting' | 'done' | 'error'>('idle')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (loading || !token) return
    if (!user) {
      nav(`/signup?redirect=${encodeURIComponent(`/invite/${token}`)}`, { replace: true })
      return
    }
    setState('accepting')
    acceptInvite(token)
      .then(() => { setState('done'); setTimeout(() => nav('/dashboard'), 1500) })
      .catch(e => { setState('error'); setErr(e?.message ?? 'Invite could not be accepted') })
  }, [loading, user, token, nav])

  return (
    <section className="max-w-md mx-auto px-5 py-24">
      <div className="card p-6 text-center space-y-4">
        {state === 'accepting' && (
          <>
            <Loader2 size={28} className="mx-auto animate-spin text-[var(--color-primary-2)]"/>
            <div className="font-semibold">Accepting invite…</div>
          </>
        )}
        {state === 'done' && (
          <>
            <CheckCircle2 size={28} className="mx-auto text-green-400"/>
            <div className="font-semibold">You're in!</div>
            <div className="text-xs text-[var(--color-muted)]">Redirecting to your dashboard…</div>
          </>
        )}
        {state === 'error' && (
          <>
            <AlertCircle size={28} className="mx-auto text-red-400"/>
            <div className="font-semibold">Invite could not be accepted</div>
            <div className="text-sm text-red-300">{err}</div>
            <Link to="/dashboard" className="btn-ghost text-xs inline-flex">Go to dashboard</Link>
          </>
        )}
      </div>
    </section>
  )
}
