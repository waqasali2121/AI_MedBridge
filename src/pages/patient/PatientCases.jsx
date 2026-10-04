import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  Stethoscope,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { caseService } from '../../services/caseService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function PatientCases() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const list = await caseService.getPatientCases(user?.id)
        setCases(list)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.cases')}
          </h1>
          <p className="text-xs text-slate-500">
            Collaborative inquiries reviewed by your Care Pharmacist and Physician
          </p>
        </div>
        <Link to="/patient/cases/new">
          <Button size="sm" icon={Plus}>
            {t('patient_actions.report_concern')}
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading cases...</Card>
      ) : cases.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Active Care Inquiries</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            If you ever experience side effects, lack of symptom improvement, or missing pharmacy stock, report it here.
          </p>
          <Link to="/patient/cases/new">
            <Button size="sm" icon={Plus}>
              Report a Concern
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const isResolved = c.status === 'doctor_resolved'
            const isPharmacistReviewed = c.status === 'pharmacist_reviewed'

            return (
              <Card key={c.id} className="p-6 border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-900 capitalize">
                        {c.concern_type.replace(/_/g, ' ')}
                      </span>
                      {c.urgency === 'urgent' && <Badge variant="danger">Urgent Case</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Opened on {new Date(c.created_at).toLocaleString()} • ID: {c.id}
                    </p>
                  </div>
                  <Badge variant={isResolved ? 'success' : isPharmacistReviewed ? 'info' : 'warning'}>
                    {t(`status.${c.status}`, c.status)}
                  </Badge>
                </div>

                {/* Patient's Reported Details */}
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <p><strong>Reported Symptoms / Inquiry:</strong> {c.symptoms_changed}</p>
                  {c.adverse_effects && (
                    <p className="text-rose-700"><strong>Adverse Reactions:</strong> {c.adverse_effects}</p>
                  )}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Started: {c.treatment_start_date || 'N/A'}</span>
                    <span>Doses Taken: {c.doses_taken_count}</span>
                    {c.voice_note_present && <span className="text-emerald-600 font-medium">🎤 Voice note attached</span>}
                  </div>
                </div>

                {/* Assistive AI Summary for Care Team */}
                {c.ai_summary && (
                  <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-700">Assistive Case Summary:</span>
                    <p>{c.ai_summary}</p>
                  </div>
                )}

                {/* Unified Approved Clinical Decision */}
                {isResolved ? (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Approved Clinical Outcome (Dr. Ali Raza Naqvi):</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-900">{c.doctor_decision}</p>
                    {c.doctor_explanation && (
                      <p className="text-xs text-emerald-800 leading-relaxed">{c.doctor_explanation}</p>
                    )}
                    <span className="text-[10px] text-emerald-600 block pt-1">
                      Published {new Date(c.doctor_resolved_at).toLocaleString()} • Attributable Care Record
                    </span>
                  </div>
                ) : isPharmacistReviewed ? (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Care Pharmacist has triaged your report and submitted recommendations. Awaiting physician's clinical sign-off.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Case is pending Care Pharmacist triage and physician assessment.</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
