import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { storage } from '@/lib/storage'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

async function getPreferredTheme(defaultTheme?: Theme): Promise<Theme> {
  const stored = await storage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return defaultTheme || 'dark'
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const systemTheme = useColorScheme()
  const [theme, setTheme] = useState<Theme>(defaultTheme || (systemTheme === 'dark' ? 'dark' : 'light'))

  useEffect(() => {
    getPreferredTheme(defaultTheme).then((preferred) => {
      setTheme(preferred)
    })
  }, [defaultTheme])

  useEffect(() => {
    storage.setItem('theme', theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        setTheme(newTheme)
        storage.setItem('theme', newTheme)
      },
      toggleTheme: () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)
        storage.setItem('theme', newTheme)
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used within ThemeProvider')
  return value
}
