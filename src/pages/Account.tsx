import { useAuth } from '../lib/auth'

export default function Account() {
  const { user, profile, signOut } = useAuth()
  return (
    <section className="max-w-2xl mx-auto px-5 py-16">
      <span className="chip">Account</span>
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight">Your account</h1>

      <div className="card p-6 mt-8 space-y-3">
        <Row label="Email" value={user?.email ?? '—'} />
        <Row label="Full name" value={profile?.full_name || (user?.user_metadata?.full_name as string) || '—'} />
        <Row label="Role" value={profile?.role ?? 'user'} />
        <Row label="Signed up" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'} />
      </div>

      <button onClick={signOut} className="btn-ghost mt-6">Sign out</button>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b border-[var(--color-border)] last:border-0 pb-2 last:pb-0">
      <span className="text-[var(--color-muted)]">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
