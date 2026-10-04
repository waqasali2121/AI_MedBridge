import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileText,
  Send,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { prescriptionService } from '../../services/prescriptionService'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { Textarea } from '../../components/common/Input'

export function PharmacistReview() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [counsellingNotes, setCounsellingNotes] = useState(
    'Verified active ingredients and strengths against DRAP catalogue. Noted clinical comment regarding heel pain: Tirzepatide dose escalation to 12.5 mg should remain flagged for Dr. Ali Raza Naqvi\'s explicit approval following rheumatology consultation. Patient instructed on subcutaneous injection site rotation.'
  )
  const [confirmedMedicines, setConfirmedMedicines] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const rx = await prescriptionService.getPrescriptionById(id)
        setPrescription(rx)
        if (rx?.medicines) {
          setConfirmedMedicines(rx.medicines.map(m => m.id))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const toggleMedicineConfirmed = (medId) => {
    setConfirmedMedicines(prev => 
      prev.includes(medId) ? prev.filter(x => x !== medId) : [...prev, medId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await prescriptionService.submitPharmacistReview({
        prescriptionId: id,
        pharmacistId: user?.id,
        pharmacistNotes: counsellingNotes,
        verificationStatus: 'pending_doctor' // Escalates to doctor gate!
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/pharmacist/prescriptions')
      }, 1500)
    } catch (err) {
      console.error('Pharmacist review error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Card className="p-8 text-center text-xs text-slate-400">Loading prescription verification...</Card>
  if (!prescription) return <Card className="p-8 text-center text-xs text-slate-400">Prescription not found</Card>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/pharmacist/prescriptions">
            <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pharmacist Clinical Verification
            </h1>
            <p className="text-xs text-slate-500">
              Patient: {prescription.patient_name} (MRN: {prescription.mrn || '00000690'}) • Prescribed by {prescription.doctor_name}
            </p>
          </div>
        </div>

        <Badge variant={prescription.verification_status === 'approved' ? 'approved' : 'clarification'}>
          {t(`status.${prescription.verification_status}`, prescription.verification_status)}
        </Badge>
      </div>

      {/* Professional Scope Safety Rule */}
      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Professional Scope Boundary:</strong> The Care Pharmacist verifies transcription fidelity, reviews drug interactions, and formulates patient counselling instructions. Pharmacists do not directly alter or prescribe medications; your verification and notes are submitted to Dr. Ali Raza Naqvi for final clinical approval.
        </div>
      </div>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Original Prescription Scan */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-400" />
                Original Document (Prime Health HUB Dew)
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Reference
              </span>
            </div>

            <div className="bg-white text-slate-900 rounded-lg p-4 font-sans text-xs space-y-3 shadow-inner max-h-[500px] overflow-y-auto">
              <div className="border-b pb-2 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Dr. Ali Raza Naqvi</h4>
                  <p className="text-[10px] text-slate-500">Consultant Diabetologist & Endocrinologist</p>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <p>10/2/2026 3:11 PM</p>
                  <p>MRN: 00000690</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded text-[11px] space-y-0.5">
                <p><strong>Patient:</strong> {prescription.patient_name}</p>
                <p><strong>Active:</strong> Prediabetes (R7303), Obesity (E669)</p>
                <p><strong>Vitals:</strong> Wt: 84kg, BP: 110/91, HbA1c: 5.5%</p>
              </div>

              <div className="border-t pt-2 space-y-1 text-[11px]">
                <p className="font-bold text-slate-800">Physician Directives:</p>
                <p className="text-slate-600">• Referred to Rheumatologist for heel pain</p>
                <p className="text-rose-700 font-semibold">• Note: Continue Tirzee 10 mg for now; increase to 12.5 mg after rheumatologist appointment.</p>
              </div>

              <div className="border-t pt-2 space-y-1 font-mono text-[10px]">
                <p>1. TIRZEE 12.5 MG/0.5ML PEN 1'S - 1 Inj weekly (4 wks)</p>
                <p>2. Zanov 20 mg - 1 Cap before breakfast</p>
                <p>3. METHIX TAB 20'S - 1 Tab after breakfast</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Pharmacist Verification Form */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-5 border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Item Verification & Counselling Formulation
              </h2>
              <p className="text-xs text-slate-500">
                Confirm transcription accuracy and formulate clinical recommendations for physician review
              </p>
            </div>

            {/* Extracted medicines checklist */}
            <div className="space-y-3">
              {prescription.medicines?.map((med) => {
                const isConfirmed = confirmedMedicines.includes(med.id)
                return (
                  <div
                    key={med.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      med.clarification_required
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">{med.medicine_name}</span>
                          <span className="text-[11px] text-slate-500">({med.dose}, {med.frequency})</span>
                        </div>

                        {med.clarification_required && (
                          <div className="text-[11px] font-semibold text-amber-900 bg-amber-100/80 p-2 rounded border border-amber-200">
                            ⚠ Flagged: {med.clarification_reason}
                          </div>
                        )}

                        {med.urdu_instruction && (
                          <p className="text-xs font-urdu text-emerald-950 pt-1">
                            <strong>ہدایات:</strong> {med.urdu_instruction}
                          </p>
                        )}
                      </div>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isConfirmed}
                          onChange={() => toggleMedicineConfirmed(med.id)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Verified</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pharmacist Counselling & Verification Notes */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
              <Textarea
                label="Pharmacist Clinical Notes & Recommendation for Doctor"
                rows={4}
                value={counsellingNotes}
                onChange={(e) => setCounsellingNotes(e.target.value)}
                helperText="Document your assessment on drug interactions, formulation correctness, and dosage escalation for Dr. Ali Raza Naqvi."
                required
              />

              {success ? (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Review recorded! Forwarded to Dr. Ali Raza Naqvi for final approval.</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Link to="/pharmacist/prescriptions">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" loading={submitting} icon={Send} className="bg-teal-700 hover:bg-teal-800">
                    Submit Pharmacist Review & Forward to Doctor
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
