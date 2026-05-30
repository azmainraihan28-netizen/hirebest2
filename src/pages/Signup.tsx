import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Logo from '../components/Logo'
import { useAuth } from '../lib/auth'

export default function Signup() {
  const { user, signUpWithEmail, signInWithGoogle } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (user) nav('/dashboard', { replace: true }) }, [user, nav])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setMsg(null); setBusy(true)
    const { error } = await signUpWithEmail(email, password, name)
    setBusy(false)
    if (error) setErr(error)
    else setMsg('Check your email to confirm your account.')
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex flex-col justify-between w-1/2 p-10 bg-gradient-to-br from-[var(--color-bg-2)] to-[var(--color-bg)] relative">
        <div className="glow absolute inset-0 -z-10"/>
        <Logo size={32}/>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Find the right hires, faster.</h2>
          <p className="mt-4 text-[var(--color-muted)] max-w-md">Upload a JD and 50 CVs. We rank them in under a minute.</p>
        </div>
        <p className="text-xs text-[var(--color-muted)]">© HireBest</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8"><Logo size={32}/></div>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Start screening CVs in minutes</p>
          <form className="mt-7 space-y-3" onSubmit={onSubmit}>
            <button type="button" onClick={signInWithGoogle} className="btn-ghost w-full justify-center">Continue with Google</button>
            <div className="flex items-center gap-3 my-4 text-xs text-[var(--color-muted)]">
              <div className="flex-1 h-px bg-[var(--color-border)]"/>OR<div className="flex-1 h-px bg-[var(--color-border)]"/>
            </div>
            <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="field"/>
            <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="field"/>
            <input type="password" required minLength={6} placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} className="field"/>
            {err && <p className="text-sm text-red-300">{err}</p>}
            {msg && <p className="text-sm text-[var(--color-primary-2)]">{msg}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center">{busy ? 'Creating…' : 'Sign up'}</button>
          </form>
          <p className="mt-6 text-sm text-[var(--color-muted)] text-center">Already have an account? <Link to="/login" className="text-[var(--color-primary-2)]">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
