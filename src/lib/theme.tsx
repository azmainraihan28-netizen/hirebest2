import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'
type Ctx = { theme: Theme; toggle: () => void }
const ThemeCtx = createContext<Ctx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem('hb-theme') as Theme) || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hb-theme', theme)
  }, [theme])

  return (
    <ThemeCtx.Provider value={{ theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  const c = useContext(ThemeCtx)
  if (!c) throw new Error('useTheme outside provider')
  return c
}
