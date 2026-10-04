import React from 'react'
import { AlertCircle } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export function MedicalDisclaimer({ className = '' }) {
  const { t, language } = useLanguage()

  return (
    <aside aria-label="Medical Disclaimer" className={`p-3 bg-slate-100/90 border border-slate-200/90 rounded-lg text-xs text-slate-600 flex items-start gap-2.5 ${className}`}>
      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <span className="font-semibold text-slate-700">
          {language === 'ur' ? 'اہم طبی وضاحت:' : 'Medical Safety & Scope Disclaimer:'}
        </span>{' '}
        {t('brand.disclaimer')}
      </div>
    </aside>
  )
}
