import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  HelpCircle,
  Info,
  Pill,
  ShieldAlert,
  User,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { prescriptionService } from '../../services/prescriptionService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function PrescriptionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const item = await prescriptionService.getPrescriptionById(id)
        setPrescription(item)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return <Card className="p-8 text-center text-xs text-slate-400">Loading prescription verification details...</Card>
  }

  if (!prescription) {
    return (
      <Card className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">Prescription not found</p>
        <Link to="/patient/prescriptions">
          <Button variant="outline" size="sm">Back to Prescriptions</Button>
        </Link>
      </Card>
    )
  }

  const isApproved = prescription.verification_status === 'approved'

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/patient/prescriptions">
            <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{prescription.original_file_name}</span>
            </h1>
            <p className="text-xs text-slate-500">
              Uploaded on {new Date(prescription.uploaded_at).toLocaleString()} • MRN: {prescription.mrn || '00000690'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isApproved ? 'approved' : prescription.verification_status === 'needs_clarification' ? 'clarification' : 'warning'}>
            {t(`status.${prescription.verification_status}`, prescription.verification_status)}
          </Badge>
        </div>
      </div>

      {/* Safety Notice Banner */}
      {!isApproved && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Clinical Safety Gate Active:</span> The medicines displayed on the right are an <strong>assistive draft</strong> extracted by AI. In accordance with MedBridge clinical governance, patients cannot directly approve medications. Your doctor (Dr. Ali Raza Naqvi) and pharmacist must review and confirm the plan before reminders and daily dose tracking are activated.
          </div>
        </div>
      )}

      {/* Dual Column Layout: Left = Document View, Right = Extracted Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Original Document Representation */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Original Prescription Scan
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                PDF Document
              </span>
            </div>

            {/* Document Emulation Preview */}
            <div className="bg-white text-slate-900 rounded-lg p-4 font-sans text-xs space-y-3 shadow-inner max-h-[580px] overflow-y-auto">
              {/* Header */}
              <div className="border-b pb-2 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{prescription.clinic_name || 'Prime Health HUB Dew'}</h3>
                  <p className="text-[10px] text-slate-500">{prescription.clinic_address || 'Plaza No. 154, CCA 1, Sector C DHA Phase 6, Lahore'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs text-slate-800">{prescription.doctor_name || 'Dr. Ali Raza Naqvi'}</p>
                  <p className="text-[9px] text-slate-500">Consultant Diabetologist & Endocrinologist</p>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 gap-1 bg-slate-50 p-2 rounded text-[11px]">
                <p><strong>Patient:</strong> {prescription.patient_name || 'Shahid Ehsan'}</p>
                <p><strong>MRN:</strong> {prescription.mrn || '00000690'}</p>
                <p><strong>Date:</strong> 10/2/2026 3:11 PM</p>
                <p><strong>Department:</strong> Endocrinology</p>
              </div>

              {/* Vitals */}
              {prescription.vitals && (
                <div className="border rounded p-2 text-[10px] text-slate-600 bg-emerald-50/40">
                  <span className="font-bold block text-slate-800 mb-0.5">Recorded Vitals:</span>
                  Weight: {prescription.vitals.weight} • Height: {prescription.vitals.height} • BMI: {prescription.vitals.bmi} • BP: {prescription.vitals.bp} • BG: {prescription.vitals.bg}
                </div>
              )}

              {/* Physician Comments */}
              <div className="border-t pt-2 space-y-1 text-[11px] text-slate-700">
                <p className="font-bold text-slate-800">Physician Notes & Referrals:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                  <li>Follow high-protein, low-carb diet (&lt;30g/day); &gt;3L water daily.</li>
                  <li>Referred to Rheumatologist (Dr. Shakaib Qureshi) for heel pain.</li>
                  <li className="text-rose-700 font-semibold">
                    Note: Continue Tirzee 10 mg for now; increase to 12.5 mg after rheumatologist appointment.
                  </li>
                </ul>
              </div>

              {/* Treatment lines */}
              <div className="border-t pt-2 space-y-2">
                <p className="font-bold text-[11px] text-slate-800">Rx Prescribed Items:</p>
                <div className="p-2 bg-slate-50 rounded border text-[10px] space-y-1 font-mono">
                  <p>1. TIRZEE 12.5 MG/0.5ML PRE-FILLED PEN 1'S - 1 Inj weekly (4 wks)</p>
                  <p>2. Zanov 20 mg - 1 Cap before breakfast</p>
                  <p>3. METHIX TAB 20'S - 1 Tab after breakfast</p>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 text-center pt-2">
                *System-generated electronic consultation report • Prime Health HUB Dew*
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Extracted Assistive Draft */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4 border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Itemized Prescription Draft (Assistive Extraction)
                </h2>
                <p className="text-xs text-slate-500">
                  Parsed into structured fields with bilingual translation
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {prescription.medicines?.length || 0} Medications
              </span>
            </div>

            {/* Medicines List */}
            <div className="space-y-4">
              {prescription.medicines?.map((med, index) => (
                <div
                  key={med.id || index}
                  className={`p-4 rounded-xl border transition-all ${
                    med.clarification_required
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200/50'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{med.medicine_name}</span>
                        {med.strength && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {med.strength}
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          {med.dosage_form} • {med.route}
                        </span>
                      </div>

                      {/* Explicit Flag for Clarification if required */}
                      {med.clarification_required && (
                        <div className="p-2.5 bg-amber-100/90 border border-amber-300 rounded-lg text-xs text-amber-950 font-medium space-y-1 mt-2">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>⚠ Needs Clarification (Flagged for Doctor Review)</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">
                            {med.clarification_reason || 'Doctor escalation instructions require clarification prior to treatment approval.'}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 text-slate-600">
                        <p><strong>Dose:</strong> {med.dose}</p>
                        <p><strong>Frequency:</strong> {med.frequency}</p>
                        {med.duration && <p><strong>Duration:</strong> {med.duration}</p>}
                        {med.food_instruction && <p><strong>Food:</strong> {med.food_instruction}</p>}
                      </div>

                      {/* Bilingual Instructions */}
                      {med.urdu_instruction && (
                        <div className="mt-2.5 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-xs font-urdu text-emerald-950">
                          <strong>اردو ہدایات:</strong> {med.urdu_instruction}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes Section from Pharmacist & Doctor */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              {prescription.pharmacist_notes && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-teal-900">Care Pharmacist Review Notes:</p>
                  <p className="text-teal-800">{prescription.pharmacist_notes}</p>
                </div>
              )}

              {prescription.doctor_notes && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-blue-900">Physician Clinical Decision Notes:</p>
                  <p className="text-blue-800">{prescription.doctor_notes}</p>
                </div>
              )}
            </div>

            {/* Status explanation */}
            <div className="pt-2 text-center text-xs text-slate-400">
              {isApproved ? (
                <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> This prescription has been clinically approved and activated.
                </span>
              ) : (
                <span>Awaiting Care Pharmacist review & Physician authorization.</span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
