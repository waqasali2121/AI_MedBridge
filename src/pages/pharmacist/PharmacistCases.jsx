import React, { useState, useEffect } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageSquare,
  Send,
  UserCheck
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { caseService } from '../../services/caseService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Textarea } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'

export function PharmacistCases() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState(null)
  const [recommendation, setRecommendation] = useState('')
  const [adherenceAssessment, setAdherenceAssessment] = useState('')
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

  const handleOpenReview = (c) => {
    setSelectedCase(c)
    setRecommendation(
      `Patient reports persistent elevated readings and mild nausea. Adherence log shows ${c.doses_taken_count} doses taken as scheduled. Recommended to assess whether current GLP-1 RA dose requires continuation vs scheduled escalation following rheumatologist review.`
    )
    setAdherenceAssessment('Patient self-reported regular adherence without missed doses.')
  }

  const handleSubmitRecommendation = async (e) => {
    e.preventDefault()
    if (!selectedCase) return

    setSubmitting(true)
    try {
      await caseService.submitPharmacistRecommendation({
        caseId: selectedCase.id,
        pharmacistId: user?.id,
        recommendation,
        adherenceAssessment
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
          Patient Care Inquiries & Adherence Triage
        </h1>
        <p className="text-xs text-slate-500">
          Review patient-reported concerns, assess adherence barriers, and prepare clinical recommendations for physician review
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading cases...</Card>
      ) : cases.length === 0 ? (
        <Card className="text-center py-10 text-xs text-slate-400">No active patient inquiries</Card>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const isResolved = c.status === 'doctor_resolved'
            const isReviewed = c.status === 'pharmacist_reviewed'

            return (
              <Card key={c.id} className="p-5 border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{c.patient_name}</span>
                    <span className="text-xs text-slate-500 font-mono">Case ID: {c.id}</span>
                    <Badge variant={c.concern_type === 'not_improving' ? 'warning' : 'info'}>
                      {c.concern_type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <Badge variant={isResolved ? 'success' : isReviewed ? 'info' : 'warning'}>
                    {t(`status.${c.status}`, c.status)}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-700">
                  <p><strong>Patient Inquiry:</strong> {c.symptoms_changed}</p>
                  {c.adverse_effects && <p className="text-rose-700"><strong>Adverse Effects:</strong> {c.adverse_effects}</p>}
                  <p className="text-[11px] text-slate-500">
                    Treatment started: {c.treatment_start_date} • Doses taken: {c.doses_taken_count}
                  </p>
                </div>

                {c.pharmacist_recommendation && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-teal-900">Your Pharmacist Recommendation to Doctor:</span>
                    <p className="text-teal-800">{c.pharmacist_recommendation}</p>
                  </div>
                )}

                {isResolved && c.doctor_decision && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-emerald-900">Doctor Decision:</span>
                    <p className="text-emerald-800">{c.doctor_decision} — {c.doctor_explanation}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  {!isReviewed && !isResolved && (
                    <Button size="sm" onClick={() => handleOpenReview(c)} className="bg-teal-700 text-xs">
                      Triage & Add Recommendation
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Review & Recommendation Modal */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title={`Pharmacist Adherence Triage: ${selectedCase.patient_name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSubmitRecommendation} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <p className="font-bold text-slate-800">Reported Concern: {selectedCase.concern_type.replace(/_/g, ' ')}</p>
              <p className="text-slate-600">{selectedCase.symptoms_changed}</p>
            </div>

            <Textarea
              label="Adherence & Access Assessment"
              rows={2}
              value={adherenceAssessment}
              onChange={(e) => setAdherenceAssessment(e.target.value)}
              placeholder="e.g. Regular compliance confirmed from patient log..."
              required
            />

            <Textarea
              label="Clinical Recommendation for Physician Review"
              rows={4}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Document recommendations regarding drug interactions, administration technique, or dosage escalation for the doctor..."
              required
            />

            <div className="p-2.5 bg-teal-50 rounded-lg text-[11px] text-teal-800">
              Note: This recommendation is forwarded directly to Dr. Ali Raza Naqvi for official decision.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedCase(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting} icon={Send} className="bg-teal-700">
                Submit Recommendation to Doctor
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
