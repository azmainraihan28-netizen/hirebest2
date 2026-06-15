import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'

type Position = { left: number; width: number; opacity: number }

export type SlideTab = { label: string; to: string }

const defaultTabs: SlideTab[] = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Features', to: '/#features' },
  { label: 'Docs', to: '/blog' },
  { label: 'Blog', to: '/blog' },
]

export const SlideTabs: React.FC<{ tabs?: SlideTab[] }> = ({ tabs = defaultTabs }) => {
  const [position, setPosition] = useState<Position>({ left: 0, width: 0, opacity: 0 })
  const [selected, setSelected] = useState(0)
  const tabsRef = useRef<Array<HTMLLIElement | null>>([])
  const location = useLocation()

  useEffect(() => {
    const idx = tabs.findIndex(t => {
      const path = t.to.split('#')[0] || '/'
      return path === location.pathname
    })
    if (idx >= 0) setSelected(idx)
  }, [location.pathname, tabs])

  useEffect(() => {
    const selectedTab = tabsRef.current[selected]
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect()
      setPosition({ left: selectedTab.offsetLeft, width, opacity: 1 })
    }
  }, [selected])

  return (
    <ul
      onMouseLeave={() => {
        const selectedTab = tabsRef.current[selected]
        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect()
          setPosition({ left: selectedTab.offsetLeft, width, opacity: 1 })
        }
      }}
      className="relative mx-auto flex w-fit rounded-full border p-1"
      style={{
        borderColor: 'var(--color-border)',
        background: 'color-mix(in srgb, var(--color-card) 70%, transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab.label}
          ref={(el) => { tabsRef.current[i] = el }}
          setPosition={setPosition}
          to={tab.to}
          onClick={() => setSelected(i)}
        >
          {tab.label}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  )
}

type TabProps = {
  children: React.ReactNode
  setPosition: React.Dispatch<React.SetStateAction<Position>>
  to: string
  onClick: () => void
}

const Tab = React.forwardRef<HTMLLIElement, TabProps>(
  ({ children, setPosition, to, onClick }, ref) => {
    return (
      <li
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => {
          const node = (ref as React.RefObject<HTMLLIElement>)?.current
          if (!node) return
          const { width } = node.getBoundingClientRect()
          setPosition({ left: node.offsetLeft, width, opacity: 1 })
        }}
        className="relative z-10 block cursor-pointer text-xs font-medium uppercase tracking-wide"
        style={{ color: 'var(--color-fg)' }}
      >
        <NavLink
          to={to}
          className="block px-3 py-1.5 md:px-5 md:py-2 md:text-[13px]"
        >
          {children}
        </NavLink>
      </li>
    )
  }
)
Tab.displayName = 'Tab'

const Cursor: React.FC<{ position: Position }> = ({ position }) => {
  return (
    <motion.li
      animate={{ ...position }}
      className="absolute z-0 h-7 rounded-full md:h-9"
      style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        boxShadow: '0 4px 16px var(--color-glow)',
      }}
    />
  )
}

export default SlideTabs
