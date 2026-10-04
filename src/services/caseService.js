import { getAppState, saveAppState } from './mockData'
import { auditService } from './auditService'
import { notificationService } from './notificationService'

export const caseService = {
  /**
   * Patient opens a concern / inquiry.
   * Safety Rule: AI organizes and summarizes without diagnosing or declaring treatment failure.
   */
  async openCase({
    patientId,
    patientName,
    concernType, // 'not_improving' | 'suspected_side_effect' | 'medicine_unavailable' | 'missed_doses' | 'other'
    treatmentStartDate,
    dosesTakenCount,
    symptomsChanged,
    adverseEffects,
    voiceNotePlaceholder = false,
    isUrgent = false
  }) {
    const state = getAppState()
    const caseId = `case-${Date.now()}`
    const timestamp = new Date().toISOString()

    // Assistive AI summarization strictly without clinical diagnosis
    const aiSummary = `Patient reports "${concernType.replace(/_/g, ' ')}". Treatment initiated on ${treatmentStartDate || 'recently'}, with approx ${dosesTakenCount || 'unspecified'} doses taken. Reported changes: "${symptomsChanged}". Adverse reactions noted: "${adverseEffects || 'None noted'}". [AI Notice: Assistive summary for care team review; no diagnostic inference generated.]`

    const newCase = {
      id: caseId,
      patient_id: patientId || 'user-pat-01',
      patient_name: patientName || 'Shahid Ehsan',
      concern_type: concernType,
      treatment_start_date: treatmentStartDate,
      doses_taken_count: dosesTakenCount,
      symptoms_changed: symptomsChanged,
      adverse_effects: adverseEffects,
      voice_note_present: voiceNotePlaceholder,
      ai_summary: aiSummary,
      urgency: isUrgent ? 'urgent' : 'standard',
      status: 'open', // 'open' -> 'pharmacist_reviewed' -> 'doctor_resolved' -> 'closed'
      created_at: timestamp,
      updated_at: timestamp,
      pharmacist_recommendation: null,
      pharmacist_reviewed_at: null,
      doctor_decision: null,
      doctor_explanation: null,
      doctor_resolved_at: null
    }

    state.cases = [newCase, ...(state.cases || [])]
    saveAppState(state)

    // Audit Log
    await auditService.logAction({
      userId: patientId,
      userRole: 'patient',
      action: 'Patient Opened Care Inquiry',
      entityType: 'patient_case',
      entityId: caseId,
      details: `Case opened for ${concernType}: "${symptomsChanged.slice(0, 60)}..."`
    })

    // Notify Care Pharmacist first for medication triage
    await notificationService.notify({
      userId: 'user-phm-01',
      type: 'case_triage_needed',
      title: 'New Patient Care Case Opened',
      message: `${patientName} opened a case regarding ${concernType.replace(/_/g, ' ')}. Please review adherence and formulate recommendation for doctor.`,
      linkUrl: `/pharmacist/cases`
    })

    return newCase
  },

  async getPatientCases(patientId) {
    const state = getAppState()
    return (state.cases || []).filter(c => !patientId || c.patient_id === patientId)
  },

  async getAllCases() {
    const state = getAppState()
    return state.cases || []
  },

  async getCaseById(id) {
    const state = getAppState()
    return (state.cases || []).find(c => c.id === id) || null
  },

  /**
   * Step 2: Pharmacist review & recommendation
   */
  async submitPharmacistRecommendation({ caseId, pharmacistId, recommendation, adherenceAssessment }) {
    const state = getAppState()
    const index = (state.cases || []).findIndex(c => c.id === caseId)
    if (index === -1) throw new Error('Case not found.')

    const currentCase = state.cases[index]
    const timestamp = new Date().toISOString()

    currentCase.status = 'pharmacist_reviewed'
    currentCase.pharmacist_recommendation = recommendation
    currentCase.pharmacist_adherence_assessment = adherenceAssessment
    currentCase.pharmacist_id = pharmacistId
    currentCase.pharmacist_reviewed_at = timestamp
    currentCase.updated_at = timestamp

    state.cases[index] = currentCase
    saveAppState(state)

    // Audit Log
    await auditService.logAction({
      userId: pharmacistId,
      userRole: 'pharmacist',
      action: 'Pharmacist Case Recommendation',
      entityType: 'patient_case',
      entityId: caseId,
      details: `Pharmacist recommendation provided: "${recommendation.slice(0, 60)}..."`
    })

    // Forward to Doctor for clinical decision
    await notificationService.notify({
      userId: 'user-doc-01',
      type: 'case_doctor_review',
      title: 'Case Ready for Physician Clinical Decision',
      message: `Pharmacist has submitted recommendation on case for ${currentCase.patient_name}. Doctor decision required.`,
      linkUrl: `/doctor/cases`
    })

    return currentCase
  },

  /**
   * Step 3: Doctor final decision
   * Only the doctor's decision forms the patient-facing clinical outcome.
   */
  async submitDoctorDecision({ caseId, doctorId, decision, explanation, actionRequired = 'none' }) {
    const state = getAppState()
    const index = (state.cases || []).findIndex(c => c.id === caseId)
    if (index === -1) throw new Error('Case not found.')

    const currentCase = state.cases[index]
    const timestamp = new Date().toISOString()

    currentCase.status = 'doctor_resolved'
    currentCase.doctor_id = doctorId
    currentCase.doctor_decision = decision
    currentCase.doctor_explanation = explanation
    currentCase.doctor_action_required = actionRequired
    currentCase.doctor_resolved_at = timestamp
    currentCase.updated_at = timestamp

    state.cases[index] = currentCase
    saveAppState(state)

    // Audit Log
    await auditService.logAction({
      userId: doctorId,
      userRole: 'doctor',
      action: 'Doctor Case Decision Published',
      entityType: 'patient_case',
      entityId: caseId,
      details: `Doctor decision: "${decision}". Explanation: "${explanation.slice(0, 60)}..."`
    })

    // Notify Patient with the unified, approved outcome
    await notificationService.notify({
      userId: currentCase.patient_id,
      type: 'case_resolved',
      title: 'Care Team Decision Published',
      message: `Dr. Ali Raza Naqvi has reviewed your inquiry. Decision: "${decision}". Tap to view full instructions.`,
      linkUrl: `/patient/cases`
    })

    return currentCase
  }
}
