import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import UserMenu from './UserMenu'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { SlideTabs, type SlideTab } from './ui/slide-tabs'

const links = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/tools/interview-questions', label: 'Free Tools' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

const slideTabs: SlideTab[] = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Tools', to: '/tools/interview-questions' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  return (
    <header className="site-header sticky top-0 z-40 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden lg:flex items-center">
          <SlideTabs tabs={slideTabs} />
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
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <NavLink to="/login" className="btn-ghost">Log in</NavLink>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 360, damping: 22 }}>
                <NavLink to="/signup" className="btn-primary">Get started</NavLink>
              </motion.div>
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { type: 'spring', stiffness: 240, damping: 28 }, opacity: { duration: 0.2 } }}
            className="mobile-menu lg:hidden border-t border-[var(--color-border)] overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="px-5 py-4 flex flex-col gap-3"
            >
              {links.map(l => (
                <motion.a
                  key={l.to}
                  href={l.to}
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                  className="text-[var(--color-muted)] hover:text-[var(--color-fg)]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.div variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }} className="flex gap-2 pt-2">
                {user ? (
                  <Link to="/dashboard" className="btn-primary flex-1 justify-center">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-ghost flex-1 justify-center">Log in</Link>
                    <Link to="/signup" className="btn-primary flex-1 justify-center">Get started</Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
