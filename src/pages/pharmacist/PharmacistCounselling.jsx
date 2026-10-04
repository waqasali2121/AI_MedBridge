import React, { useState, useEffect } from 'react'
import { CheckCircle2, HeartHandshake, HelpCircle, MessageSquare, Send } from 'lucide-react'
import { medicationService } from '../../services/medicationService'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'

export function PharmacistCounselling() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const plan = await medicationService.getActivePlan()
        if (plan) setPlans([plan])
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
          Medication Counselling & Teach-Back Verification
        </h1>
        <p className="text-xs text-slate-500">
          Review patient explanations of their regimen to verify that directions, meal timings, and dosage intervals are understood
        </p>
      </div>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <Card className="text-center py-10 text-xs text-slate-400">
            No active patient plans requiring counselling review.
          </Card>
        ) : (
          plans.map((p) => (
            <Card key={p.id} className="p-5 border-slate-200 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Patient: Shahid Ehsan</h3>
                  <p className="text-xs text-slate-500">Plan Version {p.version}.0 • Prescribed by Dr. Ali Raza Naqvi</p>
                </div>
                <Badge variant="primary">Verified Plan</Badge>
              </div>

              {/* Teach-Back Submission Box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  <span>Patient Teach-Back Statement:</span>
                </div>
                <p className="text-xs text-emerald-900 italic leading-relaxed">
                  "{p.teach_back_text || 'Patient has received approved Urdu instructions. Awaiting self-comprehension submission.'}"
                </p>
                {p.teach_back_submitted_at && (
                  <span className="text-[10px] text-emerald-600 block">
                    Submitted: {new Date(p.teach_back_submitted_at).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Prescribed Regimen Overview:</p>
                <ul className="list-disc pl-5 text-[11px] text-slate-600 space-y-0.5">
                  {p.medicines?.map((m, i) => (
                    <li key={i}>{m.medicine_name} — {m.dose}, {m.frequency} ({m.food_instruction || 'Standard'})</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="outline" className="text-xs text-teal-800 border-teal-300">
                  Acknowledge & Confirm Understanding
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
