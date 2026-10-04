import React from 'react'
import { Languages } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export function LanguageToggle({ className = '' }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={`inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold ${className}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-emerald-700 shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('ur')}
        className={`px-2.5 py-1 rounded-md transition-all font-urdu ${
          language === 'ur'
            ? 'bg-white text-emerald-700 shadow-xs font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        اردو
      </button>
    </div>
  )
}
