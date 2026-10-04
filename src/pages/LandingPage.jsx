import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Lock,
  Pill,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Store,
  Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'

export function LandingPage() {
  const { user, role, switchRole, getRoleDashboardRoute } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const handleDemoLaunch = async (targetRole) => {
    await switchRole(targetRole)
    navigate(getRoleDashboardRoute(targetRole))
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Bilingual Healthcare Innovation • اردو اور انگریزی</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          One Verified Medication Plan.{' '}
          <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy">
            One Connected Journey.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
          MedBridge connects patients, physicians, and care pharmacists into a unified, verified loop — turning illegible or complex prescriptions into understandable bilingual instructions, verified community pharmacy stock, and coordinated follow-up.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {user ? (
            <Link to={getRoleDashboardRoute(role)}>
              <Button size="lg" icon={ArrowRight}>
                Enter {role?.replace('_', ' ').toUpperCase()} Portal
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg" icon={ArrowRight}>
                  Sign In to MedBridge
                </Button>
              </Link>
              <Link to="/patient/prescriptions/new">
                <Button size="lg" variant="outline" icon={Pill}>
                  Try Prescription Upload
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Interactive 1-Click Role Portals */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            Explore MedBridge Portals (1-Click Demo)
          </h2>
          <p className="text-xs text-slate-500">
            Switch between the 5 roles instantly with preloaded synthetic clinical data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <Card
            hover
            onClick={() => handleDemoLaunch('patient')}
            className="cursor-pointer border-emerald-200/80 hover:border-emerald-500 bg-gradient-to-b from-white to-emerald-50/20 text-center space-y-2 p-4"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Patient Portal</h3>
            <p className="text-xs text-slate-500">
              Upload prescription, view approved Urdu instructions, record doses, find stock.
            </p>
            <span className="text-xs font-semibold text-emerald-600 block pt-1">
              Launch as Shahid →
            </span>
          </Card>

          <Card
            hover
            onClick={() => handleDemoLaunch('doctor')}
            className="cursor-pointer border-blue-200/80 hover:border-blue-500 bg-gradient-to-b from-white to-blue-50/20 text-center space-y-2 p-4"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Physician Gate</h3>
            <p className="text-xs text-slate-500">
              Review pharmacist notes, resolve unclear orders, approve official clinical plans.
            </p>
            <span className="text-xs font-semibold text-blue-600 block pt-1">
              Launch as Dr. Ali →
            </span>
          </Card>

          <Card
            hover
            onClick={() => handleDemoLaunch('pharmacist')}
            className="cursor-pointer border-teal-200/80 hover:border-teal-500 bg-gradient-to-b from-white to-teal-50/20 text-center space-y-2 p-4"
          >
            <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mx-auto">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Care Pharmacist</h3>
            <p className="text-xs text-slate-500">
              Verify transcription details, add counselling, triage patient adherence inquiries.
            </p>
            <span className="text-xs font-semibold text-teal-600 block pt-1">
              Launch as Zainab →
            </span>
          </Card>

          <Card
            hover
            onClick={() => handleDemoLaunch('pharmacy_operator')}
            className="cursor-pointer border-amber-200/80 hover:border-amber-500 bg-gradient-to-b from-white to-amber-50/20 text-center space-y-2 p-4"
          >
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Pharmacy Operator</h3>
            <p className="text-xs text-slate-500">
              Report verified physical inventory, confirm or reject patient reservations.
            </p>
            <span className="text-xs font-semibold text-amber-600 block pt-1">
              Launch as Usman →
            </span>
          </Card>

          <Card
            hover
            onClick={() => handleDemoLaunch('admin')}
            className="cursor-pointer border-purple-200/80 hover:border-purple-500 bg-gradient-to-b from-white to-purple-50/20 text-center space-y-2 p-4"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Admin & Audits</h3>
            <p className="text-xs text-slate-500">
              Inspect immutable audit trail, catalogue, pharmacies, and system metrics.
            </p>
            <span className="text-xs font-semibold text-purple-600 block pt-1">
              Launch as Admin →
            </span>
          </Card>
        </div>
      </section>

      {/* The 8-Step Collaborative Care Loop */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            System Design & Workflow
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            The MedBridge Closed-Loop Medication Care Engine
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            Reminders alone don't solve medication non-adherence. MedBridge coordinates patient, doctor, and pharmacist around verified clinical facts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-slate-900">Prescription Upload & Draft</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patient uploads prescription image or PDF. Assistive AI parses structured draft without guessing missing information.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-slate-900">Care Pharmacist Check</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pharmacist verifies drug names, dosage forms, and interactions, adding bilingual counselling notes before escalation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-slate-900">Doctor Clinical Gate</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctor resolves flagged ambiguities and officially approves plan. <strong>Only doctor approval activates reminders.</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="font-bold text-sm text-slate-900">Pharmacy Reservation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patient views reported availability with freshness timestamps and places a reservation request before travelling.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
