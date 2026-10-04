export const aiService = {
  processChat: async (message) => {
    // Basic heuristics to act as RAG assistant and triage
    const lowerMessage = message.toLowerCase()
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800))

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
