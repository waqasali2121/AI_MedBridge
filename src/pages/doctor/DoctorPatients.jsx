import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileText, Phone, Stethoscope, User, Users } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'

export function DoctorPatients() {
  const patients = [
    {
      id: 'user-pat-01',
      name: 'Shahid Ehsan',
      mrn: '00000690',
      dob: '01-Jan-1982',
      age: '44 Y',
      gender: 'Male',
      phone: '0300-0068443',
      department: 'Endocrinology and Diabetes',
      diagnoses: ['Prediabetes (R7303)', 'Obesity, unspecified (E669)'],
      vitals: {
        weight: '84.0 kgs',
        height: '1.74 m',
        bmi: '27.74',
        bp: '110 / 91 mmHg',
        bg: '127 mg/dl',
        hba1c: '5.5%'
      },
      allergies: ['Penicillin', 'Sulfa drugs'],
      follow_up: '01-Nov-2026'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Assigned Patients Directory
        </h1>
        <p className="text-xs text-slate-500">
          Patients registered under Dr. Ali Raza Naqvi at Prime Health HUB Dew, Lahore
        </p>
      </div>

      <div className="space-y-4">
        {patients.map((p) => (
          <Card key={p.id} className="p-5 border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                  SE
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500">
                    MRN: {p.mrn} • {p.gender} / {p.age} • DOB: {p.dob}
                  </p>
                </div>
              </div>
              <Badge variant="primary">Active Patient</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">Diagnoses / Active Problems:</span>
                <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                  {p.diagnoses.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">Baseline Vitals & Labs:</span>
                <p className="text-slate-600 text-[11px]">
                  BP: {p.vitals.bp} • BG: {p.vitals.bg} • HbA1c: {p.vitals.hba1c}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Weight: {p.vitals.weight} • BMI: {p.vitals.bmi}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">Clinical Alerts & Next Visit:</span>
                <p className="text-rose-700 text-[11px] font-semibold">
                  Allergies: {p.allergies.join(', ')}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Next Follow-up: {p.follow_up}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <Link to="/doctor/prescriptions">
                <Button size="sm" variant="outline" icon={FileText} className="text-xs">
                  View Prescriptions
                </Button>
              </Link>
              <Link to="/doctor/cases">
                <Button size="sm" variant="outline" className="text-xs text-blue-700">
                  View Cases
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
