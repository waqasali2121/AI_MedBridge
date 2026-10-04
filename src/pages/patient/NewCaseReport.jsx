import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Mic,
  MicOff,
  Send,
  ShieldAlert
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { caseService } from '../../services/caseService'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input, Textarea } from '../../components/common/Input'
import { UrgentSafetyModal } from '../../components/common/UrgentSafetyModal'

export function NewCaseReport() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const [concernType, setConcernType] = useState('not_improving')
  const [treatmentStartDate, setTreatmentStartDate] = useState('2026-10-02')
  const [dosesTakenCount, setDosesTakenCount] = useState(4)
  const [symptomsChanged, setSymptomsChanged] = useState('')
  const [adverseEffects, setAdverseEffects] = useState('')
  const [voiceRecording, setVoiceRecording] = useState(false)
  const [voiceRecorded, setVoiceRecorded] = useState(false)
  const [hasUrgentSymptoms, setHasUrgentSymptoms] = useState(false)
  const [urgentModalOpen, setUrgentModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const concernOptions = [
    { value: 'not_improving', label: 'Medicine not helping / symptoms persist' },
    { value: 'suspected_side_effect', label: 'Suspected side effect / adverse reaction' },
    { value: 'medicine_unavailable', label: 'Medicine unavailable at local pharmacies' },
    { value: 'missed_doses', label: 'Missed doses / confused about schedule' },
    { value: 'other', label: 'Other question for care team' }
  ]

  // Urgent symptom screener keywords
  const checkUrgentSymptoms = (text) => {
    const dangerWords = ['chest pain', 'heart attack', 'cannot breathe', 'shortness of breath', 'swelling face', 'fainting', 'anaphylaxis', 'blood', 'سینے میں درد', 'سانس']
    const lower = text.toLowerCase()
    return dangerWords.some(w => lower.includes(w))
  }

  const handleSymptomsChange = (text) => {
    setSymptomsChanged(text)
    if (checkUrgentSymptoms(text)) {
      setHasUrgentSymptoms(true)
      setUrgentModalOpen(true)
    }
  }

  const handleVoiceToggle = () => {
    if (!voiceRecording) {
      setVoiceRecording(true)
      setTimeout(() => {
        setVoiceRecording(false)
        setVoiceRecorded(true)
      }, 3000)
    } else {
      setVoiceRecording(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!symptomsChanged.trim()) {
      setError('Please provide a description of the symptoms or changes you experienced.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const newCase = await caseService.openCase({
        patientId: user?.id,
        patientName: user?.full_name,
        concernType,
        treatmentStartDate,
        dosesTakenCount: Number(dosesTakenCount),
        symptomsChanged,
        adverseEffects,
        voiceNotePlaceholder: voiceRecorded,
        isUrgent: hasUrgentSymptoms
      })

      navigate('/patient/cases')
    } catch (err) {
      setError(err.message || 'Failed to open care inquiry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'ur' ? 'طبی تشویش یا مسئلہ کی اطلاع' : 'Report Medication Concern or Inquiry'}
          </h1>
          <p className="text-xs text-slate-500">
            Open a collaborative inquiry for Care Pharmacist review and Doctor clinical assessment
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Important Clinical Rule:</strong> Lack of immediate symptom resolution does not automatically mean treatment failure. Your Care Pharmacist will review adherence and administration, and your physician will evaluate whether a dosage adjustment or consultation is needed.
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Question 1: What is your concern? */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              1. What is your concern?
            </label>
            <select
              value={concernType}
              onChange={(e) => setConcernType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {concernOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Question 2: When did treatment begin? */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="2. When did treatment begin?"
              type="date"
              value={treatmentStartDate}
              onChange={(e) => setTreatmentStartDate(e.target.value)}
              required
            />

            <Input
              label="3. Which / How many doses were taken?"
              type="number"
              min="0"
              value={dosesTakenCount}
              onChange={(e) => setDosesTakenCount(e.target.value)}
              helperText="Approximate number of doses completed"
              required
            />
          </div>

          {/* Question 4: What symptoms changed? */}
          <Textarea
            label="4. What symptoms changed or failed to improve?"
            rows={3}
            placeholder="e.g. Taking Tirzee for 3 weeks; still noticing elevated morning blood sugar and minor nausea after meal..."
            value={symptomsChanged}
            onChange={(e) => handleSymptomsChange(e.target.value)}
            required
          />

          {/* Question 5: Concerning effects? */}
          <Textarea
            label="5. Did you experience any concerning or unexpected effects?"
            rows={2}
            placeholder="e.g. Mild stomach upset or dizziness. (If severe chest pain or breathing difficulty, seek emergency care immediately)."
            value={adverseEffects}
            onChange={(e) => setAdverseEffects(e.target.value)}
          />

          {/* Voice Message Placeholder Simulation */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-slate-500" />
                Optional Voice Message (Urdu / English)
              </span>
              {voiceRecorded && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Audio Attached (0:14)
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Patients can record a quick voice explanation in Urdu or Punjabi for their care team.
            </p>

            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                voiceRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : voiceRecorded
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {voiceRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Recording voice... Tap to finish</span>
                </>
              ) : voiceRecorded ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Re-record Voice Note</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>Record Voice Description</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/patient/cases')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} icon={Send}>
              Submit Case for Care Team Review
            </Button>
          </div>
        </form>
      </Card>

      {/* Urgent Warning Modal Popup */}
      <UrgentSafetyModal
        isOpen={urgentModalOpen}
        onClose={() => setUrgentModalOpen(false)}
      />
    </div>
  )
}
