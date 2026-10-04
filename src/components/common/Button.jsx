import React from 'react'
import { Loader2 } from 'lucide-react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  }

    const variants = {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:focus:ring-emerald-400',
      secondary: 'bg-slate-800 hover:bg-slate-900 text-white focus:ring-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600',
      outline: 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-emerald-500 shadow-none',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600',
      warning: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-none focus:ring-slate-300'
    }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  )
}
