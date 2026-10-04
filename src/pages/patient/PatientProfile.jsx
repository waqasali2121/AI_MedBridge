import React, { useState } from 'react'
import { CheckCircle2, Shield, User, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { LanguageToggle } from '../../components/common/LanguageToggle'

export function PatientProfile() {
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [caregiverEnabled, setCaregiverEnabled] = useState(user?.patient_details?.caregiver_enabled ?? true)
  const [caregiverName, setCaregiverName] = useState(user?.patient_details?.caregiver_name || 'Ayesha Shahid')
  const [caregiverPhone, setCaregiverPhone] = useState(user?.patient_details?.caregiver_phone || '0300-9876543')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.profile')}
          </h1>
          <p className="text-xs text-slate-500">
            Manage your medical record details, allergies, and family caregiver access
          </p>
        </div>
        <LanguageToggle />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Patient Demographics */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Patient Clinical Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={user?.full_name || 'Shahid Ehsan'}
              disabled
            />
            <Input
              label="Medical Record Number (MRN)"
              value={user?.patient_details?.mrn || '00000690'}
              disabled
            />
            <Input
              label="Date of Birth"
              value={user?.patient_details?.date_of_birth || '1982-01-01'}
              disabled
            />
            <Input
              label="Gender"
              value={user?.patient_details?.gender || 'Male'}
              disabled
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Recorded Clinical Allergies
            </label>
            <div className="flex gap-2 flex-wrap">
              {(user?.patient_details?.allergies || ['Penicillin', 'Sulfa drugs']).map((a, i) => (
                <span key={i} className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-semibold shrink-0">
                  ⚠ {a}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Caregiver Access Control */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Family / Caregiver Access
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant permission for a designated caregiver to view medication schedules and log doses on your behalf.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={caregiverEnabled}
                onChange={(e) => setCaregiverEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {caregiverEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Input
                label="Caregiver Full Name"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                placeholder="e.g. Ayesha Shahid"
              />
              <Input
                label="Caregiver Mobile Phone"
                value={caregiverPhone}
                onChange={(e) => setCaregiverPhone(e.target.value)}
                placeholder="0300-9876543"
              />
            </div>
          )}
        </Card>


        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Profile settings updated successfully!
            </span>
          )}
          <div className="ml-auto">
            <Button type="submit">
              Save Profile Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
