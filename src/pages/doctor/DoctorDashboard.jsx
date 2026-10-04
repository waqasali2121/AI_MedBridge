import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  Stethoscope,
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

export function DoctorDashboard() {
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

  const pendingApproval = prescriptions.filter(p => p.verification_status !== 'approved')
  const pendingCases = cases.filter(c => c.status !== 'doctor_resolved')

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-700/80 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-blue-100">
              Prime Health HUB Dew • DHA Lahore
            </span>
            <span className="text-xs text-blue-200">Consultant Diabetologist & Endocrinologist</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Physician Clinical Portal: {user?.full_name || 'Dr. Ali Raza Naqvi'}
          </h1>
          <p className="text-xs text-blue-100 max-w-xl">
            Resolve ambiguous prescription orders, review pharmacist notes, approve official treatment plans, and publish attributable clinical decisions.
          </p>
        </div>

        <Link to="/doctor/prescriptions">
          <Button variant="secondary" size="sm" icon={FileCheck2} className="bg-blue-600 hover:bg-blue-700 text-white">
            Clinical Approval Gate ({pendingApproval.length})
          </Button>
        </Link>
      </div>

      {/* 4 Required Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Pending Prescriptions</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingApproval.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting final approval</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Patient Concerns</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingCases.length}</p>
          <span className="text-[11px] text-blue-600 font-medium">Awaiting physician decision</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Scheduled Follow-Ups</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">1</p>
          <span className="text-[11px] text-slate-400">01-Nov-2026 (Shahid Ehsan)</span>
        </Card>

        <Card className="p-4 space-y-1 border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Updated Plans</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {prescriptions.filter(p => p.verification_status === 'approved').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Active verified plans</span>
        </Card>
      </div>

      {/* Immediate Physician Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span>Prescriptions Requiring Physician Clinical Approval</span>
          </h2>
          <Link to="/doctor/prescriptions" className="text-xs font-semibold text-blue-700 hover:underline">
            View All →
          </Link>
        </div>

        {pendingApproval.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            All prescriptions have been clinically approved. No pending items in gate.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApproval.map((rx) => (
              <Card key={rx.id} className="p-5 border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{rx.patient_name}</h3>
                    <p className="text-xs text-slate-500">MRN: {rx.mrn || '00000690'} • DHA Phase 6</p>
                  </div>
                  <Badge variant="clarification">
                    {t(`status.${rx.verification_status}`, rx.verification_status)}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                  <p><strong>Diagnosis:</strong> Prediabetes, Obesity</p>
                  <p><strong>Extracted Items:</strong> Tirzee 12.5mg, Zanov 20mg, Methix Tab</p>
                  {rx.pharmacist_notes && (
                    <p className="text-teal-800 font-medium text-[11px] pt-1">
                      <strong>Pharmacist Note:</strong> {rx.pharmacist_notes.slice(0, 90)}...
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {rx.id}</span>
                  <Link to={`/doctor/prescriptions/${rx.id}`}>
                    <Button size="sm" icon={FileCheck2} className="text-xs bg-blue-600 hover:bg-blue-700">
                      Review & Approve Plan
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
