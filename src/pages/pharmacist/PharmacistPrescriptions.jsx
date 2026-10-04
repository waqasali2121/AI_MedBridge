import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileCheck2, FileText, Search } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { prescriptionService } from '../../services/prescriptionService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'

export function PharmacistPrescriptions() {
  const { t } = useLanguage()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const rxs = await prescriptionService.getAllPrescriptions()
        setPrescriptions(rxs)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Prescription Verification Queue
        </h1>
        <p className="text-xs text-slate-500">
          Review transcribed drafts, add counselling directions, and forward recommendations to physicians
        </p>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading prescription queue...</Card>
      ) : prescriptions.length === 0 ? (
        <Card className="text-center py-10 text-xs text-slate-400">No prescriptions found</Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <Card key={rx.id} className="p-4 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{rx.patient_name}</span>
                  <span className="text-xs text-slate-500 font-mono">MRN: {rx.mrn || '00000690'}</span>
                  <Badge variant={rx.verification_status === 'approved' ? 'approved' : rx.verification_status === 'needs_clarification' ? 'clarification' : 'warning'}>
                    {t(`status.${rx.verification_status}`, rx.verification_status)}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  {rx.original_file_name} • Extracted: {rx.medicines?.map(m => (m.medicine_name_field?.value || m.medicine_name || 'Unknown').split(' ')[0]).join(', ')}
                </p>
                <p className="text-[11px] text-slate-400">
                  Uploaded {new Date(rx.uploaded_at).toLocaleString()} • Physician: {rx.doctor_name}
                </p>
              </div>

              <Link to={`/pharmacist/prescriptions/${rx.id}`}>
                <Button size="sm" icon={FileCheck2} className="text-xs bg-teal-700 hover:bg-teal-800 shrink-0">
                  Review & Verify Draft
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
