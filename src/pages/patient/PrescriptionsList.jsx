import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Calendar, Eye, FileText, Plus, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { prescriptionService } from '../../services/prescriptionService'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export function PrescriptionsList() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const list = await prescriptionService.getPrescriptionsByPatient(user?.id)
        setPrescriptions(list)
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
            {t('nav.prescriptions')}
          </h1>
          <p className="text-xs text-slate-500">
            History of uploaded prescriptions and their professional verification states
          </p>
        </div>
        <Link to="/patient/prescriptions/new">
          <Button size="sm" icon={Plus}>
            {t('patient_actions.upload_btn')}
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading prescriptions...</Card>
      ) : prescriptions.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Prescriptions Uploaded Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your prescription document or picture to activate the care verification loop.
          </p>
          <Link to="/patient/prescriptions/new">
            <Button size="sm" icon={Plus}>
              Upload First Prescription
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <Card key={rx.id} hover className="p-5 flex flex-col justify-between gap-4 border-slate-200">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 truncate max-w-[200px]">
                        {rx.original_file_name}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Uploaded on {new Date(rx.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={rx.verification_status === 'approved' ? 'approved' : rx.verification_status === 'needs_clarification' ? 'clarification' : 'warning'}>
                    {t(`status.${rx.verification_status}`, rx.verification_status)}
                  </Badge>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p><strong>Physician:</strong> {rx.doctor_name || 'Prime Health HUB Dew'}</p>
                  <p><strong>Extracted Items:</strong> {rx.medicines?.length || 0} medications</p>
                  {rx.vitals?.bp && (
                    <p className="text-slate-500 text-[11px]">BP: {rx.vitals.bp} • BG: {rx.vitals.bg}</p>
                  )}
                </div>

                {rx.medicines?.some(m => m.clarification_required) && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Clinical note: Escalation confirmation flagged for doctor</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  ID: {rx.id}
                </span>
                <Link to={`/patient/prescriptions/${rx.id}`}>
                  <Button size="sm" variant="outline" icon={Eye} className="text-xs">
                    View Verification Draft
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
