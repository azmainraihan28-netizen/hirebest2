import { useEffect, useState } from 'react'
import { Shield, Users } from 'lucide-react'
import { supabase, type Profile } from '../lib/supabase'

export default function Admin() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data, error }) => {
        if (error) setErr(error.message)
        else setUsers((data ?? []) as Profile[])
        setLoading(false)
      })
  }, [])

  const setRole = async (id: string, role: 'user' | 'admin') => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) return alert(error.message)
    setUsers(u => u.map(x => x.id === id ? { ...x, role } : x))
  }

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center gap-3">
        <Shield className="text-[var(--color-primary-2)]"/>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Admin</h1>
      </div>
      <p className="mt-2 text-[var(--color-muted)]">All registered users.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Stat n={users.length} l="Total users"/>
        <Stat n={users.filter(u => u.role === 'admin').length} l="Admins"/>
        <Stat n={users.filter(u => new Date(u.created_at) > new Date(Date.now() - 7*864e5)).length} l="New this week"/>
        <Stat n={users.filter(u => new Date(u.created_at) > new Date(Date.now() - 24*36e5)).length} l="New today"/>
      </div>

      <div className="card mt-8 overflow-x-auto">
        <div className="flex items-center gap-2 p-5 border-b border-[var(--color-border)] text-sm font-semibold"><Users size={16}/>Users</div>
        {loading && <div className="p-6 text-[var(--color-muted)]">Loading…</div>}
        {err && <div className="p-6 text-red-300 text-sm">{err}</div>}
        {!loading && !err && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)] text-xs uppercase">
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 text-[var(--color-muted)]">{u.full_name ?? '—'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${u.role === 'admin' ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-2)]' : 'bg-white/5 text-[var(--color-muted)]'}`}>{u.role}</span>
                  </td>
                  <td className="p-4 text-[var(--color-muted)] text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {u.role === 'admin'
                      ? <button onClick={() => setRole(u.id, 'user')} className="text-xs text-[var(--color-muted)] hover:text-white">Demote</button>
                      : <button onClick={() => setRole(u.id, 'admin')} className="text-xs text-[var(--color-primary-2)] hover:underline">Make admin</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="card p-5 text-center">
      <div className="text-3xl font-extrabold gradient-text">{n}</div>
      <div className="text-xs text-[var(--color-muted)] mt-1 uppercase tracking-wider">{l}</div>
    </div>
  )
}
