import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import UserMenu from './UserMenu'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { SlideTabs, type SlideTab } from './ui/slide-tabs'

const links = [
  { to: '/#features',                  label: 'Features' },
  { to: '/#how-it-works',              label: 'How it works' },
  { to: '/pricing',                    label: 'Pricing' },
  { to: '/analytics',                  label: 'Analytics' },
  { to: '/tools/interview-questions',  label: 'Free Tools' },
  { to: '/blog',                       label: 'Blog' },
  { to: '/contact',                    label: 'Contact' },
]

const slideTabs: SlideTab[] = [
  { label: 'Home',    to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Tools',   to: '/tools/interview-questions' },
  { label: 'Blog',    to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`site-header sticky top-0 z-40 transition-[border-color,background-color] duration-300 ${scrolled ? '' : 'border-b-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo />
        </div>

        <nav className="hidden lg:flex items-center flex-1 justify-center">
          <SlideTabs tabs={slideTabs} />
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.08, rotate: theme === 'dark' ? -12 : 12 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="w-9 h-9 rounded-full border border-transparent hover:border-[var(--color-border)] hover:bg-[color-mix(in_srgb,var(--color-fg)_4%,transparent)] flex items-center justify-center text-[var(--color-muted)]"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
          </motion.button>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
              <UserMenu />
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn-ghost">Sign in</NavLink>
              <motion.div
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                <NavLink to="/signup" className="btn-primary">
                  Get started
                  <ArrowRight size={14}/>
                </NavLink>
              </motion.div>
            </>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-muted)]"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center text-[var(--color-fg)]"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={20}/> : <Menu size={20}/>}
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
              className="px-5 py-5 flex flex-col gap-1"
            >
              {links.map(l => (
                <motion.a
                  key={l.to}
                  href={l.to}
                  variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                  className="text-sm text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] py-2 border-b border-[var(--color-border)] last:border-0"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                className="flex gap-2 pt-4"
              >
                {user ? (
                  <Link to="/dashboard" className="btn-primary flex-1 justify-center">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-ghost flex-1 justify-center">Sign in</Link>
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
