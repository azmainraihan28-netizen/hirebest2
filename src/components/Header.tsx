import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon, ArrowRight, ArrowUpRight } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import Logo from './Logo'
import UserMenu from './UserMenu'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { Magnetic } from './motion/primitives'

const links = [
  { to: '/#features',                 label: 'Product',  hash: true },
  { to: '/#how-it-works',             label: 'How it works', hash: true },
  { to: '/pricing',                   label: 'Pricing' },
  { to: '/tools/interview-questions', label: 'Free tools' },
  { to: '/blog',                      label: 'Blog' },
  { to: '/contact',                   label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [compact, setCompact] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()
  const loc = useLocation()

  // Hide on the way down, reveal on the way up — the bar gets out of the way of reading.
  useMotionValueEvent(scrollY, 'change', y => {
    const prev = scrollY.getPrevious() ?? 0
    setCompact(y > 24)
    if (reduce) return
    setHidden(y > 240 && y > prev && !open)
  })

  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => { document.documentElement.style.overflow = '' }
  }, [open])

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 px-3 md:px-5 pt-3"
        animate={{ y: hidden ? -96 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <motion.div
          layout
          className={`nav-pill mx-auto flex items-center justify-between gap-4 rounded-full transition-[max-width,padding] duration-500 ${
            compact ? 'max-w-5xl py-2 pl-4 pr-2' : 'max-w-7xl py-2.5 pl-5 pr-2.5'
          }`}
        >
          <Logo />

          <nav className="hidden lg:flex items-center" onMouseLeave={() => setHovered(null)}>
            {links.map(l => {
              const inner = (
                <>
                  {hovered === l.to && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--color-fg)_7%,transparent)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </>
              )
              return l.hash ? (
                <a key={l.to} href={l.to} onMouseEnter={() => setHovered(l.to)} className="nav-link">{inner}</a>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onMouseEnter={() => setHovered(l.to)}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {inner}
                </NavLink>
              )
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[color-mix(in_srgb,var(--color-fg)_6%,transparent)] transition"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
                </motion.span>
              </AnimatePresence>
            </button>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <UserMenu />
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-link">Sign in</NavLink>
                <Magnetic strength={0.25}>
                  <Link to="/signup" className="btn-primary">
                    Start free <ArrowRight size={14}/>
                  </Link>
                </Magnetic>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-1">
            <button onClick={toggle} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-muted)]" aria-label="Toggle theme">
              {theme === 'dark' ? <Moon size={16}/> : <Sun size={16}/>}
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[color-mix(in_srgb,var(--color-fg)_7%,transparent)] text-[var(--color-fg)]"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </motion.div>
      </motion.header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            className="lg:hidden fixed inset-0 z-40 bg-[var(--color-bg)] pt-24 px-6 pb-8 flex flex-col"
            initial={{ clipPath: 'circle(0% at 92% 6%)' }}
            animate={{ clipPath: 'circle(150% at 92% 6%)' }}
            exit={{ clipPath: 'circle(0% at 92% 6%)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="aurora opacity-60" aria-hidden><span/><span/><span/></div>
            <motion.nav
              className="relative flex flex-col"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
            >
              {links.map((l, i) => (
                <motion.a
                  key={l.to}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
                  className="group flex items-baseline justify-between py-3 border-b border-[var(--color-border)]"
                >
                  <span className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-[-0.04em]">{l.label}</span>
                  <span className="font-mono text-xs text-[var(--color-muted)]">0{i + 1}</span>
                </motion.a>
              ))}
            </motion.nav>
            <div className="relative mt-auto flex gap-2">
              {user ? (
                <Link to="/dashboard" className="btn-primary btn-lg flex-1 justify-center">Dashboard <ArrowUpRight size={16}/></Link>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost btn-lg flex-1 justify-center">Sign in</Link>
                  <Link to="/signup" className="btn-primary btn-lg flex-1 justify-center">Start free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
