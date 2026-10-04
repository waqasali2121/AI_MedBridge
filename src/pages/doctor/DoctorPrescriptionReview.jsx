import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileText,
  History,
  Send,
  ShieldCheck,
  Stethoscope,
  XCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { prescriptionService } from '../../services/prescriptionService'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { Textarea } from '../../components/common/Input'

export function DoctorPrescriptionReview() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [doctorNotes, setDoctorNotes] = useState(
    'Clarification Resolved: Patient to complete 4 weeks of Tirzee 10 mg as previously tolerated. Escalation to 12.5 mg confirmed to commence strictly after Dr. Shakaib Qureshi\'s rheumatology heel pain evaluation. Zanov 20mg and Methix Tab approved as written.'
  )
  const [submitting, setSubmitting] = useState(false)
  const [approvalResult, setApprovalResult] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const rx = await prescriptionService.getPrescriptionById(id)
        setPrescription(rx)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleApprove = async () => {
    setSubmitting(true)
    try {
      const res = await prescriptionService.submitDoctorApproval({
        prescriptionId: id,
        doctorId: user?.id,
        doctorNotes,
        action: 'approve'
      })
      setApprovalResult(res)
      setTimeout(() => {
        navigate('/doctor/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Doctor approval error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async () => {
    setSubmitting(true)
    try {
      await prescriptionService.submitDoctorApproval({
        prescriptionId: id,
        doctorId: user?.id,
        doctorNotes: `Returned for clarification: ${doctorNotes}`,
        action: 'reject_clarification'
      })
      navigate('/doctor/prescriptions')
    } catch (err) {
      console.error('Doctor return error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Card className="p-8 text-center text-xs text-slate-400">Loading prescription verification...</Card>
  if (!prescription) return <Card className="p-8 text-center text-xs text-slate-400">Prescription not found</Card>

  const isApproved = prescription.verification_status === 'approved'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/doctor/prescriptions">
            <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Physician Clinical Review & Plan Approval
            </h1>
            <p className="text-xs text-slate-500">
              Patient: {prescription.patient_name} • MRN: {prescription.mrn || '00000690'} • Prime Health HUB Dew
            </p>
          </div>
        </div>

        <Badge variant={isApproved ? 'approved' : 'clarification'}>
          {t(`status.${prescription.verification_status}`, prescription.verification_status)}
        </Badge>
      </div>

      {/* Safety Gate Rule */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Mandatory Physician Clinical Gate:</strong> In accordance with clinical governance rules, patient reminders, schedule timetables, and adherence logging remain locked until approved by the physician. Approving this plan activates the patient's schedule and supersedes older versions.
        </div>
      </div>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Original Scan & Clinical History */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                Original Consultation Note Scan
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Reference
              </span>
            </div>

            <div className="bg-white text-slate-900 rounded-lg p-4 font-sans text-xs space-y-3 shadow-inner max-h-[520px] overflow-y-auto">
              <div className="border-b pb-2 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Dr. Ali Raza Naqvi</h4>
                  <p className="text-[10px] text-slate-500">Consultant Diabetologist & Endocrinologist</p>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <p>10/2/2026</p>
                  <p>MRN: 00000690</p>
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded text-[11px] space-y-1">
                <p><strong>Diagnoses:</strong> Prediabetes (R7303), Obesity (E669)</p>
                <p><strong>Vitals:</strong> Wt: 84.0 kg, BP: 110/91 mmHg, BG: 127 mg/dl, HbA1c: 5.5%</p>
              </div>

              <div className="border-t pt-2 space-y-1 text-[11px]">
                <p className="font-bold text-slate-800">Directives & Referrals:</p>
                <p className="text-slate-600">• Referred to Dr. Shakaib Qureshi (Rheumatologist) for heel pain.</p>
                <p className="text-rose-700 font-semibold">• Note: Continue Tirzee 10 mg for now; increase the dose to 12.5 mg after rheumatologist appointment.</p>
              </div>

              <div className="border-t pt-2 space-y-1 font-mono text-[10px]">
                <p>1. TIRZEE 12.5 MG/0.5ML PEN - 1 Inj weekly (4 wks)</p>
                <p>2. Zanov 20 mg - 1 Cap before breakfast</p>
                <p>3. METHIX TAB 20'S - 1 Tab after breakfast</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Physician Verification & Approval Actions */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-5 border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Prescription Items & Care Pharmacist Input
              </h2>
              <p className="text-xs text-slate-500">
                Verify pharmacist notes, resolve ambiguity, and publish official clinical plan
              </p>
            </div>

            {/* Pharmacist input review box */}
            {prescription.pharmacist_notes && (
              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Care Pharmacist Transcription Assessment (Zainab Fatima, PharmD):</span>
                </div>
                <p className="text-teal-800 leading-relaxed">{prescription.pharmacist_notes}</p>
              </div>
            )}

            {/* Extracted medicines list */}
            <div className="space-y-3">
              {prescription.medicines?.map((med, i) => (
                <div key={med.id || i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{med.medicine_name}</span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {med.dose} • {med.frequency}
                    </span>
                  </div>

                  {med.clarification_required && !isApproved && (
                    <div className="p-2 bg-amber-100/90 rounded border border-amber-300 text-[11px] text-amber-950 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{med.clarification_reason}</span>
                    </div>
                  )}

                  {med.urdu_instruction && (
                    <p className="text-xs font-urdu text-emerald-950 pt-0.5">
                      <strong>اردو:</strong> {med.urdu_instruction}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Doctor Clinical Notes / Resolution Textarea */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <Textarea
                label="Physician Clinical Resolution & Approval Notes"
                rows={4}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                helperText="Document your clinical resolution of the escalation timing and confirmed patient directions."
                required
              />

              {approvalResult ? (
                <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Medication Plan Officially Approved & Activated!</span>
                  </div>
                  <p>
                    Plan v{approvalResult.plan.version} has been generated. Patient reminders and daily dose tracking are now active. Old reminders have been archived.
                  </p>
                </div>
              ) : isApproved ? (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
                  This prescription plan was approved on {new Date(prescription.doctor_approved_at).toLocaleString()} by Dr. Ali Raza Naqvi.
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    loading={submitting}
                    onClick={handleReturn}
                    icon={XCircle}
                    className="text-amber-800 border-amber-300 hover:bg-amber-50"
                  >
                    Return for Clarification
                  </Button>
                  <Button
                    type="button"
                    loading={submitting}
                    onClick={handleApprove}
                    icon={CheckCircle2}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                  >
                    ✓ Authorize & Activate Medication Plan
                  </Button>
                </div>
              )}
            </div>

            {/* Audit Trail Stamp */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Physician: Dr. Ali Raza Naqvi (AIMC, MRCP UK, FRCP London)</span>
              <span>Attributable Electronic Health Record</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
