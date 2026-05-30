import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Login() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex flex-col justify-between w-1/2 p-10 bg-gradient-to-br from-[var(--color-bg-2)] to-[var(--color-bg)] relative">
        <div className="glow absolute inset-0 -z-10"/>
        <Logo size={32}/>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Screen 100 CVs in the time it takes to read 3.</h2>
          <p className="mt-4 text-[var(--color-muted)] max-w-md">AI-powered resume screening for modern HR teams. Fit, Maybe, Skip — at a glance.</p>
        </div>
        <p className="text-xs text-[var(--color-muted)]">© HireBest</p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8"><Logo size={32}/></div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Sign in to continue screening candidates</p>
          <form className="mt-7 space-y-3" onSubmit={e => e.preventDefault()}>
            <button type="button" className="btn-ghost w-full justify-center">Continue with Google</button>
            <div className="flex items-center gap-3 my-4 text-xs text-[var(--color-muted)]">
              <div className="flex-1 h-px bg-[var(--color-border)]"/>OR<div className="flex-1 h-px bg-[var(--color-border)]"/>
            </div>
            <input type="email" placeholder="Email" className="field"/>
            <input type="password" placeholder="Password" className="field"/>
            <button type="submit" className="btn-primary w-full justify-center">Sign in</button>
          </form>
          <p className="mt-6 text-sm text-[var(--color-muted)] text-center">No account? <Link to="/signup" className="text-[var(--color-primary-2)]">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
