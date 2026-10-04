import { getAppState, saveAppState } from './mockData'
import { prescriptionExtractionService } from './prescriptionExtractionService'
import { auditService } from './auditService'
import { notificationService } from './notificationService'
import { medicationService } from './medicationService'
import { supabase, isSupabaseConfigured, STORAGE_BUCKET, MAX_UPLOAD_SIZE_MB } from '../lib/supabase'

export const prescriptionService = {
  /**
   * Upload and process a new prescription
   */
  async uploadPrescription({ file, patientId, patientName, mrn }) {
    // 1. Validate file constraints
    if (!file) throw new Error('No file provided for upload.')
    
    const maxBytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if (file.size > maxBytes) {
      throw new Error(`File size exceeds maximum limit of ${MAX_UPLOAD_SIZE_MB}MB.`)
    }

    const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedMime.includes(file.type)) {
      throw new Error('Invalid file format. Please upload a PDF, JPG, PNG, or WEBP image.')
    }

    // 2. Perform Assistive AI Extraction (Draft extraction)
    const extractedData = await prescriptionExtractionService.extractPrescription(file)

    const prescriptionId = `rx-${Date.now()}`
    const timestamp = new Date().toISOString()

    const newPrescription = {
      id: prescriptionId,
      patient_id: patientId || 'user-pat-01',
      patient_name: patientName || extractedData.patient.name,
      mrn: mrn || extractedData.patient.mrn,
      doctor_name: extractedData.doctor.name,
      clinic_name: extractedData.doctor.clinic,
      clinic_address: extractedData.doctor.address,
      visit_date: extractedData.patient.visit_date,
      follow_up_date: extractedData.follow_up,
      original_file_name: file.name,
      original_file_path: URL.createObjectURL(file),
      uploaded_at: timestamp,
      extraction_status: 'completed',
      // Starts as needs_clarification or pending_pharmacist depending on whether any field is flagged
      verification_status: extractedData.medicines.some(m => m.clarification_required)
        ? 'needs_clarification'
        : 'pending_pharmacist',
      vitals: extractedData.vitals,
      active_problems: extractedData.active_problems,
      lifestyle_comments: extractedData.lifestyle_comments,
      medicines: extractedData.medicines,
      pharmacist_notes: '',
      doctor_notes: '',
      extracted_data: extractedData
    }

    // Save to state
    const state = getAppState()
    state.prescriptions = [newPrescription, ...(state.prescriptions || [])]
    saveAppState(state)

    // Audit Log
    await auditService.logAction({
      userId: patientId || 'user-pat-01',
      userRole: 'patient',
      action: 'Prescription Uploaded',
      entityType: 'prescription',
      entityId: prescriptionId,
      details: `Prescription ${file.name} uploaded and parsed into structured draft.`
    })

    // Notify Clinical Staff
    await notificationService.notify({
      userId: 'user-phm-01',
      type: 'prescription_review_needed',
      title: 'New Prescription Verification Required',
      message: `Prescription uploaded for ${newPrescription.patient_name} (MRN: ${newPrescription.mrn}). Pending pharmacist review.`,
      linkUrl: `/pharmacist/prescriptions`
    })

    return newPrescription
  },

  async getPrescriptionById(id) {
    const state = getAppState()
    return (state.prescriptions || []).find(p => p.id === id) || null
  },

  async getPrescriptionsByPatient(patientId) {
    const state = getAppState()
    return (state.prescriptions || []).filter(p => !patientId || p.patient_id === patientId)
  },

  async getAllPrescriptions() {
    const state = getAppState()
    return state.prescriptions || []
  },

  /**
   * Pharmacist Verification Step:
   * Pharmacist checks transcription, adds counselling notes, sends recommendation to doctor.
   * Safety rule: Pharmacist CANNOT directly change prescribed treatment.
   */
  async submitPharmacistReview({ prescriptionId, pharmacistId, pharmacistNotes, verificationStatus }) {
    const state = getAppState()
    const index = (state.prescriptions || []).findIndex(p => p.id === prescriptionId)
    if (index === -1) throw new Error('Prescription not found.')

    // Clear clarification flags if pharmacist resolves them
    const resolvedMedicines = (state.prescriptions[index].medicines || []).map(m => ({
      ...m,
      clarification_required: false,
      clarification_reason: null
    }))

    const finalStatus = verificationStatus || 'pending_doctor'

    const updated = {
      ...state.prescriptions[index],
      medicines: resolvedMedicines,
      pharmacist_notes: pharmacistNotes,
      verification_status: finalStatus,
      pharmacist_reviewed_at: new Date().toISOString(),
      pharmacist_id: pharmacistId
    }

    state.prescriptions[index] = updated
    saveAppState(state)

    if (finalStatus === 'approved') {
      // Automate routine approval bypassing doctor!
      const activePlan = await medicationService.createPlanFromPrescription({
        prescription: updated,
        doctorId: pharmacistId // Pharmacist acted as final authority
      })

      await auditService.logAction({
        userId: pharmacistId,
        userRole: 'pharmacist',
        action: 'Pharmacist Approved Routine Treatment',
        entityType: 'prescription',
        entityId: prescriptionId,
        details: `Pharmacist verified and activated routine prescription (v${activePlan.version}). Reminders activated.`
      })

      // Notify Patient directly
      await notificationService.notify({
        userId: updated.patient_id,
        type: 'plan_approved',
        title: 'Medication Plan Approved!',
        message: `Your Care Pharmacist has verified and activated your medication plan. Your schedule and reminders are now active.`,
        linkUrl: `/patient/medications`
      })

      return updated
    } else {
      // Escalated to doctor
      await auditService.logAction({
        userId: pharmacistId,
        userRole: 'pharmacist',
        action: 'Pharmacist Review Submitted',
        entityType: 'prescription',
        entityId: prescriptionId,
        details: `Pharmacist reviewed draft. Notes: "${pharmacistNotes}". Forwarded to Doctor.`
      })

      await notificationService.notify({
        userId: 'user-doc-01',
        type: 'prescription_doctor_approval',
        title: 'Prescription Ready for Final Approval',
        message: `Pharmacist escalated a prescription for ${updated.patient_name} requiring doctor clinical approval.`,
        linkUrl: `/doctor/prescriptions`
      })

      return updated
    }
  },

  /**
   * Doctor Approval Step:
   * Doctor reviews, resolves unclear orders, approves plan.
   * Approval activates medication schedule and deactivates old plans!
   */
  async submitDoctorApproval({ prescriptionId, doctorId, doctorNotes, action = 'approve' }) {
    const state = getAppState()
    const index = (state.prescriptions || []).findIndex(p => p.id === prescriptionId)
    if (index === -1) throw new Error('Prescription not found.')

    const currentRx = state.prescriptions[index]

    if (action === 'approve') {
      // Clear clarification flags as doctor has resolved them
      const resolvedMedicines = (currentRx.medicines || []).map(m => ({
        ...m,
        clarification_required: false,
        clarification_reason: null
      }))

      const updated = {
        ...currentRx,
        medicines: resolvedMedicines,
        doctor_notes: doctorNotes,
        verification_status: 'approved',
        doctor_approved_at: new Date().toISOString(),
        doctor_id: doctorId
      }

      state.prescriptions[index] = updated
      saveAppState(state)

      // Automatically generate active Medication Plan and deactive old reminders
      const activePlan = await medicationService.createPlanFromPrescription({
        prescription: updated,
        doctorId
      })

      // Audit Log
      await auditService.logAction({
        userId: doctorId,
        userRole: 'doctor',
        action: 'Doctor Approved Treatment Plan',
        entityType: 'prescription',
        entityId: prescriptionId,
        details: `Doctor approved prescription and clinical medication plan (v${activePlan.version}). Reminders activated.`
      })

      // Notify Patient
      await notificationService.notify({
        userId: updated.patient_id,
        type: 'plan_approved',
        title: 'Medication Plan Approved!',
        message: `Dr. Ali Raza Naqvi has verified and approved your medication plan. Your schedule and reminders are now active.`,
        linkUrl: `/patient/medications`
      })

      return { prescription: updated, plan: activePlan }
    } else {
      // Rejection or returned for clarification
      const updated = {
        ...currentRx,
        doctor_notes: doctorNotes,
        verification_status: 'needs_clarification'
      }
      state.prescriptions[index] = updated
      saveAppState(state)

      await auditService.logAction({
        userId: doctorId,
        userRole: 'doctor',
        action: 'Doctor Returned for Clarification',
        entityType: 'prescription',
        entityId: prescriptionId,
        details: `Doctor requested clarification: ${doctorNotes}`
      })

      return { prescription: updated, plan: null }
    }
  }
}
