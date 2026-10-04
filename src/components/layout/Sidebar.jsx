import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  HeartHandshake,
  History,
  Home,
  MapPin,
  Pill,
  PlusCircle,
  ShieldCheck,
  Stethoscope,
  Store,
  UserCheck,
  Users,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'

export function Sidebar({ className = '' }) {
  const { role } = useAuth()
  const { t } = useLanguage()

  const navItems = {
    patient: [
      { to: '/patient/dashboard', label: t('nav.dashboard'), icon: Home },
      { to: '/patient/prescriptions', label: t('nav.prescriptions'), icon: FileText },
      { to: '/patient/prescriptions/new', label: t('nav.upload_prescription'), icon: PlusCircle, badge: 'New' },
      { to: '/patient/ai-assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
      { to: '/patient/medications', label: t('nav.medications'), icon: Pill },
      { to: '/patient/reminders', label: t('nav.reminders'), icon: CalendarClock },
      { to: '/patient/pharmacies', label: t('nav.pharmacies'), icon: Store },
      { to: '/patient/reservations', label: t('nav.reservations'), icon: ClipboardCheck },
      { to: '/patient/cases', label: t('nav.cases'), icon: AlertTriangle },
    ],
    doctor: [
      { to: '/doctor/dashboard', label: t('nav.dashboard'), icon: Home },
      { to: '/doctor/patients', label: t('nav.patients'), icon: Users },
      { to: '/doctor/prescriptions', label: t('nav.prescriptions'), icon: FileText, badge: 'Gate' },
      { to: '/doctor/cases', label: t('nav.cases'), icon: AlertTriangle },
      { to: '/doctor/medication-plans', label: t('nav.treatment_plans'), icon: ClipboardCheck },
    ],
    pharmacist: [
      { to: '/pharmacist/dashboard', label: t('nav.dashboard'), icon: Home },
      { to: '/pharmacist/prescriptions', label: t('nav.prescriptions'), icon: FileCheck, badge: 'Verify' },
      { to: '/pharmacist/cases', label: t('nav.cases'), icon: AlertTriangle },
      { to: '/pharmacist/counselling', label: t('nav.counselling'), icon: HeartHandshake },
    ],
    pharmacy_operator: [
      { to: '/pharmacy/dashboard', label: t('nav.dashboard'), icon: Home },
      { to: '/pharmacy/inventory', label: t('nav.inventory'), icon: Pill },
      { to: '/pharmacy/reservations', label: t('nav.reservations'), icon: ClipboardCheck, badge: 'Hold' },
    ],
    admin: [
      { to: '/admin', label: t('nav.dashboard'), icon: Home },
      { to: '/admin/users', label: t('nav.users'), icon: Users },
      { to: '/admin/medicines', label: t('nav.medicines'), icon: Pill },
      { to: '/admin/pharmacies', label: 'Pharmacies', icon: Building2 },
      { to: '/admin/audit-logs', label: t('nav.audit_logs'), icon: History },
    ]
  }

  // Fallback for icons
  function FileCheck(props) {
    return <ClipboardCheck {...props} />
  }

  const items = navItems[role] || navItems.patient

  return (
    <aside className={`w-64 bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-slate-800 shrink-0 flex flex-col py-4 px-3 select-none transition-colors ${className}`}>
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {role ? role.replace('_', ' ') : 'Portal'} Navigation
        </div>

        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('/dashboard') || item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 font-bold border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600 dark:border-emerald-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}
