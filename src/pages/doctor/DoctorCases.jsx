import React, { useState, useEffect } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Send,
  Stethoscope,
  User
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { caseService } from '../../services/caseService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Textarea, Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'

export function DoctorCases() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState(null)
  const [decision, setDecision] = useState('')
  const [explanation, setExplanation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadCases = async () => {
    try {
      const all = await caseService.getAllCases()
      setCases(all)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  const handleOpenDecision = (c) => {
    setSelectedCase(c)
    setDecision('Maintain Tirzee 10 mg for 2 additional weeks; add mild anti-emetic counsel')
    setExplanation(
      'Reviewed pharmacist triage assessment. Minor nausea is expected during GLP-1 RA titration. Patient should continue current 10 mg dose for two additional weeks with meal adjustments. If heel pain improves after rheumatologist consult, proceed with 12.5 mg escalation.'
    )
  }

  const handleSubmitDecision = async (e) => {
    e.preventDefault()
    if (!selectedCase) return

    setSubmitting(true)
    try {
      await caseService.submitDoctorDecision({
        caseId: selectedCase.id,
        doctorId: user?.id,
        decision,
        explanation
      })
      await loadCases()
      setSelectedCase(null)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Clinical Inquiries & Pharmacist Recommendations
        </h1>
        <p className="text-xs text-slate-500">
          Review patient-reported concerns triaged by Care Pharmacists and publish official, attributable clinical decisions
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading cases...</Card>
      ) : cases.length === 0 ? (
        <Card className="text-center py-10 text-xs text-slate-400">No active cases</Card>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const isResolved = c.status === 'doctor_resolved'
            const isPharmacistReviewed = c.status === 'pharmacist_reviewed'

            return (
              <Card key={c.id} className="p-5 border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{c.patient_name}</span>
                    <span className="text-xs text-slate-500 font-mono">Case ID: {c.id}</span>
                    <Badge variant={c.urgency === 'urgent' ? 'danger' : 'warning'}>
                      {c.concern_type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <Badge variant={isResolved ? 'success' : isPharmacistReviewed ? 'info' : 'warning'}>
                    {t(`status.${c.status}`, c.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Patient Report */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                    <p className="font-bold text-slate-800">Patient Inquiry & Symptoms:</p>
                    <p className="text-slate-700">{c.symptoms_changed}</p>
                    {c.adverse_effects && <p className="text-rose-700 font-medium">Reactions: {c.adverse_effects}</p>}
                    <p className="text-[11px] text-slate-400 pt-1">
                      Started: {c.treatment_start_date} • Doses taken: {c.doses_taken_count}
                    </p>
                  </div>

                  {/* Pharmacist Recommendation */}
                  <div className="p-3 bg-teal-50 rounded-xl space-y-1 border border-teal-200">
                    <p className="font-bold text-teal-900 flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
                      Care Pharmacist Recommendation:
                    </p>
                    <p className="text-teal-800">
                      {c.pharmacist_recommendation || 'Awaiting pharmacist triage assessment.'}
                    </p>
                    {c.pharmacist_adherence_assessment && (
                      <p className="text-[11px] text-teal-700 pt-1 italic">
                        Adherence: {c.pharmacist_adherence_assessment}
                      </p>
                    )}
                  </div>
                </div>

                {isResolved && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Published Physician Decision (Dr. Ali Raza Naqvi):
                    </p>
                    <p className="font-semibold text-emerald-900">{c.doctor_decision}</p>
                    <p className="text-emerald-800">{c.doctor_explanation}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  {!isResolved && (
                    <Button size="sm" onClick={() => handleOpenDecision(c)} className="bg-blue-600 hover:bg-blue-700 text-xs">
                      Publish Clinical Decision
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Physician Decision Modal */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title={`Clinical Decision for ${selectedCase.patient_name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitDecision} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <p className="font-bold text-slate-800">Inquiry: {selectedCase.symptoms_changed}</p>
              <p className="text-teal-800 font-medium">Pharmacist Note: {selectedCase.pharmacist_recommendation}</p>
            </div>

            <Input
              label="Official Clinical Decision"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g. Continue current dose, order lab tests, adjust administration..."
              required
            />

            <Textarea
              label="Detailed Clinical Explanation (Sent to Patient & Care Team)"
              rows={4}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain the medical rationale for the patient and pharmacist..."
              required
            />

            <div className="p-2.5 bg-blue-50 rounded-lg text-[11px] text-blue-900">
              Note: This decision constitutes the single, approved patient-facing clinical outcome.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedCase(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} icon={Send} className="bg-blue-600 hover:bg-blue-700">
                Publish Decision to Patient
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
