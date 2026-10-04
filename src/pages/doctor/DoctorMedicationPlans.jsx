import React, { useState, useEffect } from 'react'
import { CheckCircle2, ClipboardCheck, History, Pill, ShieldCheck } from 'lucide-react'
import { medicationService } from '../../services/medicationService'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'

export function DoctorMedicationPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const active = await medicationService.getActivePlan()
        if (active) setPlans([active])
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
          Approved Treatment Plans & Version History
        </h1>
        <p className="text-xs text-slate-500">
          Archival log of authorized clinical regimens and active reminders
        </p>
      </div>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <Card className="text-center py-10 text-xs text-slate-400">
            No medication plans approved yet. Approve a prescription in the clinical gate to activate a plan.
          </Card>
        ) : (
          plans.map((p) => (
            <Card key={p.id} className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Clinical Plan Version {p.version}.0 — Patient: Shahid Ehsan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Approved by Dr. Ali Raza Naqvi on {new Date(p.approved_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="primary">{p.status.toUpperCase()}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">Active Regimen Items:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {p.medicines?.map((m, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-slate-900">{m.medicine_name}</p>
                      <p className="text-slate-600 font-medium">{m.dose} • {m.frequency}</p>
                      <p className="text-[11px] text-slate-400">{m.food_instruction || 'Standard meals'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
                <span>Reminders Engine: Active</span>
                <span>Audit Tag: Plan #{p.id}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
