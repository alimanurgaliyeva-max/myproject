import { useState } from 'react'

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch { return initial }
  })
  const set = v => {
    setValue(v)
    try { localStorage.setItem(key, JSON.stringify(v)) } catch {}
  }
  return [value, set]
}
