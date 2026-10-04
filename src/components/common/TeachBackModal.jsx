import React, { useState } from 'react'
import { CheckCircle2, MessageSquareText, Send } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Textarea } from './Input'
import { medicationService } from '../../services/medicationService'
import { useLanguage } from '../../contexts/LanguageContext'

export function TeachBackModal({ isOpen, onClose, plan, patientId, onSubmitted }) {
  const { t, language } = useLanguage()
  const [explanation, setExplanation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!explanation.trim()) return

    setSubmitting(true)
    try {
      await medicationService.submitTeachBack({
        planId: plan?.id,
        patientId,
        teachBackText: explanation.trim()
      })
      setSubmitted(true)
      if (onSubmitted) onSubmitted()
      setTimeout(() => {
        setSubmitted(false)
        setExplanation('')
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Teach back error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('teach_back.title', 'Check Your Understanding (Teach-Back)')}
      maxWidth="max-w-lg"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {language === 'ur' ? 'جواب موصول ہو گیا' : 'Submitted for Pharmacist Review'}
          </h4>
          <p className="text-sm text-slate-600">
            {t('teach_back.submitted', 'Your explanation has been sent to your care pharmacist for review.')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 leading-relaxed">
            <p className="font-semibold mb-1">
              {t('teach_back.subtitle', 'In your own words, explain how and when you will take your approved medications.')}
            </p>
            <p className="text-emerald-700">
              {language === 'ur'
                ? 'فارماسسٹ اس بات کی تصدیق کرے گا کہ آپ کے استعمال کا طریقہ ڈاکٹر کے منظور کردہ علاج کے عین مطابق ہے۔'
                : 'Your Care Pharmacist will review your answer to ensure all instructions, timings, and safety steps are completely understood.'}
            </p>
          </div>

          <Textarea
            label={t('teach_back.prompt', 'How will you take this medicine?')}
            placeholder={
              language === 'ur'
                ? 'مثلاً: میں زینوو روزانہ صبح ناشتے سے پہلے لوں گا اور تیرزی انجکشن ہفتے میں ایک بار...'
                : 'e.g. I will take Zanov capsule every morning before breakfast with water, and Methix after breakfast...'
            }
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
            </Button>
            <Button type="submit" loading={submitting} disabled={!explanation.trim()} icon={Send}>
              {t('teach_back.submit', 'Submit for Care Pharmacist Review')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
