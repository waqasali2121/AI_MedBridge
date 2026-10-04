import { getAppState, saveAppState } from './mockData'
import { auditService } from './auditService'
import { notificationService } from './notificationService'

export const medicationService = {
  /**
   * Generates or activates a medication plan from an approved prescription.
   * Automatically supersedes/deactivates older plans and their reminders!
   */
  async createPlanFromPrescription({ prescription, doctorId }) {
    const state = getAppState()
    const timestamp = new Date().toISOString()
    const patientId = prescription.patient_id

    // 1. Deactivate & supersede existing active plans for this patient
    state.medication_plans = (state.medication_plans || []).map(p => {
      if (p.patient_id === patientId && p.status === 'approved') {
        return { ...p, status: 'superseded', superseded_at: timestamp }
      }
      return p
    })

    // 2. Deactivate old reminders from prior schedules
    const activePlanIds = state.medication_plans
      .filter(p => p.patient_id === patientId && p.status === 'approved')
      .map(p => p.id)

    state.schedules = (state.schedules || []).map(s => {
      if (!activePlanIds.includes(s.medication_plan_id)) {
        return { ...s, reminder_enabled: false }
      }
      return s
    })

    // 3. Create the new Approved Plan
    const planVersion = (state.medication_plans || []).filter(p => p.patient_id === patientId).length + 1
    const newPlanId = `plan-${Date.now()}`

    const newPlan = {
      id: newPlanId,
      patient_id: patientId,
      prescription_id: prescription.id,
      version: planVersion,
      status: 'approved',
      start_date: new Date().toISOString().split('T')[0],
      end_date: prescription.follow_up_date || null,
      approved_by_doctor: doctorId || 'user-doc-01',
      approved_at: timestamp,
      teach_back_text: null,
      teach_back_status: 'pending',
      medicines: prescription.medicines
    }

    state.medication_plans = [newPlan, ...(state.medication_plans || [])]

    // 4. Create Schedules for the plan medicines
    const newSchedules = []
    prescription.medicines.forEach((med, idx) => {
      const freqStr = med.frequency?.toLowerCase() || '';
      const isAsNeeded = freqStr.includes('as needed') || freqStr.includes('prn')
      const isWeekly = freqStr.includes('weekly')
      const isBeforeBreakfast = freqStr.includes('before breakfast')
      const isAfterBreakfast = freqStr.includes('after breakfast')
      const isThriceDaily = freqStr.includes('three times') || freqStr.includes('tds') || freqStr.includes('tid')
      const isTwiceDaily = freqStr.includes('twice') || freqStr.includes('bid') || freqStr.includes('bd')
      const hasMorning = freqStr.includes('morning')
      const hasAfternoon = freqStr.includes('afternoon')
      const hasEvening = freqStr.includes('evening') || freqStr.includes('night')

      let scheduledTimes = ['08:00']
      let freqType = 'once_daily'

      if (isAsNeeded) {
        freqType = 'as_needed'
        // Safety requirement: "As needed" medicines must NOT automatically become fixed-dose reminders!
        scheduledTimes = []
      } else if (isWeekly) {
        freqType = 'weekly'
        scheduledTimes = ['09:00'] // e.g. Sunday 09:00 AM
      } else if (isThriceDaily || (hasMorning && hasAfternoon && hasEvening)) {
        freqType = 'thrice_daily'
        scheduledTimes = ['08:00', '14:00', '20:00'] // Morning, Afternoon, Evening alarms
      } else if (isTwiceDaily || (hasMorning && hasEvening)) {
        freqType = 'twice_daily'
        scheduledTimes = ['08:00', '20:00'] // Morning and Evening alarms
      } else if (isBeforeBreakfast) {
        freqType = 'once_daily'
        scheduledTimes = ['07:30']
      } else if (isAfterBreakfast || hasMorning) {
        freqType = 'once_daily'
        scheduledTimes = ['08:30']
      } else if (hasAfternoon) {
        freqType = 'once_daily'
        scheduledTimes = ['14:00']
      } else if (hasEvening) {
        freqType = 'once_daily'
        scheduledTimes = ['20:00']
      }

      if (isAsNeeded) {
        // As-needed schedule entry with reminder_enabled = false
        newSchedules.push({
          id: `sched-${newPlanId}-${idx}`,
          medication_plan_id: newPlanId,
          patient_id: patientId,
          medicine_id: med.id,
          medicine_name: med.medicine_name,
          brand_name: med.brand_name,
          strength: med.strength,
          dose: med.dose,
          frequency_type: 'as_needed',
          scheduled_time: null,
          reminder_enabled: false, // Strictly false for as-needed
          instruction: `${med.dose} as needed. ${med.special_instruction || ''}`,
          urdu_instruction: med.urdu_instruction || 'ضرورت پڑنے پر استعمال کریں۔',
          food_instruction: med.food_instruction
        })
      } else {
        scheduledTimes.forEach((time, tIdx) => {
          newSchedules.push({
            id: `sched-${newPlanId}-${idx}-${tIdx}`,
            medication_plan_id: newPlanId,
            patient_id: patientId,
            medicine_id: med.id,
            medicine_name: med.medicine_name,
            brand_name: med.brand_name,
            strength: med.strength,
            dose: med.dose,
            frequency_type: freqType,
            scheduled_time: time,
            reminder_enabled: true,
            instruction: `${med.dose} at ${time}. ${med.special_instruction || ''}`,
            urdu_instruction: med.urdu_instruction,
            food_instruction: med.food_instruction
          })
        })
      }
    })

    state.schedules = [...newSchedules, ...(state.schedules || [])]
    saveAppState(state)

    return newPlan
  },

  async getActivePlan(patientId) {
    const state = getAppState()
    return (state.medication_plans || []).find(p => (!patientId || p.patient_id === patientId) && p.status === 'approved') || null
  },

  async getPatientSchedules(patientId) {
    const state = getAppState()
    return (state.schedules || []).filter(s => !patientId || s.patient_id === patientId)
  },

  /**
   * Adherence dose reporting: taken, skipped, remind_later
   * Strictly marked as "Patient reported"
   */
  async recordDoseAction({ patientId, scheduleId, action, notes = '' }) {
    const state = getAppState()
    const schedule = (state.schedules || []).find(s => s.id === scheduleId)
    const timestamp = new Date().toISOString()

    const logEntry = {
      id: `log-${Date.now()}`,
      patient_id: patientId || 'user-pat-01',
      medication_schedule_id: scheduleId,
      medicine_name: schedule ? schedule.medicine_name : 'Prescribed Medicine',
      dose: schedule ? schedule.dose : '',
      action, // 'taken' | 'skipped' | 'remind_later'
      recorded_at: timestamp,
      notes,
      label: action === 'taken' 
        ? 'Patient reported taken'
        : action === 'skipped'
        ? 'Patient reported skipped'
        : 'Patient requested remind later'
    }

    state.logs = [logEntry, ...(state.logs || [])]
    saveAppState(state)

    // Audit log
    await auditService.logAction({
      userId: patientId,
      userRole: 'patient',
      action: `Dose Event: ${logEntry.label}`,
      entityType: 'medication_log',
      entityId: logEntry.id,
      details: `${logEntry.label} for ${logEntry.medicine_name} at ${new Date().toLocaleTimeString()}`
    })

    // If remind later was selected, dispatch simulated in-app alert for 10 minutes later
    if (action === 'remind_later') {
      await notificationService.notify({
        userId: patientId,
        type: 'reminder_snoozed',
        title: 'Reminder Postponed',
        message: `Your reminder for ${logEntry.medicine_name} will alert you again shortly.`
      })
    }

    return logEntry
  },

  async getMedicationLogs(patientId) {
    const state = getAppState()
    return (state.logs || []).filter(l => !patientId || l.patient_id === patientId)
  },

  /**
   * Patient Teach-Back ("Check your understanding")
   */
  async submitTeachBack({ planId, patientId, teachBackText }) {
    const state = getAppState()
    const index = (state.medication_plans || []).findIndex(p => p.id === planId)
    if (index === -1) throw new Error('Medication plan not found.')

    state.medication_plans[index].teach_back_text = teachBackText
    state.medication_plans[index].teach_back_status = 'submitted'
    state.medication_plans[index].teach_back_submitted_at = new Date().toISOString()
    saveAppState(state)

    // Audit Log
    await auditService.logAction({
      userId: patientId,
      userRole: 'patient',
      action: 'Patient Submitted Teach-Back',
      entityType: 'medication_plan',
      entityId: planId,
      details: `Patient submitted comprehension statement for pharmacist review: "${teachBackText}"`
    })

    // Notify Care Pharmacist
    await notificationService.notify({
      userId: 'user-phm-01',
      type: 'teach_back_review',
      title: 'Teach-Back Explanation Submitted',
      message: `Patient has submitted their understanding of the medication plan for pharmacist verification.`,
      linkUrl: `/pharmacist/counselling`
    })

    return state.medication_plans[index]
  }
}
