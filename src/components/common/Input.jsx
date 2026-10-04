import React from 'react'

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 6)}`

  return (
    <div className="w-full space-y-1.5 text-left rtl:text-right">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1f2937] text-slate-900 dark:text-slate-100 border rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
          error ? 'border-rose-300 dark:border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  )
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 3,
  ...props
}) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 6)}`

  return (
    <div className="w-full space-y-1.5 text-left rtl:text-right">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1f2937] text-slate-900 dark:text-slate-100 border rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
          error ? 'border-rose-300 dark:border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  )
}
