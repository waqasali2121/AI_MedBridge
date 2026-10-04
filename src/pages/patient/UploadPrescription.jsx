import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileCheck2,
  FileUp,
  Image,
  Loader2,
  UploadCloud,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { prescriptionService } from '../../services/prescriptionService'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { LanguageToggle } from '../../components/common/LanguageToggle'

export function UploadPrescription() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [stage, setStage] = useState('idle') // 'idle' | 'uploading' | 'extracting' | 'done'
  const [error, setError] = useState(null)

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return
    setError(null)

    // Check size limit: 10MB
    const maxBytes = 10 * 1024 * 1024
    if (selectedFile.size > maxBytes) {
      setError('File size exceeds the 10 MB limit.')
      return
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please provide a PDF or image (JPG, PNG, WEBP).')
      return
    }

    setFile(selectedFile)

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError(null)
    setStage('uploading')

    try {
      // Step A: Upload simulation
      await new Promise(r => setTimeout(r, 600))
      setStage('extracting')

      // Step B: Assistive AI Extraction
      const newRx = await prescriptionService.uploadPrescription({
        file,
        patientId: user?.id,
        patientName: user?.full_name,
        mrn: user?.patient_details?.mrn
      })

      setStage('done')
      setTimeout(() => {
        navigate(`/patient/prescriptions/${newRx.id}`)
      }, 1000)
    } catch (err) {
      setError(err.message || 'Unable to process prescription upload.')
      setStage('idle')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Title and Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {language === 'ur' ? 'نیا نسخہ اپ لوڈ کریں' : 'Upload Prescription'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ur'
              ? 'اپنے نسخے کی تصویر یا پی ڈی ایف فائل اپ لوڈ کریں'
              : 'Upload a prescription PDF or clear camera photo for care team verification'}
          </p>
        </div>
        <LanguageToggle />
      </div>

      <Card className="space-y-5 p-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Zone */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 bg-slate-50/60 dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFileSelection(e.target.files?.[0])}
            />

            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {language === 'ur'
                  ? 'پی ڈی ایف یا تصویر یہاں ڈریگ کریں یا کلک کریں'
                  : 'Drag and drop your prescription PDF or image'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports PDF, JPG, PNG, WEBP (Max 10 MB)
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Browse Files
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
              <span className="text-xs font-semibold px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors">
                <Camera className="w-3.5 h-3.5" /> Mobile Camera
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected File Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
                  {file.type === 'application/pdf' ? <FileUp className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                  </p>
                </div>
              </div>

              {!uploading && (
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null) }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Image Preview if applicable */}
            {previewUrl && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-64 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center p-2">
                <img src={previewUrl} alt="Prescription preview" className="max-h-60 object-contain rounded" />
              </div>
            )}

            {/* Upload & Extraction Progress States */}
            {stage === 'uploading' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Prescription uploaded successfully. Preparing extraction...</span>
              </div>
            )}

            {stage === 'extracting' && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>Extracting prescription information via assistive parser...</span>
              </div>
            )}

            {stage === 'done' && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold">Extraction completed! Redirecting to clinical review screen...</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                disabled={uploading}
                onClick={() => { setFile(null); setPreviewUrl(null) }}
              >
                Choose Different File
              </Button>
              <Button
                type="button"
                loading={uploading}
                onClick={handleSubmit}
                icon={FileCheck2}
              >
                Process & Extract Prescription
              </Button>
            </div>
          </div>
        )}

        {/* AI & Medical Disclaimer Notice */}
        <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Assistive Draft Rule:</p>
          <p>
            AI automatically transcribes drug names, dosages, and instructions into a preliminary draft. It is strictly assistive and <strong className="text-slate-600 dark:text-slate-300">never prescribes or changes medicine</strong>. Any unclear handwriting is flagged for pharmacist and physician verification.
          </p>
        </div>
      </Card>
    </div>
  )
}
