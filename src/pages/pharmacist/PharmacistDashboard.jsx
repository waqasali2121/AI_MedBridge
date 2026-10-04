import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  HeartHandshake,
  Pill,
  ShieldCheck,
  Store,
  Users
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { prescriptionService } from '../../services/prescriptionService'
import { caseService } from '../../services/caseService'
import { medicationService } from '../../services/medicationService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function PharmacistDashboard() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [prescriptions, setPrescriptions] = useState([])
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const rxs = await prescriptionService.getAllPrescriptions()
        const allCases = await caseService.getAllCases()
        setPrescriptions(rxs)
        setCases(allCases)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingRxs = prescriptions.filter(p => p.verification_status !== 'approved')
  const pendingCases = cases.filter(c => c.status === 'open')

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-700/80 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-teal-100">
              License: PB-RPh-84920
            </span>
            <span className="text-xs text-teal-200">Clinical Verification & Counselling</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Care Pharmacist Portal: {user?.full_name || 'Zainab Fatima, PharmD'}
          </h1>
          <p className="text-xs text-teal-100 max-w-xl">
            Verify transcription accuracy, review drug-drug interactions, add patient counselling notes, and triage adherence inquiries for doctor review.
          </p>
        </div>

        <Link to="/pharmacist/prescriptions">
          <Button variant="secondary" size="sm" icon={FileCheck2}>
            Review Pending Prescriptions ({pendingRxs.length})
          </Button>
        </Link>
      </div>

      {/* 4 Required Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Pending Rx Reviews</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingRxs.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting transcription check</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Patient Cases</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingCases.length}</p>
          <span className="text-[11px] text-teal-600 font-medium">Adherence & efficacy triage</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Medication Counselling</span>
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">3</p>
          <span className="text-[11px] text-slate-400">Teach-back submissions</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Inventory Requests</span>
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">1</p>
          <span className="text-[11px] text-slate-400">Community stock holds</span>
        </Card>
      </div>

      {/* Immediate Verification Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-600" />
            <span>Prescriptions Needing Pharmacist Verification</span>
          </h2>
          <Link to="/pharmacist/prescriptions" className="text-xs font-semibold text-teal-700 hover:underline">
            View All →
          </Link>
        </div>

        {pendingRxs.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No prescriptions pending verification.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRxs.map((rx) => (
              <Card key={rx.id} className="p-5 border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{rx.patient_name}</h3>
                    <p className="text-xs text-slate-500">MRN: {rx.mrn || '00000690'} • Prescribed by {rx.doctor_name}</p>
                  </div>
                  <Badge variant="clarification">
                    {t(`status.${rx.verification_status}`, rx.verification_status)}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                  <p><strong>Prescription:</strong> {rx.original_file_name}</p>
                  <p><strong>Extracted Items:</strong> {rx.medicines?.map(m => m.medicine_name.split(' ')[0]).join(', ')}</p>
                  {rx.medicines?.some(m => m.clarification_required) && (
                    <p className="text-amber-800 font-semibold text-[11px]">
                      ⚠ Escalation ambiguity detected on Tirzee 12.5mg. Pharmacist note required.
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link to={`/pharmacist/prescriptions/${rx.id}`}>
                    <Button size="sm" icon={FileCheck2} className="text-xs bg-teal-700 hover:bg-teal-800">
                      Open Verification Screen
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
