import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, FileText, Pill, Store, AlertTriangle, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

export function MobileNav() {
  const { role } = useAuth()
  const { t } = useLanguage()

  if (role !== 'patient') return null

  const items = [
    { to: '/patient/dashboard', label: 'Home', icon: Home },
    { to: '/patient/ai-assistant', label: 'AI Chat', icon: Sparkles },
    { to: '/patient/medications', label: 'Meds', icon: Pill },
    { to: '/patient/pharmacies', label: 'Stock', icon: Store },
    { to: '/patient/cases', label: 'Cases', icon: AlertTriangle }
  ]

  return (
    <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/90 shadow-lg py-1.5 px-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
