import React from 'react'

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    clarification: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold animate-pulse',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium'
  }

  const selected = variants[variant] || variants.default

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border font-medium transition-colors ${selected} ${className}`}>
      {children}
    </span>
  )
}
