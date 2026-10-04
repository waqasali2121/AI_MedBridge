import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('medbridge_theme') || 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    let effectiveTheme = theme
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      effectiveTheme = systemTheme
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e) => {
        if (theme === 'system') {
           root.classList.remove('light', 'dark')
           root.classList.add(e.matches ? 'dark' : 'light')
        }
      }
      mediaQuery.addEventListener('change', handleChange)
      
      root.classList.add(effectiveTheme)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      root.classList.add(theme)
    }
    
    localStorage.setItem('medbridge_theme', theme)
  }, [theme])

  const value = { theme, setTheme }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
