import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'
type Ctx = { theme: Theme; toggle: () => void }
const ThemeCtx = createContext<Ctx | null>(null)

const readStored = (): Theme => {
  try { return localStorage.getItem('hb-theme') === 'light' ? 'light' : 'dark' } catch { return 'dark' }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // First render is always 'dark', the theme the prerendered HTML was built
  // with, so hydration matches. A saved light theme is applied right after,
  // before paint; index.html already set data-theme so nothing flashes.
  // Dark visitors get no update at all, which keeps lazy pages hydrating.
  const [theme, setTheme] = useState<Theme>('dark')
  const firstRun = useRef(true)

  useLayoutEffect(() => {
    const stored = readStored()
    if (stored !== 'dark') setTheme(stored)
  }, [])

  useEffect(() => {
    // index.html and localStorage already hold the right value on mount.
    if (firstRun.current) { firstRun.current = false; return }
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('hb-theme', theme) } catch { /* private mode */ }
  }, [theme])

  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), [])
  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const c = useContext(ThemeCtx)
  if (!c) throw new Error('useTheme outside provider')
  return c
}
