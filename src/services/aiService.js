import { getAppState } from './mockData'

export const aiService = {
  processChat: async (message) => {
    // Basic heuristics to act as RAG assistant and triage
    const lowerMessage = message.toLowerCase()
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check for MRN queries
    const mrnMatch = lowerMessage.match(/mrn:\s*(\d+)/i)
    if (mrnMatch) {
      const mrn = mrnMatch[1]
      const state = getAppState()
      
      // Find patient by MRN
      const patient = (state.users || []).find(u => u.patient_details?.mrn === mrn)
      if (!patient) {
        return {
          text: `I could not find any active patient records for MRN: ${mrn}. Please verify the number or contact support.`,
          escalationType: null,
          concernType: 'other'
        }
      }

      // Find active medication plan
      const activePlan = (state.medication_plans || []).find(p => p.patient_id === patient.id && p.status === 'approved')
      
      if (!activePlan || !activePlan.medicines || activePlan.medicines.length === 0) {
        return {
          text: `I found your record (MRN: ${mrn}, ${patient.full_name.split(' ')[0]}), but you do not currently have any active or approved medication plans. If you recently uploaded a prescription, it may still be pending verification by your Care Pharmacist.`,
          escalationType: null,
          concernType: 'other'
        }
      }

      const medicinesList = activePlan.medicines.map(m => {
        let text = `- **${m.medicine_name} ${m.strength || ''}**\n  - Dose: ${m.dose || ''} ${m.frequency || ''}\n  - Instructions: ${m.special_instruction || 'Use as directed.'}`
        if(m.food_instruction && m.food_instruction.toLowerCase() !== 'none') {
           text += `\n  - Note: ${m.food_instruction}`
        }
        return text
      }).join('\n\n')

      return {
        text: `Here is the verified medication information for MRN **${mrn}** (${patient.full_name}) as approved by your doctor and pharmacist:\n\n${medicinesList}\n\nPlease take these exactly as scheduled on your dashboard.`,
        escalationType: null,
        concernType: 'other'
      }
    }

    if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart') || lowerMessage.includes('emergency')) {
       return {
         text: "⚠️ **I cannot safely answer this question without review from your care team.**\n\nFor symptoms like chest pain, this requires immediate, urgent clinical triage. Please contact emergency services immediately or proceed to the nearest emergency room.",
         escalationType: 'doctor',
         concernType: 'urgent_symptom'
       }
    }
    
    if (lowerMessage.includes('what medicine') || lowerMessage.includes('should i take') || lowerMessage.includes('prescribe')) {
       return {
         text: "⚠️ **I cannot recommend or prescribe medications.**\n\nI can only answer questions about medications that have been officially approved on your MedBridge plan. Your question has been flagged for medical review.",
         escalationType: 'doctor',
         concernType: 'medication_change'
       }
    }
    
    if (lowerMessage.includes('double') || lowerMessage.includes('miss') || lowerMessage.includes('forget')) {
       return {
         text: "⚠️ **I cannot safely provide missed-dose instructions without validated drug-specific guidance.**\n\nPlease contact your care pharmacist for proper guidance on whether to skip or take your missed dose.",
         escalationType: 'pharmacist',
         concernType: 'missed_doses'
       }
    }

    if (lowerMessage.includes('not working') || lowerMessage.includes('better')) {
       return {
         text: "It sounds like you feel the treatment is not improving your condition. This requires a clinical reassessment by your doctor.",
         escalationType: 'doctor',
         concernType: 'not_improving'
       }
    }

    if (lowerMessage.includes('increase') || lowerMessage.includes('decrease') || lowerMessage.includes('change')) {
      return {
         text: "⚠️ **I cannot alter your medication dosage.**\n\nAny changes to your therapy must be authorized by your physician. Would you like to submit a request for your doctor to review your treatment plan?",
         escalationType: 'doctor',
         concernType: 'medication_change'
      }
    }

    return {
      text: "As your AI Assistant, I can answer basic questions about your verified medication plans based on approved general knowledge. Always adhere to the schedule approved by your Care Pharmacist and Doctor. If you have specific medical concerns, click below to escalate them to your healthcare team.",
      escalationType: 'pharmacist', // Offer general triage
      concernType: 'other'
    }
  }
}
