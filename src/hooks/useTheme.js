import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage.js'

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('checkers-theme', 'light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}
