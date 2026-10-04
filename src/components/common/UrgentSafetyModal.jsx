import React from 'react'
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useLanguage } from '../../contexts/LanguageContext'

export function UrgentSafetyModal({ isOpen, onClose }) {
  const { t, language } = useLanguage()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Urgent Clinical Safety Alert" maxWidth="max-w-md">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-bold text-rose-900">
            {language === 'ur' ? 'فوری طبی امداد کی ضرورت' : 'Please Seek Urgent Emergency Medical Care'}
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'ur'
              ? 'آپ کی بتائی گئی علامات کو فوری ہسپتالی معائنے کی ضرورت ہو سکتی ہے۔ ایپ میں معالج کے جواب کا انتظار نہ کریں اور فوراً قریبی ہسپتال یا ایمرجنسی سروس سے رابطہ کریں۔'
              : 'The symptoms you described may require prompt in-person clinical assessment. Do not wait for an asynchronous message reply in this app. Please visit your nearest hospital emergency department or contact emergency medical services immediately.'}
          </p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left rtl:text-right space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Emergency Guidelines (Pakistan)</span>
          </div>
          <p>• Rescue 1122 (Ambulance & Emergency Response)</p>
          • Prime Health Hub Dew Emergency: 042-35720011
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <a
            href="tel:1122"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Rescue 1122</span>
          </a>
          <Button variant="outline" onClick={onClose}>
            {language === 'ur' ? 'میں سمجھ گیا / سمجھ گئی' : 'I Understand & Acknowledge'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
