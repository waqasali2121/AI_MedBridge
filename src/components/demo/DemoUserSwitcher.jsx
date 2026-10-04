import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Sparkles, UserCheck, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { resetDemoState } from '../../services/mockData'
import { useLanguage } from '../../contexts/LanguageContext'

export function DemoUserSwitcher() {
  const { user, role, switchRole, getRoleDashboardRoute } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [resetting, setResetting] = useState(false)

  const roles = [
    { key: 'patient', label: 'Patient (Shahid)', icon: '👤', badge: 'bg-emerald-500' },
    { key: 'doctor', label: 'Doctor (Dr. Ali)', icon: '🩺', badge: 'bg-blue-600' },
    { key: 'pharmacist', label: 'Pharmacist (Zainab)', icon: '💊', badge: 'bg-teal-600' },
    { key: 'pharmacy_operator', label: 'Pharmacy (DHA)', icon: '🏪', badge: 'bg-amber-600' },
    { key: 'admin', label: 'Admin', icon: '⚙️', badge: 'bg-purple-600' }
  ]

  const handleSwitch = async (targetRole) => {
    await switchRole(targetRole)
    const route = getRoleDashboardRoute(targetRole)
    navigate(route)
  }

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to initial synthetic prescription sample?')) {
      setResetting(true)
      resetDemoState()
      setTimeout(() => {
        window.location.reload()
      }, 300)
    }
  }

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 shadow-md sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full text-[11px] tracking-wide">
            <Sparkles className="w-3 h-3" />
            HACKATHON DEMO MODE
          </span>
          <span className="hidden sm:inline text-slate-400">Current Role:</span>
          <span className="font-semibold text-emerald-400 capitalize">
            {role ? role.replace('_', ' ') : 'Guest'}
          </span>
          {user && (
            <span className="hidden md:inline text-slate-400 truncate max-w-[160px]">
              ({user.full_name})
            </span>
          )}
        </div>

        {/* Role buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {roles.map(r => (
            <button
              key={r.key}
              onClick={() => handleSwitch(r.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                role === r.key
                  ? 'bg-emerald-600 text-white shadow-xs font-bold ring-1 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}

          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset demo data to initial state"
            className="px-2 py-1 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded-md text-[11px] transition-all flex items-center gap-1 shrink-0 ml-1 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <CheckSquare className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">16-Step Flow</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expanded 16-Step Demonstration Guide */}
      {expanded && (
        <div className="bg-slate-950 border-t border-slate-800 p-4 text-slate-300 text-xs animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-100">
              <span>MedBridge 16-Step Demo Verification Script:</span>
              <span className="text-[11px] text-slate-400">Synthetic clinical scenario based on Dr. Ali Raza Naqvi prescription</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400">Steps 1–4: Patient Upload & Draft</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Patient uploads PDF. Assistive AI extracts structured draft; flags ⚠ Needs Clarification on Tirzee 12.5mg escalation.
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-teal-400">Steps 5–6: Care Team Gate</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pharmacist checks transcription & adds note. Doctor resolves clarification issue and confirms approved treatment plan.
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-400">Steps 7–12: Adherence & Stock</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Patient sees approved Urdu/Eng schedule & records "Taken". Searches stock (Gulberg out of stock, DHA available) & reserves.
                </p>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-purple-400">Steps 13–16: Shared Case Loop</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Patient reports "Medicine not helping". Pharmacist assesses adherence; Doctor publishes final clinical decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
