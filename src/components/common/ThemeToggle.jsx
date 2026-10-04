import React from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ]

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700">
      {options.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
              isActive 
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={option.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}
