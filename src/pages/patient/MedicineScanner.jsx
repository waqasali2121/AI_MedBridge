import React, { useState, useRef } from 'react'
import { Camera, Search, AlertTriangle, CheckCircle, PackageSearch, X } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { medicationService } from '../../services/medicationService'
import { useAuth } from '../../contexts/AuthContext'

export function MedicineScanner() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [scanState, setScanState] = useState('idle') // idle, scanning, result
  const [image, setImage] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [activePlan, setActivePlan] = useState(null)

  React.useEffect(() => {
    medicationService.getActivePlan(user?.id).then(setActivePlan)
  }, [user])

  const handleCapture = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImage(URL.createObjectURL(file))
    setScanState('scanning')

    // Simulate OCR delay & matching logic
    setTimeout(() => {
      // Mocking OCR result for a positive match demo ("Amoxicillin 500mg")
      const scannedName = "Amoxicillin 500 mg"
      const isMatch = activePlan?.medicines?.some(med => 
        med.medicine_name.toLowerCase().includes('amoxicillin')
      ) || true // Forced true for demo if empty plan

      setMatchResult({
        scannedName,
        isMatch: isMatch,
        strength: "500 mg",
        form: "Capsule"
      })
      setScanState('result')
    }, 2000)
  }

  const resetScanner = () => {
    setImage(null)
    setMatchResult(null)
    setScanState('idle')
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
          <PackageSearch className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          Scan Medicine
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Take a photo of a medicine box to check if it matches your approved prescription.
        </p>
      </div>

      <Card className="p-4 space-y-6">
        {scanState === 'idle' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-400/50 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">Tap to Scan Medicine Box</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Make sure the medicine name and strength are clearly visible</p>
            </div>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleCapture}
        />

        {scanState === 'scanning' && (
          <div className="space-y-4 text-center py-8">
            <Search className="w-10 h-10 animate-pulse text-emerald-600 dark:text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Reading Package Text...</p>
            <img src={image} alt="Scanning" className="w-48 h-48 object-cover rounded-xl mx-auto opacity-50 blur-sm" />
          </div>
        )}

        {scanState === 'result' && matchResult && (
          <div className="space-y-6">
            <div className="relative">
              <img src={image} alt="Scanned Result" className="w-full h-48 object-cover rounded-xl shadow-md" />
              <button 
                onClick={resetScanner}
                className="absolute top-2 right-2 bg-slate-900/60 p-1.5 rounded-full text-white hover:bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scanned Information</h3>
              <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{matchResult.scannedName}</p>
              
              <div className="flex gap-2">
                 <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 flex items-center rounded-sm font-bold text-slate-700 dark:text-slate-300">Strength: {matchResult.strength}</span>
                 <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 flex items-center rounded-sm font-bold text-slate-700 dark:text-slate-300">Form: {matchResult.form}</span>
              </div>
            </div>

            {matchResult.isMatch ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 rounded-r-lg space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold">
                  <CheckCircle className="w-5 h-5" /> Positive Match Found
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  This medicine matches an item in your current approved prescription plan.
                </p>
                <p className="text-[10px] bg-emerald-100 dark:bg-emerald-800/40 p-2 rounded text-emerald-800 dark:text-emerald-200 mt-2 italic">
                  Note: Please ask your pharmacist to confirm before using a different brand or product.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-5 h-5" /> No Direct Match
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  These products are not explicitly confirmed as interchangeable in your active plan.
                </p>
                <p className="text-[10px] font-bold text-amber-900 dark:text-amber-200 mt-2">
                  Please ask a qualified healthcare professional before taking this medicine.
                </p>
              </div>
            )}
            
            <Button className="w-full" onClick={resetScanner}>Scan Another Box</Button>
          </div>
        )}
      </Card>
      
      {/* Disclaimer */}
      <div className="text-[10px] text-center text-slate-400">
        AI package scanning is assistive only and does not guarantee clinical equivalence.
      </div>
    </div>
  )
}
