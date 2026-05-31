import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import Logo from './Logo'
import UserMenu from './UserMenu'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'

const links = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/tools/interview-questions', label: 'Free Tools' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  return (
    <header className="site-header sticky top-0 z-40 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-6 text-sm text-[var(--color-muted)]">
          {links.map(l => (
            <a key={l.to} href={l.to} className="hover:text-[var(--color-fg)] transition">{l.label}</a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <button onClick={toggle} className="w-9 h-9 rounded-full hover:bg-[color-mix(in_srgb,var(--color-fg)_5%,transparent)] flex items-center justify-center text-[var(--color-muted)]" title="Toggle theme">
            {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
              <UserMenu />
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-ghost">Log in</NavLink>
              <NavLink to="/signup" className="btn-primary">Get started</NavLink>
            </>
          )}
        </div>
        <div className="lg:hidden flex items-center gap-1">
          <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-muted)]" title="Toggle theme">
            {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
          </button>
          <button className="text-[var(--color-fg)] p-1" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[var(--color-border)] px-5 py-4 flex flex-col gap-3">
          {links.map(l => (
            <a key={l.to} href={l.to} className="text-[var(--color-muted)] hover:text-[var(--color-fg)]" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary flex-1 justify-center">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost flex-1 justify-center">Log in</Link>
                <Link to="/signup" className="btn-primary flex-1 justify-center">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
