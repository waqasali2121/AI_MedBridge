import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  Pill,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Store,
  Volume2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { medicationService } from '../../services/medicationService'
import { prescriptionService } from '../../services/prescriptionService'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { TeachBackModal } from '../../components/common/TeachBackModal'

export function PatientDashboard() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [activePlan, setActivePlan] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [teachBackOpen, setTeachBackOpen] = useState(false)

  const loadData = async () => {
    try {
      const plan = await medicationService.getActivePlan(user?.id)
      const sched = await medicationService.getPatientSchedules(user?.id)
      const rxList = await prescriptionService.getPrescriptionsByPatient(user?.id)
      const adherenceLogs = await medicationService.getMedicationLogs(user?.id)

      setActivePlan(plan)
      setSchedules(sched)
      setPrescriptions(rxList)
      setLogs(adherenceLogs)
    } catch (err) {
      console.error('Error loading patient dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleDoseAction = async (scheduleId, action) => {
    setActionLoading(prev => ({ ...prev, [scheduleId]: true }))
    try {
      await medicationService.recordDoseAction({
        patientId: user?.id,
        scheduleId,
        action
      })
      await loadData()
    } catch (err) {
      console.error('Failed to log dose action:', err)
    } finally {
      setActionLoading(prev => ({ ...prev, [scheduleId]: false }))
    }
  }

  const latestRx = prescriptions[0]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-600/80 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-emerald-100">
              MRN: {user?.patient_details?.mrn || '00000690'}
            </span>
            <span className="text-xs text-emerald-200">
              {user?.patient_details?.age || '44 Y'} • {user?.patient_details?.gender || 'Male'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'ur' ? `خوش آمدید، ${user?.full_name}` : `Welcome back, ${user?.full_name}`}
          </h1>
          <p className="text-xs text-emerald-100 max-w-xl">
            {activePlan
              ? 'Your medication plan is actively verified by Dr. Ali Raza Naqvi & Care Pharmacist Zainab Fatima.'
              : 'You have a prescription in verification. Once approved by your care team, reminders will activate.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/patient/prescriptions/new">
            <Button variant="secondary" size="sm" icon={Plus}>
              {t('patient_actions.upload_btn')}
            </Button>
          </Link>
          <Link to="/patient/pharmacies">
            <Button variant="outline" size="sm" icon={Search} className="bg-white/10 text-white hover:bg-white/20 border-white/30">
              {t('nav.pharmacies')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Status Alert if pending */}
      {latestRx && latestRx.verification_status !== 'approved' && (
        <Card className="border-amber-200 bg-amber-50/70 p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Prescription Under Clinical Verification ({latestRx.original_file_name})</span>
            </div>
            <Badge variant="clarification">
              {t(`status.${latestRx.verification_status}`, 'Needs Clarification')}
            </Badge>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Assistive AI extracted 3 medications from your prescription. One field has been flagged for doctor clarification. Reminders and active schedules will automatically activate once Dr. Ali Raza Naqvi reviews and approves the plan.
          </p>
          <div className="pt-1 flex items-center gap-3 text-xs">
            <Link to={`/patient/prescriptions/${latestRx.id}`} className="font-bold text-amber-900 underline">
              View Extraction Draft & Details →
            </Link>
          </div>
        </Card>
      )}

      {/* Main Container: Extreme Simplicity layout for elderly patients */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Today's Medicines Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b-2 border-emerald-500 pb-2 inline-block">
             Today's Medicines
          </h2>

          {schedules.length === 0 ? (
            <Card className="text-center py-10 space-y-3 bg-slate-50 dark:bg-slate-800 border-none shadow-none">
              <Pill className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">No active medicines today</h4>
            </Card>
          ) : (
            <div className="space-y-4">
              {schedules.map((item) => (
                <Card key={item.id} className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">{item.medicine_name}</h3>
                      <div className="text-lg text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {item.scheduled_time ? (
                           <span>{item.scheduled_time} — {item.dose}</span>
                        ) : (
                           <span>As Needed (PRN) — {item.dose}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 pt-1">{item.instruction}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                      <Button
                        size="lg"
                        variant="primary"
                        loading={actionLoading[item.id]}
                        onClick={() => handleDoseAction(item.id, 'taken')}
                        className="w-full text-base py-3"
                      >
                        ✓ Taken
                      </Button>
                      <Button
                        size="md"
                        variant="outline"
                        loading={actionLoading[item.id]}
                        onClick={() => handleDoseAction(item.id, 'remind_later')}
                        className="w-full"
                      >
                         Remind Upcoming
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 6 Massive Navigation Buttons */}
        <div className="pt-8">
           <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 px-1">Quick Actions</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/patient/medications" className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-center transition-all cursor-pointer group shadow-sm">
                 <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <FileText className="w-8 h-8" />
                 </div>
                 <span className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">My<br/>Medicines</span>
              </Link>
              
              <Link to="/patient/ai-assistant" className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-center transition-all cursor-pointer group shadow-sm">
                 <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Sparkles className="w-8 h-8" />
                 </div>
                 <span className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">Ask<br/>Medicine AI</span>
              </Link>
              
              <Link to="/patient/prescriptions/new" className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-center transition-all cursor-pointer group shadow-sm">
                 <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Plus className="w-8 h-8" />
                 </div>
                 <span className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">Upload<br/>Prescription</span>
              </Link>
              
              <Link to="/patient/pharmacies" className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-center transition-all cursor-pointer group shadow-sm">
                 <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Search className="w-8 h-8" />
                 </div>
                 <span className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">Find<br/>Medicine</span>
              </Link>
              
              <Link to="/patient/cases/new" className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-center transition-all cursor-pointer group shadow-sm">
                 <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 text-rose-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <AlertCircle className="w-8 h-8" />
                 </div>
                 <span className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">Contact<br/>Pharmacist</span>
              </Link>
              
              <Link to="/patient/cases" className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-center transition-all cursor-pointer group shadow-sm">
                 <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 text-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <FileText className="w-8 h-8" />
                 </div>
                 <span className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">My<br/>Reports</span>
              </Link>
           </div>
        </div>
      </div>

      {/* Teach Back Modal */}
      {activePlan && (
        <TeachBackModal
          isOpen={teachBackOpen}
          onClose={() => setTeachBackOpen(false)}
          plan={activePlan}
          patientId={user?.id}
          onSubmitted={loadData}
        />
      )}
    </div>
  )
}
