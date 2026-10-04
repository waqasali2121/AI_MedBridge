import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, HelpCircle, Pill, Plus, Search, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { medicationService } from '../../services/medicationService'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { TeachBackModal } from '../../components/common/TeachBackModal'

export function MedicationsView() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [activePlan, setActivePlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [teachBackOpen, setTeachBackOpen] = useState(false)

  const loadPlan = async () => {
    try {
      const plan = await medicationService.getActivePlan(user?.id)
      setActivePlan(plan)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlan()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.medications')}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'ur'
              ? 'ڈاکٹر کے تصدیق شدہ فعال علاجی منصوبے کی ادویات'
              : 'Active doctor-approved medication plan and verified intake instructions'}
          </p>
        </div>

        {activePlan && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="hidden sm:flex text-slate-700 bg-white border-slate-200"
            >
              Download PDF Summary
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={HelpCircle}
              onClick={() => setTeachBackOpen(true)}
              className="text-emerald-700 bg-emerald-50 border-emerald-200"
            >
              {t('patient_actions.check_understanding')}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}</style>

      {loading ? (
        <Card className="p-8 text-center text-xs text-slate-400">Loading active medication plan...</Card>
      ) : !activePlan ? (
        <Card className="text-center py-12 space-y-3">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No Active Approved Medication Plan</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once your doctor reviews and confirms your prescription, your official medications and instructions will be listed here.
          </p>
          <Link to="/patient/prescriptions">
            <Button size="sm">Check Prescriptions Status</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4 print-area">
          {/* Plan Verification Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-950">
                  Plan Version {activePlan.version}.0 • Clinically Verified
                </span>
                <p className="text-[11px] text-emerald-700">
                  Approved on {new Date(activePlan.approved_at).toLocaleDateString()} by Dr. Ali Raza Naqvi
                </p>
              </div>
            </div>

            <Link to="/patient/pharmacies">
              <Button size="sm" variant="outline" icon={Search} className="text-xs bg-white">
                Check Pharmacy Stock
              </Button>
            </Link>
          </div>

          {/* Medicines Grid */}
          <div className="grid grid-cols-1 gap-4">
            {activePlan.medicines?.map((med, idx) => (
              <Card key={med.id || idx} className="p-5 border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-emerald-100 dark:border-emerald-800/50 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      💊 {med.medicine_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Active: {med.active_ingredient} • {med.dosage_form} ({med.route})
                    </p>
                  </div>
                  <Badge variant="primary">Active</Badge>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">Why am I taking this?</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {med.reason_for_use || 'To treat the condition identified by your doctor in your clinical profile.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">How much?</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{med.dose}</p>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">How often?</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{med.frequency}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">Duration</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{med.duration || 'Ongoing'}</p>
                    </div>
                  </div>
                </div>

                {med.special_instruction && (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong className="text-blue-800 dark:text-blue-300">Important Instructions: </strong> 
                      {med.special_instruction}
                    </p>
                  </div>
                )}

                {med.urdu_instruction && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs font-urdu text-emerald-950">
                    <strong className="block mb-0.5">ہدایات برائے استعمال (اردو):</strong>
                    {med.urdu_instruction}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Teach Back Modal */}
      {activePlan && (
        <TeachBackModal
          isOpen={teachBackOpen}
          onClose={() => setTeachBackOpen(false)}
          plan={activePlan}
          patientId={user?.id}
          onSubmitted={loadPlan}
        />
      )}
    </div>
  )
}
