'use client'

import { useTheme }   from 'next-themes'
import { Sun, Moon }  from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-md
                 border border-[--border-color]
                 bg-[--surface]
                 text-[--text-muted] hover:text-[--text-color]
                 transition-colors duration-150"
    >
      {isDark
        ? <Sun  size={16} />
        : <Moon size={16} />
      }
    </button>
  )
}