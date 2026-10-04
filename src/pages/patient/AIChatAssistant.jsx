import React, { useState, useRef, useEffect } from 'react'
import { Send, ShieldAlert, Bot, User, Stethoscope, BriefcaseMedical } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { caseService } from '../../services/caseService'
import { aiService } from '../../services/aiService'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { useNavigate } from 'react-router-dom'

export function AIChatAssistant() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'Patient'}, I am your AI Medication Assistant, powered by securely verified data from your pharmacy and clinical guidelines. I can answer questions about your medicines. Important: I am an AI, not a doctor. If you have symptoms, I will escalate to your care team. How can I help you today?`
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalationData, setEscalationData] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue
    }
    
    setMessages(prev => [...prev, newMsg])
    setInputValue('')
    setLoading(true)
    setEscalationData(null) // clear previous escalation

    try {
      const response = await aiService.processChat(newMsg.text)
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        isWarning: response.text.includes('⚠️')
      }
      
      if (response.escalationType) {
        // Automatically create the case based on P0 safety rules
        const newCase = await caseService.openCase({
          patientId: user?.id,
          patientName: user?.full_name,
          concernType: response.concernType,
          symptomsChanged: newMsg.text,
          isUrgent: response.escalationType === 'doctor'
        })
        
        botMsg.text = `${response.text}\n\n**Your question has been automatically sent for medication-support review.**\n- Case ID: ${newCase.id}\n- Status: Awaiting ${response.escalationType === 'doctor' ? 'Physician' : 'Pharmacist'} Review`
        botMsg.isWarning = true
      }
      
      setMessages(prev => [...prev, botMsg])
      
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: 'Sorry, I encountered an error. Please try again.', isWarning: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AI Health Assistant</h1>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Secure AI Engine • Verified Medical Knowledge
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
          Chat History Saved
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl shadow-sm text-sm ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : msg.isWarning 
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800 rounded-tl-none font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-tl-none'
              }`}>
                {/* Parse basic markdown (bold) quickly for demo */}
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          </div>
        ))}

        {loading && !escalationData && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 animate-pulse">
                Thinking...
              </div>
            </div>
          </div>
        )}
        

        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your medication question here..."
            className="flex-1 mb-0 shadow-inner bg-slate-50 dark:bg-slate-800"
            disabled={loading}
          />
          <Button type="submit" variant="primary" size="lg" disabled={!inputValue.trim() || loading} icon={Send} className="px-6 shadow-md rounded-xl">
             Send
          </Button>
        </form>
        <div className="text-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-emerald-500" /> 
            AI responses do not substitute professional medical advice. Always ask your pharmacist or doctor if unsure.
          </p>
        </div>
      </div>
    </div>
  )
}
