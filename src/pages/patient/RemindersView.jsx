import React, { useState, useEffect } from 'react'
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  History,
  RotateCw,
  ShieldCheck,
  Volume2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { medicationService } from '../../services/medicationService'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export function RemindersView() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { requestBrowserPermission } = useNotifications()

  const [schedules, setSchedules] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [browserPermission, setBrowserPermission] = useState('default')
  const [actionLoading, setActionLoading] = useState({})

  const loadData = async () => {
    try {
      const sched = await medicationService.getPatientSchedules(user?.id)
      const adhLogs = await medicationService.getMedicationLogs(user?.id)
      setSchedules(sched)
      setLogs(adhLogs)

      if ('Notification' in window) {
        setBrowserPermission(Notification.permission)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleRequestPermission = async () => {
    const res = await requestBrowserPermission()
    setBrowserPermission(res)
  }

  const handleDose = async (scheduleId, action) => {
    setActionLoading(prev => ({ ...prev, [scheduleId]: true }))
    try {
      await medicationService.recordDoseAction({
        patientId: user?.id,
        scheduleId,
        action
      })
      await loadData()
    } finally {
      setActionLoading(prev => ({ ...prev, [scheduleId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.reminders')}
          </h1>
          <p className="text-xs text-slate-500">
            Configure daily reminder intervals and view patient-reported dose logs
          </p>
        </div>

        {/* Browser Notification Button */}
        {browserPermission !== 'granted' && (
          <Button
            size="sm"
            variant="outline"
            icon={Bell}
            onClick={handleRequestPermission}
            className="text-xs"
          >
            Enable Browser Alert Notifications
          </Button>
        )}
      </div>

      {/* Daily Reminders Timeline */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Active Daily Schedule Alerts</span>
        </h2>

        {schedules.length === 0 ? (
          <Card className="text-center py-8 text-xs text-slate-500">
            No active schedules. Reminders activate automatically once your prescription is approved.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {schedules.map((item) => (
              <Card key={item.id} className="p-4 border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.medicine_name}</h3>
                    <p className="text-xs text-slate-500">{item.dose}</p>
                  </div>
                  <div className="text-right">
                    {item.frequency_type === 'as_needed' ? (
                      <Badge variant="warning">As Needed (PRN)</Badge>
                    ) : (
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {item.scheduled_time || 'Daily'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600">{item.instruction}</p>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    loading={actionLoading[item.id]}
                    onClick={() => handleDose(item.id, 'taken')}
                    className="text-xs bg-emerald-600"
                  >
                    ✓ {t('patient_actions.taken')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={actionLoading[item.id]}
                    onClick={() => handleDose(item.id, 'skip')}
                    className="text-xs"
                  >
                    {t('patient_actions.skip')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={actionLoading[item.id]}
                    onClick={() => handleDose(item.id, 'remind_later')}
                    className="text-xs"
                  >
                    {t('patient_actions.remind_later')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Adherence Event History Table */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <span>Adherence Event History (Patient Reported)</span>
          </h2>
          <span className="text-xs text-slate-400">Total recorded: {logs.length}</span>
        </div>

        {logs.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-400">
            No dose events recorded yet. Press "Patient Reported Taken" when you take your doses.
          </Card>
        ) : (
          <Card className="overflow-x-auto p-0 border-slate-200">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Medication</th>
                  <th className="p-3">Reported Action</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{log.medicine_name}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                        log.action === 'taken'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'skipped'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.label}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(log.recorded_at).toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-500">
                      Patient Self-Reported
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}
