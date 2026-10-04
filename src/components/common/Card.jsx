import React from 'react'

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 ${
        hover ? 'hover:shadow-md dark:hover:shadow-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
