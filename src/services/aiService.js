export const aiService = {
  processChat: async (message) => {
    // Basic heuristics to act as RAG assistant and triage
    const lowerMessage = message.toLowerCase()
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800))

    if (lowerMessage.includes('after breakfast') || lowerMessage.includes('meal') || lowerMessage.includes('food')) {
       return {
         text: "According to your uploaded prescriptions and pharmacist counselling, your medications generally come with specific food instructions. However, changes to meal timing might require clinical review. Would you like me to create a case for a pharmacist to review?",
         escalationType: 'pharmacist',
         concernType: 'other'
       }
    }
    
    if (lowerMessage.includes('side effect') || lowerMessage.includes('pain') || lowerMessage.includes('dizzy') || lowerMessage.includes('nausea') || lowerMessage.includes('vomit') || lowerMessage.includes('emergency')) {
       return {
         text: "⚠️ **This may require urgent medical attention.** Please contact emergency medical services or seek immediate medical care if you are experiencing severe symptoms. I cannot diagnose you. Would you like me to escalate this to your physician for review?",
         escalationType: 'doctor',
         concernType: 'suspected_side_effect'
       }
    }
    
    if (lowerMessage.includes('miss') || lowerMessage.includes('forget')) {
       return {
         text: "If you missed a dose, typically you should not double the next dose. However, different medications have different rules. Should I refer this question to your pharmacist for proper guidance?",
         escalationType: 'pharmacist',
         concernType: 'missed_doses'
       }
    }

    if (lowerMessage.includes('not working') || lowerMessage.includes('better')) {
       return {
         text: "It sounds like you feel the treatment is not improving your condition. This requires a clinical reassessment by your doctor. Would you like to submit a request for your doctor to review your treatment plan?",
         escalationType: 'doctor',
         concernType: 'not_improving'
       }
    }

    if (lowerMessage.includes('interaction') || lowerMessage.includes('together') || lowerMessage.includes('with')) {
      return {
         text: "Drug interactions can be complex and depends on the specific medications and your health profile. While I have access to general drug interaction databases, this requires professional judgment. Would you like to ask your Care Pharmacist?",
         escalationType: 'pharmacist',
         concernType: 'other'
      }
    }

    return {
      text: "As your AI Assistant, I can answer basic questions about your verified medication plans. Based on our clinical safeguards, always adhere to the schedule approved by your Care Pharmacist and Doctor. If you have specific medical concerns, I can help you escalate them to your healthcare team. How else can I assist you?",
      escalationType: null
    }
  }
}
