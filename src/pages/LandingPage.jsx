import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  PlayCircle,
  FileText,
  UserCheck,
  Stethoscope,
  Store,
  CheckCircle,
  BellRing,
  AlertOctagon,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export function LandingPage() {
  const { user, role, switchRole, getRoleDashboardRoute } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const handleDemoLaunch = async () => {
    // Launch as Patient to start the journey
    await switchRole('patient')
    navigate('/patient/prescriptions/new')
  }

  return (
    <div className="space-y-16 max-w-6xl mx-auto py-6 px-4">
      
      {/* 1. HERO - Problem + Solution */}
      <section className="text-center space-y-6 pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SYNTHETIC DEMO DATA • NOT FOR REAL CLINICAL USE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          MedBridge connects the entire medication journey.
        </h1>

        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
          From prescription to safe medication use and follow-up. 
          Upload a prescription. MedBridge extracts the medication information, a care pharmacist verifies it and provides counselling, clinical ambiguities are escalated to the physician when necessary, patients receive approved medication instructions and reminders, pharmacies help locate and reserve medicines, and the care team can follow up on adherence and medication concerns.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button size="lg" icon={PlayCircle} onClick={handleDemoLaunch} className="shadow-lg shadow-emerald-500/20">
            Run Demo Journey (3 Mins)
          </Button>
          {!user && (
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-white">
                Platform Login
              </Button>
            </Link>
          )}
          {user && (
            <Link to={getRoleDashboardRoute(role)}>
              <Button size="lg" variant="outline" icon={ArrowRight} className="bg-white">
                Enter {role?.replace('_', ' ').toUpperCase()} Portal
              </Button>
            </Link>
          )}
        </div>
        
        <p className="text-xs text-slate-400 font-medium pt-2">
          Experience the medication journey as a patient, pharmacist, and physician.
        </p>
      </section>

      {/* 2. THE MEDICATION JOURNEY */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">The Complete Journey</h2>
          <p className="text-slate-500 max-w-xl mx-auto">One seamless path ensuring nothing is missed between writing a prescription and completing a course of treatment.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[45%] left-8 right-8 h-1 bg-slate-100 -z-10 rounded-full" />
          
          {[
            { label: 'PRESCRIBED', icon: FileText, color: 'emerald' },
            { label: 'VERIFIED', icon: UserCheck, color: 'teal' },
            { label: 'UNDERSTOOD', icon: Sparkles, color: 'blue' },
            { label: 'FOUND', icon: Store, color: 'amber' },
            { label: 'TAKEN', icon: CheckCircle, color: 'green' },
            { label: 'FOLLOWED UP', icon: Stethoscope, color: 'purple' },
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3">
              <div className={`w-14 h-14 bg-${step.color}-50 border-2 border-${step.color}-200 text-${step.color}-600 rounded-full flex items-center justify-center relative overflow-hidden group hover:scale-110 transition-transform bg-white`}>
                <step.icon className="w-6 h-6 relative z-10" />
                <div className={`absolute inset-0 bg-${step.color}-100 opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <span className="text-xs font-bold text-slate-700 tracking-wider tooltip">{step.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ROLES EXPERIENCE (HOW IT WORKS) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <Card className="p-6 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><UserCheck className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-slate-900">Care Pharmacist Workflow</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Acts as the primary care coordinator. Verifies uncertain AI extractions, translates technical directions into simple bilingual instructions, provides counselling, and manages routine patient inquiries.
          </p>
        </Card>

        <Card className="p-6 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg"><AlertOctagon className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-slate-900">Physician Escalation</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Physicians only review cases that require prescriber-level clinical authority. Unreadable doses, potential interactions or therapy changes enter a focused 'Review → Resolve → Approve' queue.
          </p>
        </Card>

        <Card className="p-6 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><BellRing className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-slate-900">Patient Experience</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            An action-oriented dashboard showing EXACTLY what to take today, when to take it, and what actions are pending. Empowers patients to record adherence securely.
          </p>
        </Card>

        <Card className="p-6 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Store className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-slate-900">Pharmacy Reservation</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Patients search verified reported stock and request reservations. Pharmacy operators physically confirm availability, ensuring patients never make a wasted trip.
          </p>
        </Card>
      </section>

      {/* 4. AI SAFETY LIMITS */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl max-w-5xl mx-auto overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-48 h-48" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-5">
          <span className="text-xs font-extrabold text-emerald-400 tracking-widest uppercase">Clinical Safety Policy</span>
          <h2 className="text-2xl sm:text-3xl font-bold">Strict AI Boundaries</h2>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            MedBridge uses assistive AI, not autonomous doctors. Our AI strictly CANNOT: diagnose diseases, recommend new medicines, change dosages, or invent medication information. 
            When AI confidence is low, the workflow <strong>automatically halts</strong> for Care Pharmacist review.
          </p>
          <ul className="text-slate-400 text-sm space-y-2 pt-2">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Never silently guesses unreadable text</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Answers patient questions using only approved facts</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Immutable AI and human audit trail</li>
          </ul>
        </div>
      </section>

      {/* 5. METRICS / IMPACT */}
      <section className="max-w-4xl mx-auto text-center space-y-6 pt-4">
        <h3 className="text-xl font-bold text-slate-900">Projected System Impact Targets</h3>
        <p className="text-xs text-slate-500 pb-2">These are target metrics for the pilot program, not yet validated clinical outcomes.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-3xl font-black text-emerald-600">85%</div>
            <div className="text-xs font-semibold text-slate-700">Fewer Wasted Trips</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-emerald-600">&lt;2h</div>
            <div className="text-xs font-semibold text-slate-700">Prescription Verification</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-emerald-600">3x</div>
            <div className="text-xs font-semibold text-slate-700">Adherence Reporting</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-emerald-600">100%</div>
            <div className="text-xs font-semibold text-slate-700">Auditable Changes</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="flex justify-center pt-8 pb-12">
        <Button size="lg" icon={PlayCircle} onClick={handleDemoLaunch} className="shadow-lg shadow-emerald-500/20 px-8 py-4 text-lg">
          Experience the Medication Journey
        </Button>
      </div>

    </div>
  )
}
