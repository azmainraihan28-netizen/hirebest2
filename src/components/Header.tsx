import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

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
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[rgba(6,10,26,0.75)] border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center gap-6 text-sm text-[var(--color-muted)]">
          {links.map(l => (
            <a key={l.to} href={l.to} className="hover:text-white transition">{l.label}</a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <NavLink to="/login" className="btn-ghost">Log in</NavLink>
          <NavLink to="/signup" className="btn-primary">Get started</NavLink>
        </div>
        <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[var(--color-border)] px-5 py-4 flex flex-col gap-3">
          {links.map(l => (
            <a key={l.to} href={l.to} className="text-[var(--color-muted)] hover:text-white" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="btn-ghost flex-1 justify-center">Log in</Link>
            <Link to="/signup" className="btn-primary flex-1 justify-center">Get started</Link>
          </div>
        </div>
      )}
    </header>
  )
}
